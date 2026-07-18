const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const { JWT_SECRET } = require('../config/env');

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Middleware to enforce ADMIN, OPERADOR or SUPER_ADMIN roles
const requireAdminOrOperator = (req, res, next) => {
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'OPERADOR' && req.user.role !== 'SUPER_ADMIN')) {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador o productor operador.' });
  }
  next();
};

// ─── GET /api/live ─────────────────────────────────────────────────────────
// Devuelve el partido EN VIVO activo con sus eventos
router.get('/', async (req, res) => {
  try {
    // Primero buscar LIVE, sino UPCOMING más próximo
    let match = await prisma.futsalMatch.findFirst({
      where: { status: 'LIVE' },
      orderBy: { date: 'desc' }
    });

    if (!match) {
      match = await prisma.futsalMatch.findFirst({
        where: { status: 'UPCOMING' },
        orderBy: { date: 'asc' }
      });
    }

    if (!match) {
      return res.json({ match: null, events: [] });
    }

    const events = await prisma.liveMatchEvent.findMany({
      where: { matchId: match.id },
      orderBy: { minute: 'asc' }
    });

    res.json({ match, events });
  } catch (error) {
    console.error('[Live] Error al obtener partido en vivo:', error);
    res.status(500).json({ error: 'Error al obtener datos del partido en vivo' });
  }
});

// ─── GET /api/live/:id ──────────────────────────────────────────────────────
// Devuelve partido específico con sus eventos
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const match = await prisma.futsalMatch.findUnique({
      where: { id: parseInt(id) }
    });

    if (!match) {
      return res.status(404).json({ error: 'Partido no encontrado' });
    }

    const events = await prisma.liveMatchEvent.findMany({
      where: { matchId: match.id },
      orderBy: { minute: 'asc' }
    });

    res.json({ match, events });
  } catch (error) {
    console.error('[Live] Error al obtener partido:', error);
    res.status(500).json({ error: 'Error al obtener el partido' });
  }
});

// ─── POST /api/live/:id/event ────────────────────────────────────────────────
// Registra un evento del partido (gol, tarjeta, cambio)
router.post('/:id/event', authenticateToken, requireAdminOrOperator, async (req, res) => {
  const { id } = req.params;
  const { type, minute, playerName, team, detail } = req.body;

  try {
    if (!type || minute === undefined) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: type, minute' });
    }

    const event = await prisma.liveMatchEvent.create({
      data: {
        matchId: parseInt(id),
        type,
        minute: parseInt(minute),
        playerName: playerName || '',
        team: team || 'HOME',
        detail: detail || ''
      }
    });

    // Si es gol, actualizar marcador automáticamente
    if (type === 'GOAL') {
      const match = await prisma.futsalMatch.findUnique({ where: { id: parseInt(id) } });
      if (match) {
        const allGoals = await prisma.liveMatchEvent.findMany({
          where: { matchId: parseInt(id), type: 'GOAL' }
        });
        const homeGoals = allGoals.filter(e => e.team === 'HOME').length;
        const awayGoals = allGoals.filter(e => e.team === 'AWAY').length;
        await prisma.futsalMatch.update({
          where: { id: parseInt(id) },
          data: {
            ourScore: homeGoals,
            opponentScore: awayGoals
          }
        });
      }
    }

    res.status(201).json(event);
  } catch (error) {
    console.error('[Live] Error al registrar evento:', error);
    res.status(500).json({ error: 'Error al registrar evento' });
  }
});

// ─── DELETE /api/live/:id/event/:eventId ────────────────────────────────────
// Elimina un evento (corrección de carga)
router.delete('/:id/event/:eventId', authenticateToken, requireAdminOrOperator, async (req, res) => {
  const { id, eventId } = req.params;
  try {
    await prisma.liveMatchEvent.delete({ where: { id: parseInt(eventId) } });

    // Recalcular marcador si era gol
    const allGoals = await prisma.liveMatchEvent.findMany({
      where: { matchId: parseInt(id), type: 'GOAL' }
    });
    const homeGoals = allGoals.filter(e => e.team === 'HOME').length;
    const awayGoals = allGoals.filter(e => e.team === 'AWAY').length;
    await prisma.futsalMatch.update({
      where: { id: parseInt(id) },
      data: { ourScore: homeGoals, opponentScore: awayGoals }
    });

    res.json({ message: 'Evento eliminado correctamente' });
  } catch (error) {
    console.error('[Live] Error al eliminar evento:', error);
    res.status(500).json({ error: 'Error al eliminar evento' });
  }
});

// ─── PUT /api/live/:id/status ───────────────────────────────────────────────
// Actualiza status, minuto actual, y/o estadísticas manuales
router.put('/:id/status', authenticateToken, requireAdminOrOperator, async (req, res) => {
  const { id } = req.params;
  const {
    status,
    liveMinute,
    ourScore,
    opponentScore,
    referee,
    attendance,
    summary
  } = req.body;

  try {
    const data = {};
    if (status !== undefined) data.status = status;
    if (liveMinute !== undefined) data.liveMinute = parseInt(liveMinute);
    if (ourScore !== undefined) data.ourScore = parseInt(ourScore);
    if (opponentScore !== undefined) data.opponentScore = parseInt(opponentScore);
    if (referee !== undefined) data.referee = referee;
    if (attendance !== undefined) data.attendance = parseInt(attendance);
    if (summary !== undefined) data.summary = summary;

    const updated = await prisma.futsalMatch.update({
      where: { id: parseInt(id) },
      data
    });

    res.json(updated);
  } catch (error) {
    console.error('[Live] Error al actualizar estado:', error);
    res.status(500).json({ error: 'Error al actualizar estado del partido' });
  }
});

// ─── POST /api/live/:id/ai-commentary ───────────────────────────────────────
// Genera relato IA con Gemini basado en los eventos del partido
router.post('/:id/ai-commentary', authenticateToken, requireAdminOrOperator, async (req, res) => {
  const { id } = req.params;

  try {
    const match = await prisma.futsalMatch.findUnique({ where: { id: parseInt(id) } });
    if (!match) return res.status(404).json({ error: 'Partido no encontrado' });

    const events = await prisma.liveMatchEvent.findMany({
      where: { matchId: parseInt(id) },
      orderBy: { minute: 'asc' }
    });

    // Construir contexto del partido
    const eventText = events.map(e => {
      const teamLabel = e.team === 'HOME' ? match.homeTeam : match.opponent;
      if (e.type === 'GOAL') return `Min ${e.minute}: ⚽ GOL de ${e.playerName} (${teamLabel})${e.detail ? ' — ' + e.detail : ''}`;
      if (e.type === 'YELLOW_CARD') return `Min ${e.minute}: 🟨 Tarjeta amarilla para ${e.playerName} (${teamLabel})`;
      if (e.type === 'RED_CARD') return `Min ${e.minute}: 🟥 Tarjeta roja para ${e.playerName} (${teamLabel})`;
      if (e.type === 'SUBSTITUTION') return `Min ${e.minute}: 🔄 Cambio en ${teamLabel}: ${e.playerName}${e.detail ? ' → ' + e.detail : ''}`;
      if (e.type === 'PERIOD_START') return `Min ${e.minute}: 🎬 Inicio del ${e.detail || 'período'}`;
      if (e.type === 'PERIOD_END') return `Min ${e.minute}: 🏁 Fin del ${e.detail || 'período'}`;
      return `Min ${e.minute}: ${e.type} — ${e.playerName}`;
    }).join('\n');

    const score = `${match.ourScore ?? 0} - ${match.opponentScore ?? 0}`;
    const prompt = `Sos el relator oficial del Club Jorge Newbery. Estás narrando un partido de Futsal AFA.

Partido: ${match.homeTeam} vs ${match.opponent}
Competición: ${match.competition}
Estado: ${match.status === 'LIVE' ? 'EN VIVO — Minuto ' + (match.liveMinute || 0) : match.status}
Marcador actual: ${score}

Eventos del partido:
${eventText || 'El partido acaba de comenzar, no hay eventos registrados aún.'}

Escribí un relato emocionante, apasionado y detallado del partido en estilo periodístico deportivo argentino. Máximo 4 párrafos. Mencioná los eventos clave, el estado del juego y el ánimo del equipo. Usá palabras como "tremendo", "espectacular", "el Newbery", etc.`;

    let commentary = '';

    if (GEMINI_API_KEY) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: {
            parts: [{ text: 'Sos un relator deportivo argentino apasionado, especializado en futsal. Tus relatos son vibrantes, emotivos y llenos de jerga futbolera argentina.' }]
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        commentary = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
    }

    if (!commentary) {
      commentary = `¡El ${match.homeTeam} está dando pelea en este ${match.competition}! ${events.length > 0 ? `Con ${events.filter(e => e.type === 'GOAL').length} gol(es) anotados, el equipo demuestra su calidad.` : 'El partido recién arranca y el Newbery ya muestra su poderío en cancha.'} El marcador refleja el esfuerzo de toda la plantilla. ¡Vamos Newbery!`;
    }

    // Guardar relato en la base de datos
    await prisma.futsalMatch.update({
      where: { id: parseInt(id) },
      data: { aiCommentary: commentary }
    });

    res.json({ commentary });
  } catch (error) {
    console.error('[Live] Error al generar relato IA:', error);
    res.status(500).json({ error: 'Error al generar relato IA' });
  }
});

// ─── POST /api/live/:id/auto-summary ────────────────────────────────────────
// Genera resumen automático post-partido con Gemini
router.post('/:id/auto-summary', authenticateToken, requireAdminOrOperator, async (req, res) => {
  const { id } = req.params;

  try {
    const match = await prisma.futsalMatch.findUnique({ where: { id: parseInt(id) } });
    if (!match) return res.status(404).json({ error: 'Partido no encontrado' });

    const events = await prisma.liveMatchEvent.findMany({
      where: { matchId: parseInt(id) },
      orderBy: { minute: 'asc' }
    });

    const goals = events.filter(e => e.type === 'GOAL');
    const yellowCards = events.filter(e => e.type === 'YELLOW_CARD');
    const redCards = events.filter(e => e.type === 'RED_CARD');
    const substitutions = events.filter(e => e.type === 'SUBSTITUTION');

    const homeGoals = goals.filter(e => e.team === 'HOME');
    const awayGoals = goals.filter(e => e.team === 'AWAY');

    const result = (match.ourScore ?? 0) > (match.opponentScore ?? 0) ? 'VICTORIA' :
                   (match.ourScore ?? 0) < (match.opponentScore ?? 0) ? 'DERROTA' : 'EMPATE';

    const prompt = `Sos el periodista oficial del Club Jorge Newbery. Escribí un resumen post-partido profesional para la web del club.

Partido: ${match.homeTeam} ${match.ourScore ?? 0} - ${match.opponentScore ?? 0} ${match.opponent}
Resultado: ${result}
Competición: ${match.competition}
Sede: ${match.venue}
Asistencia: ${match.attendance ?? 0} personas

Goles del Newbery: ${homeGoals.map(g => `${g.playerName} (min ${g.minute}${g.detail ? ', ' + g.detail : ''})`).join(', ') || 'Ninguno'}
Goles del rival: ${awayGoals.map(g => `Min ${g.minute}`).join(', ') || 'Ninguno'}
Tarjetas amarillas: ${yellowCards.length}
Tarjetas rojas: ${redCards.length}
Cambios realizados: ${substitutions.length}

Escribí un resumen periodístico de 3 párrafos: uno sobre el resultado y los goles, otro sobre el rendimiento general del equipo, y uno de cierre inspirador. Estilo diario deportivo argentino.`;

    let summary = '';

    if (GEMINI_API_KEY) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        summary = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
    }

    if (!summary) {
      const scoreStr = `${match.ourScore ?? 0} - ${match.opponentScore ?? 0}`;
      summary = `El Club Jorge Newbery cerró un partido memorable frente a ${match.opponent} con un resultado de ${scoreStr} en el ${match.competition}. ${result === 'VICTORIA' ? 'Una victoria que suma puntos importantes en la tabla.' : result === 'EMPATE' ? 'Un justo empate que refleja el nivel de ambos equipos.' : 'Una derrota que sirve de lección para seguir trabajando.'} El plantel demostró compromiso y entrega en cada minuto del encuentro. ¡Vamos Newbery!`;
    }

    // Guardar resumen en la base de datos
    await prisma.futsalMatch.update({
      where: { id: parseInt(id) },
      data: { autoSummary: summary }
    });

    res.json({ summary });
  } catch (error) {
    console.error('[Live] Error al generar resumen:', error);
    res.status(500).json({ error: 'Error al generar resumen automático' });
  }
});

module.exports = router;
