const dotenv = require('dotenv');

// Cargar .env primero, ANTES de cualquier otra cosa
dotenv.config({ override: true });

const app = require('./app');
const pool = require('./config/db');
const { verifyAdminUsers } = require('./config/adminUsers');

const PORT = process.env.PORT || 3000;

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // ✅ Verificar conexión MySQL ANTES de escuchar
    await pool.verifyConnection();
    
    // ✅ Verificar y crear usuarios administrativos
    await verifyAdminUsers(pool);
    
    // Solo entonces iniciar Express
    app.listen(PORT, () => {
      console.log(`\n🚀 Servidor ejecutándose en http://localhost:${PORT}`);
      console.log('✅ Base de datos lista para usar\n');
    });
  } catch (error) {
    console.error('\n⚠️  No se pudo iniciar el servidor');
    console.error('Soluciona el error de conexión y vuelve a intentar.\n');
    process.exit(1);
  }
};

startServer();
