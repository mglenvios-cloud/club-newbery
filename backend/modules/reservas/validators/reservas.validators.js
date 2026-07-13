// Validaciones para el módulo de Reservas de Canchas

const validateBooking = (req, res, next) => {
  const { nombreCliente, telefono, email, facilityId, fecha, horaInicio, horaFin } = req.body;

  if (!nombreCliente || typeof nombreCliente !== 'string' || nombreCliente.trim() === '') {
    return res.status(400).json({ error: 'El nombre completo del cliente es obligatorio.' });
  }

  if (!telefono || typeof telefono !== 'string' || telefono.trim() === '') {
    return res.status(400).json({ error: 'El teléfono de contacto es obligatorio.' });
  }

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'El correo electrónico provisto no es válido.' });
  }

  if (!facilityId || isNaN(parseInt(facilityId, 10))) {
    return res.status(400).json({ error: 'La instalación deportiva (facilityId) es inválida o ausente.' });
  }

  if (!fecha || isNaN(Date.parse(fecha))) {
    return res.status(400).json({ error: 'La fecha provista para el turno es inválida.' });
  }

  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!horaInicio || !timeRegex.test(horaInicio)) {
    return res.status(400).json({ error: 'La hora de inicio (horaInicio) debe poseer formato HH:MM.' });
  }

  if (!horaFin || !timeRegex.test(horaFin)) {
    return res.status(400).json({ error: 'La hora de fin (horaFin) debe poseer formato HH:MM.' });
  }

  // Compare hours
  const startMins = parseInt(horaInicio.split(':')[0], 10) * 60 + parseInt(horaInicio.split(':')[1], 10);
  const endMins = parseInt(horaFin.split(':')[0], 10) * 60 + parseInt(horaFin.split(':')[1], 10);

  if (startMins >= endMins) {
    return res.status(400).json({ error: 'La hora de inicio debe ser anterior a la hora de fin.' });
  }

  next();
};

const validateSchedule = (req, res, next) => {
  const { facilityId, dayOfWeek, startTime, endTime } = req.body;

  if (!facilityId || isNaN(parseInt(facilityId, 10))) {
    return res.status(400).json({ error: 'El identificador de instalación (facilityId) es obligatorio.' });
  }

  if (dayOfWeek === undefined || isNaN(parseInt(dayOfWeek, 10)) || parseInt(dayOfWeek, 10) < 0 || parseInt(dayOfWeek, 10) > 6) {
    return res.status(400).json({ error: 'El día de la semana (dayOfWeek) debe ser un entero entre 0 y 6.' });
  }

  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!startTime || !timeRegex.test(startTime)) {
    return res.status(400).json({ error: 'La hora de apertura (startTime) debe poseer formato HH:MM.' });
  }

  if (!endTime || !timeRegex.test(endTime)) {
    return res.status(400).json({ error: 'La hora de cierre (endTime) debe poseer formato HH:MM.' });
  }

  next();
};

module.exports = {
  validateBooking,
  validateSchedule
};
