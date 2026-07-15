const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const prisma = require('../prismaClient');
const { logError } = require('../modules/gestionDeportiva/utils/errorLogger');

const router = express.Router();
const { JWT_SECRET } = require('../config/env');

// Mapeo de categorías a carpetas físicas en backend/uploads
const CATEGORY_FOLDERS = {
  socios: 'socios',
  sponsors: 'sponsors',
  marketing: 'marketing',
  banners: 'banners',
  campañas: 'campañas',
  galeria: 'galeria',
  noticias: 'noticias',
  documentos: 'documentos',
  videos: 'videos',
  'newbery-tv': 'newbery-tv',
  reservas: 'reservas',
  multimedia: 'multimedia'
};

// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = req.body.category || req.query.category || 'documentos';
    const folderName = CATEGORY_FOLDERS[category] || category.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const destDir = path.join(__dirname, '../uploads', folderName);
    
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    cb(null, destDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase();
    
    const category = req.body.category || req.query.category || 'media';
    const timestamp = Math.floor(Date.now() / 1000);
    const newName = `${category}-${baseName}-${timestamp}${ext}`;
    cb(null, newName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Middleware to enforce admin or operator role
const requireAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'OPERADOR')) {
    return res.status(403).json({ error: 'Acceso denegado. Permisos de administrador o productor operador requeridos.' });
  }
  next();
};

// Simple URL validation
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// ─── POST /api/media/upload ────────────────────────────────────────────────
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo.' });
    }

    const category = req.body.category || req.query.category || 'documentos';
    const folderName = CATEGORY_FOLDERS[category] || category.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const fileUrl = `/uploads/${folderName}/${req.file.filename}`;

    const width = req.body.width ? parseInt(req.body.width) : null;
    const height = req.body.height ? parseInt(req.body.height) : null;
    const duration = req.body.duration ? parseFloat(req.body.duration) : null;
    
    const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');

    const media = await prisma.mediaFile.create({
      data: {
        name: req.body.name || req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        url: fileUrl,
        mimeType: req.file.mimetype,
        extension: ext,
        size: req.file.size,
        width,
        height,
        duration,
        category,
        userId: req.user ? req.user.userId : null,

        // Compatibilidad legacy
        filename: req.file.filename,
        filepath: req.file.path,
        filetype: ext
      }
    });

    res.status(201).json(media);
  } catch (error) {
    console.error('Error al subir archivo:', error);
    res.status(500).json({ error: error.message || 'Error al procesar la subida del archivo.' });
  }
});

// ─── POST /api/media/upload-url ────────────────────────────────────────────
router.post('/upload-url', authenticateToken, async (req, res) => {
  const { url, category } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'Falta la URL del archivo.' });
  }

  try {
    const parsedUrl = new URL(url);
    const resolvedCategory = category || 'documentos';
    const folderName = CATEGORY_FOLDERS[resolvedCategory] || resolvedCategory.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const destDir = path.join(__dirname, '../uploads', folderName);

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const response = await fetch(url);
    if (!response.ok) {
      return res.status(400).json({ error: `No se pudo descargar el archivo de la URL remota (Status: ${response.status}).` });
    }

    const contentType = response.headers.get('content-type') || '';
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let ext = '';
    const mimeToExt = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/svg+xml': '.svg',
      'video/mp4': '.mp4',
      'video/webm': '.webm',
      'audio/mpeg': '.mp3',
      'audio/mp3': '.mp3',
      'audio/wav': '.wav',
      'application/pdf': '.pdf',
    };
    
    ext = mimeToExt[contentType] || path.extname(parsedUrl.pathname).toLowerCase() || '.bin';
    
    const originalName = path.basename(parsedUrl.pathname) || `remoto-${Math.floor(Date.now() / 1000)}`;
    const baseName = originalName.replace(ext, '')
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase();

    const timestamp = Math.floor(Date.now() / 1000);
    const filename = `${resolvedCategory}-${baseName}-${timestamp}${ext}`;
    const filepath = path.join(destDir, filename);
    const fileUrl = `/uploads/${folderName}/${filename}`;

    fs.writeFileSync(filepath, buffer);

    const media = await prisma.mediaFile.create({
      data: {
        name: filename,
        originalName: originalName,
        path: filepath,
        url: fileUrl,
        mimeType: contentType,
        extension: ext.replace('.', ''),
        size: buffer.length,
        category: resolvedCategory,
        userId: req.user ? req.user.userId : null,

        // Compatibilidad legacy
        filename: filename,
        filepath: filepath,
        filetype: ext.replace('.', '')
      }
    });

    res.status(201).json(media);
  } catch (error) {
    console.error('Error al descargar archivo de URL:', error);
    res.status(500).json({ error: error.message || 'Error al descargar y procesar el archivo.' });
  }
});

// ─── GET /api/media ────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  if (req.query.library === 'true') {
    const { category, type, search, sortBy = 'createdAt', order = 'desc' } = req.query;
    try {
      const filters = {};
      if (category && category !== 'ALL') {
        filters.category = category;
      }
      if (type && type !== 'ALL') {
        filters.mimeType = { contains: type };
      }
      if (search) {
        filters.OR = [
          { name: { contains: search } },
          { originalName: { contains: search } }
        ];
      }

      const files = await prisma.mediaFile.findMany({
        where: filters,
        orderBy: {
          [sortBy]: order.toLowerCase() === 'asc' ? 'asc' : 'desc'
        }
      });
      return res.json(files);
    } catch (error) {
      console.error('Error al obtener biblioteca de archivos:', error);
      return res.status(500).json({ error: 'Error al obtener archivos de la biblioteca.' });
    }
  }

  // Legacy FutsalMedia code
  const { category, type, season, competition, opponent, playerId, matchId, search, admin, featured } = req.query;
  try {
    const filters = {};

    if (admin !== 'true') {
      filters.published = true;
      filters.visibility = 'PUBLIC';
    }

    if (category && category !== 'ALL') filters.category = category;
    if (type && type !== 'ALL') filters.type = type;
    if (season && season !== 'ALL') filters.season = season;
    if (competition && competition !== 'ALL') filters.competition = competition;
    if (opponent) filters.opponent = { contains: opponent };
    if (playerId) filters.playerId = parseInt(playerId, 10);
    if (matchId) filters.matchId = parseInt(matchId, 10);
    if (featured === 'true') filters.featured = true;

    if (search) {
      filters.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } },
        { opponent: { contains: search } },
        { competition: { contains: search } }
      ];
    }

    const media = await prisma.futsalMedia.findMany({
      where: filters,
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    res.json(media);
  } catch (error) {
    logError({ module: 'NewberyTV', action: 'getAllMedia', error, req });
    res.status(500).json({ error: 'Error al obtener los archivos de Newbery TV.' });
  }
});

// ─── GET /api/media/:id ────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (req.query.type === 'file') {
    try {
      const file = await prisma.mediaFile.findUnique({
        where: { id: parseInt(id, 10) }
      });
      if (!file) return res.status(404).json({ error: 'Archivo no encontrado.' });
      return res.json(file);
    } catch (e) {
      console.error('Error al obtener archivo:', e);
      return res.status(500).json({ error: 'Error al obtener el archivo.' });
    }
  }

  try {
    const item = await prisma.futsalMedia.findUnique({
      where: { id: parseInt(id, 10) }
    });
    if (!item) {
      return res.status(404).json({ error: 'Contenido multimedia no encontrado.' });
    }

    // Increment views count (non-blocking)
    prisma.futsalMedia.update({
      where: { id: item.id },
      data: { views: { increment: 1 } }
    }).catch(() => {});

    res.json(item);
  } catch (error) {
    logError({ module: 'NewberyTV', action: 'getMediaById', error, req });
    res.status(500).json({ error: 'Error al obtener el archivo multimedia.' });
  }
});

// ─── POST /api/media (Admin only) ──────────────────────────────────────────
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  const {
    type, title, url, category, description, season, competition, opponent,
    playerId, matchId, published, visibility, featured
  } = req.body;

  try {
    if (!type || !title || !url || !category) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (tipo, título, URL, sección).' });
    }

    if (!isValidUrl(url)) {
      return res.status(400).json({ error: 'La URL proporcionada no tiene un formato válido.' });
    }

    const item = await prisma.futsalMedia.create({
      data: {
        type,
        title,
        url,
        category,
        description: description || null,
        season: season || '2026',
        competition: competition || 'General',
        opponent: opponent || null,
        playerId: playerId ? parseInt(playerId, 10) : null,
        matchId: matchId ? parseInt(matchId, 10) : null,
        published: published !== undefined ? published : true,
        visibility: visibility || 'PUBLIC',
        featured: featured !== undefined ? featured : false
      }
    });

    res.status(201).json(item);
  } catch (error) {
    logError({ module: 'NewberyTV', action: 'createMedia', error, req });
    res.status(500).json({ error: 'Error al crear el contenido multimedia.' });
  }
});

// ─── PUT /api/media/:id (Admin only) ───────────────────────────────────────
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  
  if (req.query.type === 'file') {
    const { name } = req.body;
    try {
      const existing = await prisma.mediaFile.findUnique({ where: { id: parseInt(id, 10) } });
      if (!existing) return res.status(404).json({ error: 'Archivo no encontrado.' });
      
      const updated = await prisma.mediaFile.update({
        where: { id: parseInt(id, 10) },
        data: { name }
      });
      return res.json(updated);
    } catch (e) {
      console.error('Error al actualizar archivo:', e);
      return res.status(500).json({ error: 'Error al actualizar.' });
    }
  }

  const {
    type, title, url, category, description, season, competition, opponent,
    playerId, matchId, published, publishedAt, visibility, featured
  } = req.body;

  try {
    const existing = await prisma.futsalMedia.findUnique({ where: { id: parseInt(id, 10) } });
    if (!existing) {
      return res.status(404).json({ error: 'Contenido multimedia no encontrado.' });
    }

    if (url && !isValidUrl(url)) {
      return res.status(400).json({ error: 'La URL proporcionada no es válida.' });
    }

    let finalPublishedAt = undefined;
    if (published === true && !existing.published) {
      finalPublishedAt = new Date();
    } else if (publishedAt) {
      finalPublishedAt = new Date(publishedAt);
    }

    const updated = await prisma.futsalMedia.update({
      where: { id: parseInt(id, 10) },
      data: {
        type: type !== undefined ? type : existing.type,
        title: title !== undefined ? title : existing.title,
        url: url !== undefined ? url : existing.url,
        category: category !== undefined ? category : existing.category,
        description: description !== undefined ? description : existing.description,
        season: season !== undefined ? season : existing.season,
        competition: competition !== undefined ? competition : existing.competition,
        opponent: opponent !== undefined ? opponent : existing.opponent,
        playerId: playerId ? parseInt(playerId, 10) : null,
        matchId: matchId ? parseInt(matchId, 10) : null,
        published: published !== undefined ? published : existing.published,
        publishedAt: finalPublishedAt,
        visibility: visibility !== undefined ? visibility : existing.visibility,
        featured: featured !== undefined ? featured : existing.featured
      }
    });
    res.json(updated);
  } catch (error) {
    logError({ module: 'NewberyTV', action: 'updateMedia', error, req });
    res.status(500).json({ error: 'Error al actualizar el contenido.' });
  }
});

// ─── DELETE /api/media/:id (Admin only) ────────────────────────────────────
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  
  if (req.query.type === 'file') {
    try {
      const fileRecord = await prisma.mediaFile.findUnique({ where: { id: parseInt(id, 10) } });
      if (!fileRecord) return res.status(404).json({ error: 'Archivo no encontrado' });

      // Eliminar archivo físico
      if (fileRecord.path && fs.existsSync(fileRecord.path)) {
        fs.unlinkSync(fileRecord.path);
      } else if (fileRecord.filepath && fs.existsSync(fileRecord.filepath)) {
        fs.unlinkSync(fileRecord.filepath);
      }

      await prisma.mediaFile.delete({ where: { id: fileRecord.id } });
      return res.json({ message: 'Archivo eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      return res.status(500).json({ error: 'Error al eliminar el archivo.' });
    }
  }

  try {
    const existing = await prisma.futsalMedia.findUnique({ where: { id: parseInt(id, 10) } });
    if (!existing) {
      return res.status(404).json({ error: 'Contenido multimedia no encontrado.' });
    }

    await prisma.futsalMedia.delete({
      where: { id: parseInt(id, 10) }
    });
    res.json({ message: 'Contenido eliminado de la biblioteca.' });
  } catch (error) {
    logError({ module: 'NewberyTV', action: 'deleteMedia', error, req });
    res.status(500).json({ error: 'Error al eliminar el contenido.' });
  }
});

module.exports = router;
