const prisma = require('../../../prismaClient');

const getEventsByMatch = async (matchId) => {
  return prisma.matchEvent.findMany({
    where: { matchId: parseInt(matchId, 10) },
    orderBy: { minute: 'asc' }
  });
};

const createEvent = async ({ matchId, minute, type, playerId, description }) => {
  const mId = parseInt(matchId, 10);
  const min = parseInt(minute, 10);
  const pId = playerId ? parseInt(playerId, 10) : null;

  return prisma.matchEvent.create({
    data: {
      matchId: mId,
      minute: min,
      type, // GOL, TARJETA, CAMBIO, ATAQUE, JUGADA_DESTACADA
      playerId: pId,
      description
    }
  });
};

module.exports = {
  getEventsByMatch,
  createEvent
};
