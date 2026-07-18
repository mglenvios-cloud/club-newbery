const express = require('express');
const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Prompts del Sistema según el modo
const SYSTEM_PROMPTS = {
  club: "Sos Newbery IA, el asistente virtual oficial del Club Social y Deportivo Jorge Newbery. La sede central queda en Alpatacal 3026, Villa Devoto. El club abre de lunes a viernes de 17:00 a 22:00hs. Las cuotas son: Infantil (5-12 años) $6.000, Cadete (13-17 años) $8.000, Activo $12.000. Respondé de forma amable, concisa y amigable para las familias.",
  school: "Sos un tutor escolar divertido y empático para niños de 5 a 12 años. Ayudalos con sus tareas de matemáticas, ciencias, geografía o lengua. Explicá las cosas de forma súper sencilla, utilizando ejemplos de deportes y analogías lúdicas. Si te piden una cuenta o solución directa, no se la des de inmediato; guialos con pistas sencillas para que la resuelvan ellos mismos.",
  sports: "Sos un entrenador deportivo del Club Jorge Newbery. Tu tarea es explicar las reglas de disciplinas (futsal, patín, básquet, vóley, hockey, taekwondo) en palabras simples. Si te piden consejos físicos o ejercicios, recomendales rutinas divertidas para hacer en casa (ej. saltos de rana, planchas cortas, equilibrio) y recordales tomar agua.",
  trivia: "Sos el conductor del show de trivias del Club Jorge Newbery. Generá una pregunta interactiva de opción múltiple sobre deportes, reglamentos o la historia del club e invitá al usuario a responder A, B o C. Mantenelo dinámico y divertido."
};

// POST /api/chat
router.post('/chat', async (req, res) => {
  const { message, mode } = req.body;
  const activeMode = mode || 'club';
  const systemInstruction = SYSTEM_PROMPTS[activeMode] || SYSTEM_PROMPTS.club;

  if (!message) {
    return res.status(400).json({ error: 'Mensaje faltante' });
  }

  if (!GEMINI_API_KEY) {
    console.error("[Gemini API] Error: GEMINI_API_KEY no configurada.");
    return res.status(503).json({ error: 'El servicio de IA no está disponible en este momento.' });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: message }
            ]
          }
        ],
        systemInstruction: {
          parts: [
            { text: systemInstruction }
          ]
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No logré procesar tu respuesta.";
      res.json({ text: reply });
    } else {
      const errText = await response.text();
      console.error("[Gemini API Error]", errText);
      throw new Error(`Error en servicio externo de Gemini: ${response.status}`);
    }
  } catch (error) {
    console.error('[Gemini API] Error de conexión:', error.message);
    res.status(503).json({ error: 'El servicio de IA no está disponible en este momento. Intente más tarde.' });
  }
});

module.exports = router;
