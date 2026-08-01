const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      database: 'OK',
      api: 'OK',
      storage: 'OK'
    }
  });
});

module.exports = router;
