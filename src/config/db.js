const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ override: true });

console.log('📊 CREDENCIALES DE CONEXIÓN:');
console.log(`  Host: ${process.env.DB_HOST}`);
console.log(`  Port: ${process.env.DB_PORT}`);
console.log(`  User: ${process.env.DB_USER}`);
console.log(`  Database: ${process.env.DB_NAME}`);
console.log(`  Password: ${process.env.DB_PASSWORD ? '✓ Definida' : '✗ No definida'}\n`);

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'acela.proxy.rlwy.net',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 32431,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'sTJipQKINLyztzSAgWgkScBPBlOmidoR',
  database: process.env.DB_NAME || 'login',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true
});

const verifyConnection = async () => {
  try {
    console.log('🔍 Intentando conexión a MySQL...');
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ MySQL conectado correctamente\n');
    return true;
  } catch (error) {
    console.error('❌ ERROR de conexión MySQL:');
    console.error(`   ${error.message}\n`);
    console.error('CAUSAS POSIBLES:');
    console.error('1. Usuario root no existe en MySQL');
    console.error('2. Contraseña incorrecta (verificar .env)');
    console.error('3. MySQL no está ejecutándose');
    console.error('4. Host o puerto incorrectos\n');
    throw error;
  }
};

// Agregar la función de verificación al pool para acceso desde server.js
pool.verifyConnection = verifyConnection;

module.exports = pool;
