const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ─── UTILS & HELPERS ─────────────────────────────────────────────────────────

const parseLocations = (locations) => {
  try {
    if (typeof locations === 'string') return JSON.parse(locations);
    if (Array.isArray(locations)) return locations;
    return [];
  } catch {
    return [];
  }
};

const isBannerActive = (banner) => {
  if (!banner.isActive) return false;
  const now = new Date();
  if (banner.rotation === 'SCHEDULED') {
    if (banner.startDate && new Date(banner.startDate) > now) return false;
    if (banner.endDate && new Date(banner.endDate) < now) return false;
  }
  return true;
};

// ─── CONFIGURACIÓN DE MULTER (STORAGE & SEGURIDAD) ───────────────────────────

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.mp4', '.webm', '.pdf'];

// Mapeo de categorías a carpetas físicas en backend/uploads
const CATEGORY_FOLDERS = {
  sponsors: 'sponsors',
  banners: 'banners',
  campanas: 'campañas',
  videos: 'videos',
  documentos: 'documentos'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Leer categoría desde body (ej. "sponsors", "banners")
    const category = req.body.category || 'documentos';
    const folderName = CATEGORY_FOLDERS[category] || 'documentos';
    const destDir = path.join(__dirname, '../uploads', folderName);
    
    // Crear directorio si no existe
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    cb(null, destDir);
  },
  filename: (req, file, cb) => {
    // Sanitizar nombre de archivo original y renombrarlo automáticamente
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase();
    
    const category = req.body.category || 'media';
    const timestamp = Math.floor(Date.now() / 1000);
    const newName = `${category}-${baseName}-${timestamp}${ext}`;
    cb(null, newName);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Formato no soportado. Extensiones permitidas: ${ALLOWED_EXTENSIONS.join(', ')}`), false);
  }
};

// Multer general limitado a 100MB (el máximo permitido para video)
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
});

// Middleware de validación adicional de tamaño según el tipo de archivo
const validateFileSize = (req, res, next) => {
  if (!req.file) return next();

  const ext = path.extname(req.file.originalname).toLowerCase();
  const size = req.file.size;
  
  let maxSize = 0;
  let typeLabel = '';

  if (['.jpg', '.jpeg', '.png', '.webp', '.svg'].includes(ext)) {
    maxSize = 10 * 1024 * 1024; // 10MB
    typeLabel = 'Imagen (máximo 10 MB)';
  } else if (['.pdf'].includes(ext)) {
    maxSize = 20 * 1024 * 1024; // 20MB
    typeLabel = 'Documento PDF (máximo 20 MB)';
  } else if (['.mp4', '.webm'].includes(ext)) {
    maxSize = 100 * 1024 * 1024; // 100MB
    typeLabel = 'Video (máximo 100 MB)';
  }

  if (size > maxSize) {
    // Eliminar archivo subido físicamente de forma preventiva
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({ error: `El archivo supera el tamaño permitido para su categoría: ${typeLabel}` });
  }

  next();
};

// ─── ENDPOINTS: SPONSORS ─────────────────────────────────────────────────────

// GET /api/sponsors (y /api/publicidad/sponsors)
router.get('/sponsors', async (req, res) => {
  const { active, category } = req.query;
  try {
    const where = {};
    if (active === 'true') where.isActive = true;
    if (active === 'false') where.isActive = false;
    if (category) where.category = category;

    const sponsors = await prisma.sponsor.findMany({
      where,
      include: {
        contracts: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
    });
    res.json(sponsors);
  } catch (error) {
    console.error('[Publicidad] Error al obtener sponsors:', error);
    res.status(500).json({ error: 'Error al obtener sponsors' });
  }
});

// GET /api/sponsors/:id
router.get('/sponsors/:id', async (req, res) => {
  try {
    const sponsor = await prisma.sponsor.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { contracts: true }
    });
    if (!sponsor) return res.status(404).json({ error: 'Sponsor no encontrado' });
    res.json(sponsor);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener sponsor' });
  }
});

// POST /api/sponsors (y /api/publicidad/sponsors)
router.post('/sponsors', async (req, res) => {
  const { 
    name, logoUrl, imageUrl, description, website, phone, email, 
    whatsapp, instagram, facebook, category, isActive, order, address,
    contractStartDate, contractEndDate, status
  } = req.body;

  try {
    if (!name) return res.status(400).json({ error: 'El nombre del sponsor es obligatorio' });

    const start = contractStartDate ? new Date(contractStartDate) : null;
    const end = contractEndDate ? new Date(contractEndDate) : null;

    const sponsor = await prisma.sponsor.create({
      data: {
        name,
        logoUrl: logoUrl || null,
        imageUrl: imageUrl || null,
        description: description || null,
        website: website || null,
        phone: phone || null,
        email: email || null,
        whatsapp: whatsapp || null,
        instagram: instagram || null,
        facebook: facebook || null,
        category: category || 'GENERAL',
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        order: order !== undefined ? parseInt(order) : 0,
        address: address || null,
        contractStartDate: start,
        contractEndDate: end,
        status: status || 'activo'
      }
    });

    // Crear registro inicial de contrato si tiene fechas definidas
    if (start && end) {
      await prisma.contractHistory.create({
        data: {
          sponsorId: sponsor.id,
          startDate: start,
          endDate: end,
          notes: 'Contrato inicial registrado al crear el Sponsor.'
        }
      });
    }

    res.status(201).json(sponsor);
  } catch (error) {
    console.error('[Publicidad] Error al crear sponsor:', error);
    res.status(500).json({ error: 'Error al crear sponsor' });
  }
});

// PUT /api/sponsors/:id
router.put('/sponsors/:id', async (req, res) => {
  const { 
    name, logoUrl, imageUrl, description, website, phone, email, 
    whatsapp, instagram, facebook, category, isActive, order, address,
    contractStartDate, contractEndDate, status
  } = req.body;

  try {
    const sponsorId = parseInt(req.params.id);
    const existing = await prisma.sponsor.findUnique({ where: { id: sponsorId } });
    if (!existing) return res.status(404).json({ error: 'Sponsor no encontrado' });

    const start = contractStartDate ? new Date(contractStartDate) : null;
    const end = contractEndDate ? new Date(contractEndDate) : null;

    const updated = await prisma.sponsor.update({
      where: { id: sponsorId },
      data: {
        name,
        logoUrl,
        imageUrl,
        description,
        website,
        phone,
        email,
        whatsapp,
        instagram,
        facebook,
        category,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        order: order !== undefined ? parseInt(order) : undefined,
        address,
        contractStartDate: start,
        contractEndDate: end,
        status: status || undefined
      }
    });

    // Si las fechas del contrato cambiaron respecto a las anteriores, añadir al historial
    const startChanged = start && (!existing.contractStartDate || new Date(existing.contractStartDate).getTime() !== start.getTime());
    const endChanged = end && (!existing.contractEndDate || new Date(existing.contractEndDate).getTime() !== end.getTime());
    
    if (startChanged || endChanged) {
      await prisma.contractHistory.create({
        data: {
          sponsorId: sponsorId,
          startDate: start || existing.contractStartDate || new Date(),
          endDate: end || existing.contractEndDate || new Date(),
          notes: 'Contrato actualizado / renovación registrada.'
        }
      });
    }

    res.json(updated);
  } catch (error) {
    console.error('[Publicidad] Error al actualizar sponsor:', error);
    res.status(500).json({ error: 'Error al actualizar sponsor' });
  }
});

// DELETE /api/sponsors/:id
router.delete('/sponsors/:id', async (req, res) => {
  try {
    await prisma.sponsor.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Sponsor eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar sponsor' });
  }
});

// POST /api/sponsors/:id/contracts — registrar renovación
router.post('/sponsors/:id/contracts', async (req, res) => {
  const { startDate, endDate, amount, notes } = req.body;
  try {
    const sponsorId = parseInt(req.params.id);
    const start = new Date(startDate);
    const end = new Date(endDate);

    const contract = await prisma.contractHistory.create({
      data: {
        sponsorId,
        startDate: start,
        endDate: end,
        amount: amount ? parseFloat(amount) : null,
        notes: notes || null
      }
    });

    // Actualizar contrato vigente en el sponsor principal
    await prisma.sponsor.update({
      where: { id: sponsorId },
      data: {
        contractStartDate: start,
        contractEndDate: end,
        status: 'activo'
      }
    });

    res.status(201).json(contract);
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar contrato' });
  }
});

// GET /api/sponsors/:id/contracts
router.get('/sponsors/:id/contracts', async (req, res) => {
  try {
    const list = await prisma.contractHistory.findMany({
      where: { sponsorId: parseInt(req.params.id) },
      orderBy: { createdAt: 'desc' }
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener historial de contratos' });
  }
});

// ─── ENDPOINTS: BANNERS ──────────────────────────────────────────────────────

// GET /api/banners (y /api/publicidad/banners)
router.get('/banners', async (req, res) => {
  const { location, active } = req.query;
  try {
    let banners = await prisma.banner.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
    });

    if (location) {
      banners = banners.filter(b => parseLocations(b.locations).includes(location));
    }
    if (active === 'true') {
      banners = banners.filter(isBannerActive);
    }
    res.json(banners);
  } catch (error) {
    console.error('[Publicidad] Error al obtener banners:', error);
    res.status(500).json({ error: 'Error al obtener banners' });
  }
});

// GET /api/banners/:id
router.get('/banners/:id', async (req, res) => {
  try {
    const banner = await prisma.banner.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!banner) return res.status(404).json({ error: 'Banner no encontrado' });
    res.json(banner);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener banner' });
  }
});

// POST /api/banners (y /api/publicidad/banners)
router.post('/banners', async (req, res) => {
  const { title, imageUrl, linkUrl, locations, rotation, startDate, endDate, order, isActive, sponsorId } = req.body;
  try {
    if (!title || !imageUrl) return res.status(400).json({ error: 'Título e imagen son obligatorios' });
    const banner = await prisma.banner.create({
      data: {
        title,
        imageUrl,
        linkUrl: linkUrl || null,
        locations: Array.isArray(locations) ? JSON.stringify(locations) : (locations || '[]'),
        rotation: rotation || 'ALWAYS',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        order: order !== undefined ? parseInt(order) : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        sponsorId: sponsorId ? parseInt(sponsorId) : null,
      }
    });
    res.status(201).json(banner);
  } catch (error) {
    console.error('[Publicidad] Error al crear banner:', error);
    res.status(500).json({ error: 'Error al crear banner' });
  }
});

// PUT /api/banners/:id
router.put('/banners/:id', async (req, res) => {
  const { title, imageUrl, linkUrl, locations, rotation, startDate, endDate, order, isActive, sponsorId } = req.body;
  try {
    const updated = await prisma.banner.update({
      where: { id: parseInt(req.params.id) },
      data: {
        title,
        imageUrl,
        linkUrl,
        locations: Array.isArray(locations) ? JSON.stringify(locations) : locations,
        rotation,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        order: order !== undefined ? parseInt(order) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        sponsorId: sponsorId ? parseInt(sponsorId) : null,
      }
    });
    res.json(updated);
  } catch (error) {
    console.error('[Publicidad] Error al actualizar banner:', error);
    res.status(500).json({ error: 'Error al actualizar banner' });
  }
});

// DELETE /api/banners/:id
router.delete('/banners/:id', async (req, res) => {
  try {
    await prisma.banner.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Banner eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar banner' });
  }
});

// ─── ENDPOINTS: CAMPAÑAS ─────────────────────────────────────────────────────

// GET /api/campaigns (y /api/publicidad/campaigns)
router.get('/campaigns', async (req, res) => {
  const { status, location } = req.query;
  try {
    let campaigns = await prisma.campaign.findMany({
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }]
    });
    if (status) campaigns = campaigns.filter(c => c.status === status);
    if (location) campaigns = campaigns.filter(c => parseLocations(c.locations).includes(location));
    res.json(campaigns);
  } catch (error) {
    console.error('[Publicidad] Error campañas:', error);
    res.status(500).json({ error: 'Error al obtener campañas' });
  }
});

// GET /api/campaigns/:id
router.get('/campaigns/:id', async (req, res) => {
  try {
    const c = await prisma.campaign.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!c) return res.status(404).json({ error: 'Campaña no encontrada' });
    res.json(c);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener campaña' });
  }
});

// POST /api/campaigns (y /api/publicidad/campaigns)
router.post('/campaigns', async (req, res) => {
  const { title, imageUrl, videoUrl, linkUrl, description, locations, startDate, endDate, priority, status, maxViews, sponsorId } = req.body;
  try {
    if (!title) return res.status(400).json({ error: 'El título es obligatorio' });
    const campaign = await prisma.campaign.create({
      data: {
        title,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        linkUrl: linkUrl || null,
        description: description || null,
        locations: Array.isArray(locations) ? JSON.stringify(locations) : (locations || '[]'),
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        priority: priority !== undefined ? parseInt(priority) : 0,
        status: status || 'ACTIVE',
        maxViews: maxViews ? parseInt(maxViews) : null,
        sponsorId: sponsorId ? parseInt(sponsorId) : null,
      }
    });
    res.status(201).json(campaign);
  } catch (error) {
    console.error('[Publicidad] Error al crear campaña:', error);
    res.status(500).json({ error: 'Error al crear campaña' });
  }
});

// PUT /api/campaigns/:id
router.put('/campaigns/:id', async (req, res) => {
  const { title, imageUrl, videoUrl, linkUrl, description, locations, startDate, endDate, priority, status, maxViews, sponsorId } = req.body;
  try {
    const updated = await prisma.campaign.update({
      where: { id: parseInt(req.params.id) },
      data: {
        title,
        imageUrl,
        videoUrl,
        linkUrl,
        description,
        locations: Array.isArray(locations) ? JSON.stringify(locations) : locations,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        priority: priority !== undefined ? parseInt(priority) : undefined,
        status,
        maxViews: maxViews ? parseInt(maxViews) : null,
        sponsorId: sponsorId ? parseInt(sponsorId) : null,
      }
    });
    res.json(updated);
  } catch (error) {
    console.error('[Publicidad] Error al actualizar campaña:', error);
    res.status(500).json({ error: 'Error al actualizar campaña' });
  }
});

// DELETE /api/campaigns/:id
router.delete('/campaigns/:id', async (req, res) => {
  try {
    await prisma.campaign.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Campaña eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar campaña' });
  }
});

// ─── ENDPOINTS: GESTOR MULTIMEDIA (MEDIA FILES) ─────────────────────────────

// GET /api/media-files
router.get('/media-files', async (req, res) => {
  const { category } = req.query;
  try {
    const where = {};
    if (category) where.category = category;

    const files = await prisma.mediaFile.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener archivos multimedia' });
  }
});

// POST /api/media-files/upload — Subida con validaciones
router.post('/media-files/upload', upload.single('file'), validateFileSize, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha proporcionado ningún archivo' });
    }

    const category = req.body.category || 'documentos';
    const folderName = CATEGORY_FOLDERS[category] || 'documentos';
    const fileUrl = `/uploads/${folderName}/${req.file.filename}`;

    const media = await prisma.mediaFile.create({
      data: {
        filename: req.file.filename,
        filepath: req.file.path,
        filetype: path.extname(req.file.originalname).replace('.', '').toLowerCase(),
        size: req.file.size,
        category: category,
        url: fileUrl
      }
    });

    res.status(201).json(media);
  } catch (error) {
    console.error('[Publicidad] Error al subir archivo:', error);
    res.status(500).json({ error: error.message || 'Error al procesar la subida del archivo' });
  }
});

// DELETE /api/media-files/:id
router.delete('/media-files/:id', async (req, res) => {
  try {
    const fileRecord = await prisma.mediaFile.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!fileRecord) return res.status(404).json({ error: 'Archivo no encontrado' });

    // Eliminar archivo físico
    if (fs.existsSync(fileRecord.filepath)) {
      fs.unlinkSync(fileRecord.filepath);
    }

    await prisma.mediaFile.delete({ where: { id: fileRecord.id } });
    res.json({ message: 'Archivo eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar archivo' });
  }
});

// ─── ENDPOINTS: TRACKING (ESTADÍSTICAS) ──────────────────────────────────────

// POST /api/statistics/event — Registro de impresión/vista o clics
router.post('/statistics/event', async (req, res) => {
  const { type, bannerId, campaignId, sponsorId, device, ip } = req.body;
  try {
    if (!type || !['VIEW', 'CLICK'].includes(type)) {
      return res.status(400).json({ error: 'El tipo de evento debe ser VIEW o CLICK' });
    }

    // Registrar en base de datos detallada
    const adView = await prisma.advertisementView.create({
      data: {
        type,
        bannerId: bannerId ? parseInt(bannerId) : null,
        campaignId: campaignId ? parseInt(campaignId) : null,
        sponsorId: sponsorId ? parseInt(sponsorId) : null,
        device: device || 'desktop',
        ipAddress: ip || null
      }
    });

    // Incrementar en modelos principales para mantener compatibilidad e histórico rápido
    if (bannerId) {
      await prisma.banner.update({
        where: { id: parseInt(bannerId) },
        data: type === 'CLICK' ? { clicks: { increment: 1 } } : { views: { increment: 1 } }
      }).catch(() => {});
    }

    if (campaignId) {
      await prisma.campaign.update({
        where: { id: parseInt(campaignId) },
        data: type === 'CLICK' ? { clicks: { increment: 1 } } : { views: { increment: 1 } }
      }).catch(() => {});
    }

    if (sponsorId) {
      await prisma.sponsor.update({
        where: { id: parseInt(sponsorId) },
        data: type === 'CLICK' ? { clicks: { increment: 1 } } : { views: { increment: 1 } }
      }).catch(() => {});
    }

    res.status(201).json(adView);
  } catch (error) {
    console.error('[Publicidad] Error al registrar evento:', error);
    res.status(500).json({ error: 'Error al registrar evento publicitario' });
  }
});

// GET /api/statistics (y /api/publicidad/stats)
router.get('/statistics', async (req, res) => {
  try {
    const now = new Date();
    const [
      totalSponsors, activeSponsors,
      totalBanners, activeBanners,
      totalCampaigns, activeCampaigns,
      allBanners, allSponsors, allCampaigns,
      viewsList,
      activeContracts
    ] = await Promise.all([
      prisma.sponsor.count(),
      prisma.sponsor.count({ where: { isActive: true } }),
      prisma.banner.count(),
      prisma.banner.count({ where: { isActive: true } }),
      prisma.campaign.count(),
      prisma.campaign.count({ where: { status: 'ACTIVE' } }),
      prisma.banner.findMany({ orderBy: { clicks: 'desc' } }),
      prisma.sponsor.findMany({ orderBy: { clicks: 'desc' } }),
      prisma.campaign.findMany({ orderBy: { clicks: 'desc' } }),
      prisma.advertisementView.findMany(),
      prisma.contractHistory.findMany({
        where: {
          startDate: { lte: now },
          endDate: { gte: now }
        }
      })
    ]);

    const scheduledBanners = allBanners.filter(b =>
      b.rotation === 'SCHEDULED' && b.startDate && new Date(b.startDate) > now
    ).length;

    // Calcular totales agregados de históricos anteriores + eventos registrados
    const eventClicks = viewsList.filter(v => v.type === 'CLICK').length;
    const eventViews = viewsList.filter(v => v.type === 'VIEW').length;

    const totalClicks = [...allBanners, ...allSponsors, ...allCampaigns]
      .reduce((acc, item) => acc + (item.clicks || 0), 0) + eventClicks;

    const totalViews = [...allBanners, ...allSponsors, ...allCampaigns]
      .reduce((acc, item) => acc + (item.views || 0), 0) + eventViews;

    const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : '0.00';

    // Top performers
    const topBanner = allBanners[0] || null;
    const topSponsor = allSponsors[0] || null;
    const topCampaign = allCampaigns[0] || null;

    // Métricas por dispositivo
    const deviceStats = {
      desktop: viewsList.filter(v => v.device === 'desktop').length,
      mobile: viewsList.filter(v => v.device === 'mobile').length,
      tablet: viewsList.filter(v => v.device === 'tablet').length
    };

    // Histograma de clics por día (últimos 7 días)
    const clicksByDay = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const label = d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
      
      // Filtrar clicks del día
      const dayClicks = viewsList.filter(v => {
        const vDate = new Date(v.createdAt);
        return v.type === 'CLICK' &&
               vDate.getDate() === d.getDate() &&
               vDate.getMonth() === d.getMonth() &&
               vDate.getFullYear() === d.getFullYear();
      }).length;

      return { date: label, clicks: dayClicks };
    });

    const realEarnings = activeContracts.reduce((sum, contract) => sum + (contract.amount || 0), 0);

    res.json({
      totalSponsors, activeSponsors,
      totalBanners, activeBanners,
      totalCampaigns, activeCampaigns,
      scheduledBanners, totalClicks, totalViews,
      ctr: parseFloat(ctr),
      topBanner, topSponsor, topCampaign,
      clicksByDay,
      deviceStats,
      earnings: realEarnings
    });
  } catch (error) {
    console.error('[Publicidad] Error stats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// Compatibilidad legada con /stats
router.get('/stats', async (req, res) => {
  res.redirect(307, '/api/statistics');
});

// ─── ENDPOINTS: REDES SOCIALES ───────────────────────────────────────────────

const PLATFORMS = ['INSTAGRAM', 'FACEBOOK', 'TIKTOK', 'YOUTUBE', 'WHATSAPP'];

// GET /api/social — config de plataformas
router.get('/social', async (req, res) => {
  try {
    const configs = await prisma.socialConfig.findMany();
    const result = PLATFORMS.map(platform => {
      const existing = configs.find(c => c.platform === platform);
      return existing || { platform, handle: '', url: '', apiKey: '', isActive: false };
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener configuración de redes' });
  }
});

// PUT /api/social/:platform
router.put('/social/:platform', async (req, res) => {
  const { platform } = req.params;
  const { handle, url, apiKey, isActive } = req.body;
  try {
    if (!PLATFORMS.includes(platform.toUpperCase())) {
      return res.status(400).json({ error: 'Plataforma no válida' });
    }
    const config = await prisma.socialConfig.upsert({
      where: { platform: platform.toUpperCase() },
      update: {
        handle: handle || null,
        url: url || null,
        apiKey: apiKey && apiKey !== '••••••••' ? apiKey : undefined,
        isActive: Boolean(isActive),
      },
      create: {
        platform: platform.toUpperCase(),
        handle: handle || null,
        url: url || null,
        apiKey: apiKey || null,
        isActive: Boolean(isActive),
      }
    });
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar configuración de red social' });
  }
});

// GET /api/social-posts
router.get('/social-posts', async (req, res) => {
  try {
    const posts = await prisma.socialPost.findMany({
      orderBy: { scheduledFor: 'asc' }
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener publicaciones sociales' });
  }
});

// POST /api/social-posts
router.post('/social-posts', async (req, res) => {
  const { platform, content, imageUrl, linkUrl, scheduledFor } = req.body;
  try {
    if (!platform) return res.status(400).json({ error: 'Plataforma obligatoria' });
    const post = await prisma.socialPost.create({
      data: {
        platform: platform.toLowerCase(),
        content: content || null,
        imageUrl: imageUrl || null,
        linkUrl: linkUrl || null,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        status: 'PENDING'
      }
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear publicación programada' });
  }
});

// DELETE /api/social-posts/:id
router.delete('/social-posts/:id', async (req, res) => {
  try {
    await prisma.socialPost.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Publicación eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar publicación programada' });
  }
});

module.exports = router;
