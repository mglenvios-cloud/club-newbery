const express = require('express');
const router = express.Router();

// POST /api/demo-contact
router.post('/', async (req, res) => {
  return res.status(410).json({ error: 'El servicio de contacto de demostración ha sido deshabilitado permanentemente.' });
});

module.exports = router;
