const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const testRoutes = require('./routes/testRoutes');
const productosRoutes = require('./routes/productosRoutes');
const categoriasRoutes = require('./routes/categoriasRoutes');
const proveedoresRoutes = require('./routes/proveedoresRoutes');
const ventasRoutes = require('./routes/ventasRoutes');
const reportesRoutes = require('./routes/reportesRoutes');
const notificacionesRoutes = require('./routes/notificacionesRoutes');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rutas públicas (sin autenticación)
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);

// Middleware de autenticación para rutas protegidas
app.use(authMiddleware);

app.use('/api/productos', productosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/notificaciones', notificacionesRoutes);

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

module.exports = app;
