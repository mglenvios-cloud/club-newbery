const express = require('express');
const router = express.Router();

// POST /api/demo-contact
router.post('/', async (req, res) => {
  const { clubName, contactName, email, phone, membersCount, sports, message } = req.body;
  try {
    console.log('[Demo Contact Submission]', { clubName, contactName, email, phone, membersCount, sports, message });
    res.status(200).json({
      message: '¡Solicitud recibida exitosamente! Nuestro equipo comercial se pondrá en contacto con tu club a la brevedad.'
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar la solicitud de contacto.' });
  }
});

module.exports = router;
