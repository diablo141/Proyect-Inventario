const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');

router.get('/ventas', reportesController.ventasReport);
router.get('/productos', reportesController.productosReport);
router.get('/ganancias', reportesController.gananciasReport);

module.exports = router;
