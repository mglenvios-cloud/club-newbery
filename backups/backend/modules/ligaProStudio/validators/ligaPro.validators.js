// Validadores para el módulo Liga Pro Studio

const validateBroadcast = (req, res, next) => {
  const { matchId, title, status, streamUrl } = req.body;

  if (!matchId || isNaN(parseInt(matchId, 10))) {
    return res.status(400).json({ error: 'Identificador de partido (matchId) inválido o ausente.' });
  }

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'El título de la transmisión es obligatorio.' });
  }

  const validStatuses = ['PROGRAMADO', 'EN_VIVO', 'FINALIZADO'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Estado de transmisión inválido. Valores permitidos: PROGRAMADO, EN_VIVO, FINALIZADO.' });
  }

  if (streamUrl) {
    try {
      new URL(streamUrl);
    } catch (_) {
      return res.status(400).json({ error: 'La URL del Stream no posee un formato correcto (http/https).' });
    }
  }

  next();
};

const validateEvent = (req, res, next) => {
  const { minute, type, description } = req.body;
  const matchId = req.params.id;

  if (!matchId || isNaN(parseInt(matchId, 10))) {
    return res.status(400).json({ error: 'Identificador de partido inválido en la ruta.' });
  }

  if (minute === undefined || isNaN(parseInt(minute, 10)) || parseInt(minute, 10) < 0) {
    return res.status(400).json({ error: 'El minuto del evento debe ser un número entero mayor o igual a 0.' });
  }

  const validTypes = ['GOL', 'TARJETA', 'CAMBIO', 'ATAQUE', 'JUGADA_DESTACADA'];
  if (!type || !validTypes.includes(type)) {
    return res.status(400).json({ error: `Tipo de evento inválido. Valores válidos: ${validTypes.join(', ')}` });
  }

  if (!description || typeof description !== 'string' || description.trim() === '') {
    return res.status(400).json({ error: 'La descripción del evento es obligatoria.' });
  }

  next();
};

const validateHighlight = (req, res, next) => {
  const { matchId, title, startTime, endTime } = req.body;

  if (!matchId || isNaN(parseInt(matchId, 10))) {
    return res.status(400).json({ error: 'Identificador de partido (matchId) inválido o ausente.' });
  }

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'El título del clip destacado es obligatorio.' });
  }

  if (startTime === undefined || isNaN(parseInt(startTime, 10)) || parseInt(startTime, 10) < 0) {
    return res.status(400).json({ error: 'El tiempo de inicio (startTime) debe ser un número entero mayor o igual a 0.' });
  }

  if (endTime === undefined || isNaN(parseInt(endTime, 10)) || parseInt(endTime, 10) < 0) {
    return res.status(400).json({ error: 'El tiempo de fin (endTime) debe ser un número entero mayor o igual a 0.' });
  }

  if (parseInt(startTime, 10) > parseInt(endTime, 10)) {
    return res.status(400).json({ error: 'El tiempo de inicio no puede ser mayor que el tiempo de fin.' });
  }

  next();
};

module.exports = {
  validateBroadcast,
  validateEvent,
  validateHighlight
};
