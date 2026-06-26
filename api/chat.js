// ============================================================================
// /api/chat.js
// Vercel Serverless Function — Proxy seguro entre el widget de chat (frontend)
// y la API de Gemini (Google AI). La API key vive SOLO en variables de
// entorno de Vercel y nunca se expone al navegador del visitante.
//
// Runtime: Node.js (zero-config, detectado automáticamente por Vercel al
// existir un archivo dentro de /api). No requiere dependencias ni build step.
// ============================================================================

const GEMINI_MODEL = 'gemini-3.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Contexto de negocio + reglas de comportamiento del asistente.
// Edita este bloque para adaptar el chatbot a otro cliente/proyecto.
const SYSTEM_INSTRUCTION = `
Eres el asistente virtual del sitio web de Spax, una clínica de dermatología médica y estética en Lima, Perú.

INFORMACIÓN DEL NEGOCIO:
- Especialidad: Dermatología médica y estética.
- Servicios: Relleno dérmico, Peeling químico, Estiramiento facial no invasivo, Revisión y mejora de cicatrices, Reducción de arrugas, Tratamiento de acné.
- Dirección: Av. El Polo 670, Santiago de Surco, Lima, Perú.
- Teléfono: (01) 555-0123.
- Correo: hola@spax.pe.
- Horario: Lunes a viernes 9:00–18:00, sábados 11:00–17:00. Domingos cerrado.

REGLAS DE COMPORTAMIENTO:
1. Responde siempre en español, con un tono cálido, profesional y cercano, propio de una clínica de salud y belleza.
2. Puedes explicar en qué consisten los servicios listados arriba, en términos generales y educativos.
3. NUNCA das diagnósticos médicos ni recomiendas un tratamiento específico para un caso particular. Si preguntan algo de salud personal ("¿qué tengo en la piel?", "¿qué tratamiento necesito?"), indica amablemente que solo un especialista de Spax puede evaluarlo en consulta, y ofrece ayudar a agendar una cita.
4. Si preguntan precios exactos, indica que varían según la evaluación y que lo ideal es agendar una valoración con el equipo.
5. Para agendar una cita, indica que pueden llamar al teléfono, escribir al correo, o usar el formulario de contacto del sitio.
6. Si la pregunta no tiene relación con Spax o dermatología, respóndela muy brevemente y reconduce la conversación hacia cómo puedes ayudar respecto a la clínica.
7. Sé conciso: respuestas de máximo 3-4 frases, salvo que el usuario pida explícitamente más detalle.
`.trim();

const MAX_MESSAGE_LENGTH = 1000;
const MAX_HISTORY_TURNS = 10;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[api/chat] Falta la variable de entorno GEMINI_API_KEY.');
    return res.status(500).json({
      error: 'El asistente no está configurado correctamente. Contacta al administrador del sitio.',
    });
  }

  const { message, history } = req.body || {};

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'El mensaje está vacío.' });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ error: `El mensaje es demasiado largo (máx. ${MAX_MESSAGE_LENGTH} caracteres).` });
  }

  // Se reconstruye el historial en el formato que espera Gemini, limitando
  // turnos y longitud para controlar costo y evitar abuso del endpoint.
  const safeHistory = Array.isArray(history) ? history.slice(-MAX_HISTORY_TURNS) : [];
  const contents = [
    ...safeHistory
      .filter((turn) => turn && (turn.role === 'user' || turn.role === 'model') && typeof turn.text === 'string')
      .map((turn) => ({ role: turn.role, parts: [{ text: turn.text.slice(0, MAX_MESSAGE_LENGTH) }] })),
    { role: 'user', parts: [{ text: message.trim() }] },
  ];

  try {
    const geminiResponse = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 300,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error('[api/chat] Error de Gemini API:', geminiResponse.status, errText);
      return res.status(502).json({ error: 'No se pudo contactar al asistente de IA. Intenta de nuevo en unos segundos.' });
    }

    const data = await geminiResponse.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ||
      'Disculpa, no pude generar una respuesta. ¿Puedes reformular tu pregunta?';

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('[api/chat] Error inesperado:', err);
    return res.status(500).json({ error: 'Ocurrió un error inesperado. Intenta de nuevo.' });
  }
};
