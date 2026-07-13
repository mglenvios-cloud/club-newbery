const express = require('express');
const prisma = require('../prismaClient');
const router = express.Router();

// Lista de palabras ofensivas a moderar automáticamente
const PALABRAS_PROHIBIDAS = [
  'mierda', 'puto', 'puta', 'boludo', 'boluda', 'pelotudo', 'pelotuda', 
  'concha', 'orto', 'cagar', 'cagon', 'idiota', 'estupido', 'estupida', 
  'tarado', 'tarada', 'forro', 'forra', 'culiado', 'culiada', 'hdp'
];

// Moderación por IA / Local de contingencia
async function moderarContenido(content) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const textoLimpio = content.toLowerCase();

  // Heurística local de contingencia (siempre activa como primer filtro o fallback)
  const contieneOfensas = PALABRAS_PROHIBIDAS.some(palabra => textoLimpio.includes(palabra));
  if (contieneOfensas) {
    return { aprobado: false, razon: 'Lenguaje inapropiado o vulgar (Filtro Local)' };
  }
  if (textoLimpio.length < 5) {
    return { aprobado: false, razon: 'Contenido demasiado corto' };
  }

  // Si no hay API Key, retornar aprobado (ya pasó el filtro de palabras prohibidas)
  if (!GEMINI_API_KEY) {
    return { aprobado: true };
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `Analiza si este texto escrito por un niño de 5 a 12 años es seguro para publicar en el muro infantil del club (sin insultos encubiertos, acoso escolar, agresiones o bullying). Texto: "${content}"` }
            ]
          }
        ],
        systemInstruction: {
          parts: [
            { text: "Sos un moderador infantil del club Jorge Newbery. Tu respuesta debe ser ESTRICTAMENTE en formato JSON plano: { \"aprobado\": true o false, \"razon\": \"motivo en español si es falso, de lo contrario null\" }. No agregues bloques de código markdown, solo el JSON plano." }
          ]
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      // Limpiar posibles bloques markdown de código ```json ... ``` si la IA los agrega
      const cleaned = reply.replace(/```json|```/g, "").trim();
      const result = JSON.parse(cleaned);
      return {
        aprobado: !!result.aprobado,
        razon: result.razon || null
      };
    }
  } catch (err) {
    console.error("[Gemini Moderation Error]", err);
  }

  // Fallback si la llamada de API falla
  return { aprobado: true };
}

// Obtener todas las publicaciones aprobadas
router.get('/', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las publicaciones' });
  }
});

// Obtener publicaciones pendientes (Para ADMIN)
router.get('/pending', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { isApproved: false },
      orderBy: { createdAt: 'desc' }
    });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener publicaciones pendientes' });
  }
});

// Crear una nueva publicación con moderación automática
router.post('/', async (req, res) => {
  const { authorName, authorAge, category, content, drawingUrl, type } = req.body;
  try {
    if (!authorName || authorAge === undefined || !category || !content) {
      return res.status(400).json({ error: 'Faltan campos requeridos: autor, edad, categoría o contenido' });
    }

    const resultadoModeracion = await moderarContenido(content);

    const post = await prisma.post.create({
      data: {
        authorName,
        authorAge: parseInt(authorAge),
        category,
        content,
        drawingUrl,
        type: type || 'TEXT',
        isApproved: resultadoModeracion.aprobado // Si aprueba el filtro, se publica inmediatamente
      }
    });

    res.status(201).json({
      post,
      moderated: !resultadoModeracion.aprobado,
      reason: resultadoModeracion.aprobado ? null : resultadoModeracion.razon
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la publicación' });
  }
});

// Aprobar una publicación (ADMIN)
router.put('/:id/approve', async (req, res) => {
  const { id } = req.params;
  try {
    const post = await prisma.post.update({
      where: { id: parseInt(id) },
      data: { isApproved: true }
    });
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al aprobar la publicación' });
  }
});

// Dar Like a una publicación
router.post('/:id/like', async (req, res) => {
  const { id } = req.params;
  try {
    const post = await prisma.post.update({
      where: { id: parseInt(id) },
      data: { likes: { increment: 1 } }
    });
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al dar me gusta' });
  }
});

// Eliminar/Rechazar publicación (ADMIN)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.post.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Publicación eliminada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la publicación' });
  }
});

module.exports = router;
