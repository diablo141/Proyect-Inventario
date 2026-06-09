const express = require('express');
const router = express.Router();
const pool = require('../config/db');

/**
 * GET /api/test
 * Endpoint de diagnóstico del sistema
 * 
 * Responde con el estado del servidor y la conexión MySQL
 */
router.get('/', async (req, res) => {
  try {
    // Verificar que el pool está disponible
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();

    res.json({
      status: 'ok',
      mysql: 'connected',
      server: 'running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      port: process.env.PORT || 3000
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      mysql: 'disconnected',
      server: 'running',
      error: error.message
    });
  }
});

module.exports = router;
