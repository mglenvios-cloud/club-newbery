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

// Respuestas locales de contingencia (Fallback si no hay API Key)
const fallbackResponses = {
  club: "🕒 El club abre de 17 a 22hs. La sede está en Alpatacal 3026 (Villa Devoto). Podés asociarte en la secretaría o en la web.",
  school: "📚 ¡Hola! Preguntame alguna duda de matemáticas o geografía y te ayudo a pensar la respuesta paso a paso.",
  sports: "⚽ Futsal AFA se juega 5 contra 5 en dos tiempos de 20 minutos netos. ¿Querés que te recomiende un ejercicio de calentamiento?",
  trivia: "🏆 Trivia: ¿De qué colores es la camiseta del club? A) Azul/Amarillo B) Blanco/Rojo/Negro C) Verde. ¡Escribí la opción correcta!"
};

router.post('/chat', async (req, res) => {
  const { message, mode } = req.body;
  const activeMode = mode || 'club';
  const systemInstruction = SYSTEM_PROMPTS[activeMode] || SYSTEM_PROMPTS.club;

  if (!message) {
    return res.status(400).json({ error: 'Mensaje faltante' });
  }

  // Si no hay API Key configurada, usar respuestas locales de contingencia
  if (!GEMINI_API_KEY) {
    console.warn("[Gemini API] GEMINI_API_KEY no configurada. Usando fallback local.");
    let fallbackText = fallbackResponses[activeMode] || fallbackResponses.club;
    return res.json({ text: fallbackText });
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
      throw new Error("Error en el servicio de Gemini");
    }
  } catch (error) {
    console.error('Error al conectar con Gemini:', error);
    res.json({ text: fallbackResponses[activeMode] || "Tengo problemas de conexión, pero recordá que en secretaría podemos ayudarte." });
  }
});

module.exports = router;
