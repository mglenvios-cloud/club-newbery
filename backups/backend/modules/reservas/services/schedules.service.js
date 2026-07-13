const prisma = require('../../../prismaClient');

const getSchedulesByFacility = async (facilityId) => {
  return prisma.schedule.findMany({
    where: { facilityId: parseInt(facilityId, 10) },
    orderBy: { dayOfWeek: 'asc' }
  });
};

const createSchedule = async ({ facilityId, dayOfWeek, startTime, endTime, isBlocked, reason }) => {
  return prisma.schedule.create({
    data: {
      facilityId: parseInt(facilityId, 10),
      dayOfWeek: parseInt(dayOfWeek, 10),
      startTime,
      endTime,
      isBlocked: isBlocked === true || isBlocked === 'true',
      reason: reason || null
    }
  });
};

const updateSchedule = async (id, data) => {
  const updateData = { ...data };
  if (data.facilityId) updateData.facilityId = parseInt(data.facilityId, 10);
  if (data.dayOfWeek !== undefined) updateData.dayOfWeek = parseInt(data.dayOfWeek, 10);
  if (data.isBlocked !== undefined) updateData.isBlocked = data.isBlocked === true || data.isBlocked === 'true';

  return prisma.schedule.update({
    where: { id: parseInt(id, 10) },
    data: updateData
  });
};

const checkAvailability = async (facilityId, dateStr) => {
  const facId = parseInt(facilityId, 10);
  const dateObj = new Date(dateStr);
  const dayOfWeek = dateObj.getDay(); // 0 = Domingo, 1 = Lunes, etc.

  // 1. Obtener horarios y bloqueos de la instalación
  const schedules = await prisma.schedule.findMany({
    where: { facilityId: facId, dayOfWeek }
  });

  // 2. Obtener reservas existentes para la fecha
  // Nota: Almacenamos fecha como YYYY-MM-DD o parseada al inicio del día
  const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
  const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));

  const bookings = await prisma.booking.findMany({
    where: {
      facilityId: facId,
      fecha: {
        gte: startOfDay,
        lte: endOfDay
      },
      estado: {
        in: ['PENDIENTE', 'CONFIRMADA']
      }
    }
  });

  // 3. Generar franjas horarias del día (e.g. cada hora de 08:00 a 22:00)
  // De forma predeterminada, si no hay horarios configurados en Schedule, asumimos habilitado de 08:00 a 22:00
  let facilityOpenTime = "08:00";
  let facilityCloseTime = "22:00";
  let isFacilityBlocked = false;
  let blockReason = "";

  if (schedules.length > 0) {
    // Si hay un bloqueo completo del día
    const blockedSchedule = schedules.find(s => s.isBlocked);
    if (blockedSchedule) {
      isFacilityBlocked = true;
      blockReason = blockedSchedule.reason || "Bloqueado por administración";
    } else {
      // Usar los límites del horario configurado
      facilityOpenTime = schedules[0].startTime;
      facilityCloseTime = schedules[0].endTime;
    }
  }

  const startHour = parseInt(facilityOpenTime.split(':')[0], 10);
  const endHour = parseInt(facilityCloseTime.split(':')[0], 10);
  const timeSlots = [];

  for (let hour = startHour; hour < endHour; hour++) {
    const slotStart = `${hour.toString().padStart(2, '0')}:00`;
    const slotEnd = `${(hour + 1).toString().padStart(2, '0')}:00`;
    
    let slotStatus = 'DISPONIBLE';
    let details = '';

    if (isFacilityBlocked) {
      slotStatus = 'BLOQUEADO';
      details = blockReason;
    } else {
      // Check if slot overlaps with any booking
      const overlappingBooking = bookings.find(b => {
        return b.horaInicio < slotEnd && b.horaFin > slotStart;
      });
      if (overlappingBooking) {
        slotStatus = 'OCUPADO';
        details = `Reservado por ${overlappingBooking.nombreCliente}`;
      }
    }

    timeSlots.push({
      startTime: slotStart,
      endTime: slotEnd,
      status: slotStatus,
      details
    });
  }

  return timeSlots;
};

module.exports = {
  getSchedulesByFacility,
  createSchedule,
  updateSchedule,
  checkAvailability
};
