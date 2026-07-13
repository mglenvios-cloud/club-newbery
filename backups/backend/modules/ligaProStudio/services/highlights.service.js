const prisma = require('../../../prismaClient');

const getAllHighlights = async () => {
  return prisma.highlightClip.findMany({
    orderBy: { createdAt: 'desc' }
  });
};

const getHighlightById = async (id) => {
  return prisma.highlightClip.findUnique({
    where: { id: parseInt(id, 10) }
  });
};

const createHighlight = async ({ matchId, mediaId, title, startTime, endTime, generatedByAI, published }) => {
  const mId = parseInt(matchId, 10);
  const match = await prisma.futsalMatch.findUnique({ where: { id: mId } });
  const isPub = published !== false && published !== 'false';
  
  // Obtener URL de stream base o mock
  const streamUrl = match?.videoUrl || match?.liveStreamUrl || 'https://youtube.com/watch?v=mock_stream';
  const clipUrl = `${streamUrl}#t=${startTime},${endTime}`;

  // 1. Crear registro FutsalMedia
  const media = await prisma.futsalMedia.create({
    data: {
      type: 'VIDEO',
      title,
      url: clipUrl,
      category: 'Mejores Jugadas',
      description: `Clip destacado del partido ${match?.homeTeam || 'Newbery'} vs ${match?.opponent || 'Rival'} (Min ${Math.floor(startTime / 60)}).`,
      season: match?.season || '2026',
      competition: match?.competition || 'AFA Primera',
      opponent: match?.opponent || '',
      matchId: mId,
      published: isPub,
      publishedAt: isPub ? new Date() : null,
      isClip: true,
      featured: false,
      views: 0
    }
  });

  // 2. Crear HighlightClip apuntando al FutsalMedia creado
  return prisma.highlightClip.create({
    data: {
      matchId: mId,
      mediaId: media.id,
      title,
      startTime: parseInt(startTime, 10),
      endTime: parseInt(endTime, 10),
      generatedByAI: generatedByAI === true || generatedByAI === 'true',
      published: isPub
    }
  });
};

const updateHighlight = async (id, data) => {
  const updateData = { ...data };
  if (data.matchId) updateData.matchId = parseInt(data.matchId, 10);
  if (data.mediaId !== undefined) updateData.mediaId = data.mediaId ? parseInt(data.mediaId, 10) : null;
  if (data.startTime !== undefined) updateData.startTime = parseInt(data.startTime, 10);
  if (data.endTime !== undefined) updateData.endTime = parseInt(data.endTime, 10);
  if (data.generatedByAI !== undefined) updateData.generatedByAI = data.generatedByAI === true || data.generatedByAI === 'true';
  if (data.published !== undefined) updateData.published = data.published === true || data.published === 'true';

  const updated = await prisma.highlightClip.update({
    where: { id: parseInt(id, 10) },
    data: updateData
  });

  // Sincronizar FutsalMedia si existe
  if (updated.mediaId) {
    const isPub = updated.published;
    const mediaData = {
      title: updated.title,
      published: isPub,
      publishedAt: isPub ? new Date() : null
    };
    if (data.startTime !== undefined || data.endTime !== undefined) {
      const match = await prisma.futsalMatch.findUnique({ where: { id: updated.matchId } });
      const streamUrl = match?.videoUrl || match?.liveStreamUrl || 'https://youtube.com/watch?v=mock_stream';
      mediaData.url = `${streamUrl}#t=${updated.startTime},${updated.endTime}`;
    }
    await prisma.futsalMedia.update({
      where: { id: updated.mediaId },
      data: mediaData
    }).catch(() => {});
  }

  return updated;
};

const deleteHighlight = async (id) => {
  const clip = await prisma.highlightClip.findUnique({
    where: { id: parseInt(id, 10) }
  });
  
  if (clip && clip.mediaId) {
    await prisma.futsalMedia.delete({
      where: { id: clip.mediaId }
    }).catch(() => {});
  }

  return prisma.highlightClip.delete({
    where: { id: parseInt(id, 10) }
  });
};

module.exports = {
  getAllHighlights,
  getHighlightById,
  createHighlight,
  updateHighlight,
  deleteHighlight
};
