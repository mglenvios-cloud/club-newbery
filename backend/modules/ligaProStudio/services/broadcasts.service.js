const prisma = require('../../../prismaClient');

const getAllBroadcasts = async () => {
  return prisma.matchBroadcast.findMany({
    orderBy: { createdAt: 'desc' }
  });
};

const getBroadcastById = async (id) => {
  return prisma.matchBroadcast.findUnique({
    where: { id }
  });
};

const getBroadcastByMatch = async (matchId) => {
  return prisma.matchBroadcast.findFirst({
    where: { matchId: parseInt(matchId, 10) }
  });
};

const createBroadcast = async ({ matchId, title, status, streamUrl, platform }) => {
  const mId = parseInt(matchId, 10);
  return prisma.matchBroadcast.create({
    data: {
      matchId: mId,
      title,
      status: status || 'PROGRAMADO',
      streamUrl: streamUrl || null,
      platform: platform || 'LOCAL',
      startedAt: status === 'EN_VIVO' ? new Date() : null,
      finishedAt: null
    }
  });
};

const updateBroadcast = async (id, data) => {
  const updateData = { ...data };
  if (data.matchId) updateData.matchId = parseInt(data.matchId, 10);
  
  // Set startedAt / finishedAt depending on state transitions
  if (data.status === 'EN_VIVO') {
    updateData.startedAt = new Date();
  } else if (data.status === 'FINALIZADO') {
    updateData.finishedAt = new Date();
  }

  return prisma.matchBroadcast.update({
    where: { id: parseInt(id, 10) },
    data: updateData
  });
};

module.exports = {
  getAllBroadcasts,
  getBroadcastById,
  getBroadcastByMatch,
  createBroadcast,
  updateBroadcast
};
