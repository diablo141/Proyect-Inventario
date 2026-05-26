const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventasController');

router.get('/', ventasController.getVentas);
router.get('/estadisticas', ventasController.getEstadisticas);
router.post('/', ventasController.createVenta);

module.exports = router;
