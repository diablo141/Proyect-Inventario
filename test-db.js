/**
 * Script para probar conexión a MySQL
 * Uso: node test-db.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const testConnection = async () => {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 PRUEBA DE CONEXIÓN MYSQL');
  console.log('='.repeat(60) + '\n');

  // 1. Mostrar variables de entorno
  console.log('📋 CONFIGURACIÓN DESDE .env:\n');
  console.log(`Host:     ${process.env.DB_HOST || 'localhost'}`);
  console.log(`Port:     ${process.env.DB_PORT || 3306}`);
  console.log(`User:     ${process.env.DB_USER || 'root'}`);
  console.log(`Password: ${process.env.DB_PASSWORD ? '✓ Definida' : '✗ NO DEFINIDA'}`);
  console.log(`Database: ${process.env.DB_NAME || 'gestion_tienda'}\n`);

  // 2. Intentar conexión simple (sin base de datos primero)
  console.log('📡 Paso 1: Conectando a MySQL sin seleccionar base de datos...\n');
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    console.log('✅ Conexión exitosa al servidor MySQL\n');
    await connection.end();
  } catch (error) {
    console.error('❌ FALLO en conexión básica:');
    console.error(`   ${error.message}\n`);
    console.error('SOLUCIONES:');
    console.error('1. Verifica que MySQL está ejecutándose:');
    console.error('   Windows: net start MySQL80');
    console.error('   Mac: brew services start mysql');
    console.error('   Linux: sudo systemctl start mysql\n');
    console.error('2. Verifica credenciales en .env\n');
    console.error('3. Verifica que el usuario root existe\n');
    return;
  }

  // 3. Conectar con base de datos
  console.log('📡 Paso 2: Conectando a base de datos específica...\n');
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'gestion_tienda',
    });

    console.log(`✅ Conexión exitosa a base de datos '${process.env.DB_NAME}'\n`);

    // 4. Hacer ping
    console.log('📡 Paso 3: Verificando ping...\n');
    await connection.ping();
    console.log('✅ Ping exitoso\n');

    // 5. Verificar tablas
    console.log('📋 Paso 4: Listando tablas...\n');
    const [tables] = await connection.query('SHOW TABLES');
    
    if (tables.length === 0) {
      console.log('⚠️  No hay tablas en la base de datos');
      console.log('Solución: Ejecuta el script SQL de inicialización:\n');
      console.log(`   mysql -u ${process.env.DB_USER} -p${process.env.DB_PASSWORD} ${process.env.DB_NAME} < database/gestion_tienda.sql\n`);
    } else {
      console.log(`✅ Base de datos contiene ${tables.length} tabla(s):\n`);
      tables.forEach((row, idx) => {
        const tableName = Object.values(row)[0];
        console.log(`   ${idx + 1}. ${tableName}`);
      });
      console.log();
    }

    await connection.end();
    console.log('✅ TODOS LOS TESTS PASARON\n');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ FALLO en conexión a base de datos:');
    console.error(`   ${error.message}\n`);
    console.error('CAUSAS POSIBLES:');
    if (error.code === 'ER_ACCESS_DENIED_FOR_USER') {
      console.error('   → Contraseña incorrecta o usuario no existe');
      console.error('   → Solución: Verifica .env y credenciales en MySQL\n');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('   → La base de datos no existe');
      console.error('   → Solución: Crea la BD e importa gestion_tienda.sql\n');
    } else {
      console.error('   → Error desconocido\n');
    }
    return;
  }
};

testConnection();
