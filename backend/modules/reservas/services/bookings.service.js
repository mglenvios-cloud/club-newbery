const prisma = require('../../../prismaClient');
const pricesService = require('./prices.service');

const getAllBookings = async () => {
  return prisma.booking.findMany({
    include: {
      socio: true,
      facility: true
    },
    orderBy: { fecha: 'desc' }
  });
};

const getBookingById = async (id) => {
  return prisma.booking.findUnique({
    where: { id: parseInt(id, 10) },
    include: {
      socio: true,
      facility: true
    }
  });
};

const createBooking = async ({ socioId, nombreCliente, telefono, email, facilityId, fecha, horaInicio, horaFin, tipoReserva, importe, clubId }) => {
  const facId = parseInt(facilityId, 10);
  const sId = socioId ? parseInt(socioId, 10) : null;
  const cId = clubId ? parseInt(clubId, 10) : null;
  
  // 1. Validar existencia e inactividad de la instalación
  const facility = await prisma.facility.findUnique({ where: { id: facId } });
  if (!facility) {
    throw new Error('La instalación deportiva especificada no existe.');
  }
  if (facility.status !== 'ACTIVE') {
    throw new Error('La instalación deportiva seleccionada se encuentra inactiva o en mantenimiento.');
  }

  const bookingDate = new Date(fecha);
  const startOfDay = new Date(bookingDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(bookingDate.setHours(23, 59, 59, 999));

  // 2. Validar bloqueos en la agenda (Schedule)
  const dayOfWeek = bookingDate.getDay();
  const blockedSchedule = await prisma.schedule.findFirst({
    where: {
      facilityId: facId,
      dayOfWeek,
      isBlocked: true
    }
  });
  if (blockedSchedule) {
    throw new Error(`La instalación está bloqueada para este día: ${blockedSchedule.reason || 'Mantenimiento'}`);
  }

  // 3. Validar solapamiento de horarios (evitar doble reserva)
  const overlap = await prisma.booking.findFirst({
    where: {
      facilityId: facId,
      fecha: {
        gte: startOfDay,
        lte: endOfDay
      },
      estado: { in: ['PENDIENTE', 'CONFIRMADA'] },
      AND: [
        { horaInicio: { lt: horaFin } },
        { horaFin: { gt: horaInicio } }
      ]
    }
  });

  if (overlap) {
    throw new Error('La cancha ya se encuentra reservada en el rango horario seleccionado.');
  }

  // 4. Calcular precio si no se provee importe
  let finalImporte = importe;
  if (finalImporte === undefined || finalImporte === null) {
    const userType = tipoReserva || (sId ? 'SOCIO' : 'GENERAL');
    finalImporte = await pricesService.calculatePrice(facId, userType, horaInicio);
  }

  return prisma.booking.create({
    data: {
      socioId: sId,
      nombreCliente,
      telefono,
      email,
      facilityId: facId,
      fecha: startOfDay,
      horaInicio,
      horaFin,
      tipoReserva: tipoReserva || (sId ? 'SOCIO' : 'GENERAL'),
      estado: 'PENDIENTE',
      importe: parseFloat(finalImporte),
      clubId: cId
    }
  });
};

const updateBooking = async (id, data) => {
  const updateData = { ...data };
  if (data.socioId !== undefined) updateData.socioId = data.socioId ? parseInt(data.socioId, 10) : null;
  if (data.facilityId) updateData.facilityId = parseInt(data.facilityId, 10);
  if (data.fecha) {
    const dateObj = new Date(data.fecha);
    updateData.fecha = new Date(dateObj.setHours(0, 0, 0, 0));
  }
  if (data.importe !== undefined) updateData.importe = parseFloat(data.importe);
  if (data.clubId !== undefined) updateData.clubId = data.clubId ? parseInt(data.clubId, 10) : null;

  return prisma.booking.update({
    where: { id: parseInt(id, 10) },
    data: updateData,
    include: {
      socio: true,
      facility: true
    }
  });
};

const deleteBooking = async (id) => {
  return prisma.booking.delete({
    where: { id: parseInt(id, 10) }
  });
};

module.exports = {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking
};
