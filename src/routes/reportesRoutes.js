const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');

router.get('/ventas', reportesController.ventasReport);
router.get('/ganancias', reportesController.gananciasReport);
router.get('/productos', reportesController.productosReport);

module.exports = router;
