const pool = require('../config/db');

const getNotificaciones = async (req, res) => {
  try {
    const [notificaciones] = await pool.query(
      'SELECT id_notificacion AS id, mensaje, tipo, leido, creado_en FROM notificaciones ORDER BY creado_en DESC LIMIT 20'
    );
    res.json(notificaciones);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ message: 'Error al obtener notificaciones' });
  }
};

module.exports = { getNotificaciones };
