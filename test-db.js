#!/usr/bin/env node

/**
 * TEST-DB.JS
 * Valida la conexión a MySQL y la integridad de la base de datos
 * 
 * Uso: node test-db.js
 */

require('dotenv').config({ override: true });
const mysql = require('mysql2/promise');

const tests = [];

// ============================================================
// UTILIDADES
// ============================================================

const log = (symbol, text) => {
  console.log(`${symbol} ${text}`);
};

const logSection = (title) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${title}`);
  console.log('='.repeat(60));
};

const addTest = (name, result, message = '') => {
  tests.push({ name, result, message });
  const symbol = result ? '✅' : '❌';
  log(symbol, `${name}${message ? ` - ${message}` : ''}`);
};

// ============================================================
// TEST SUITE
// ============================================================

const runTests = async () => {
  logSection('🧪 TEST DE CONEXIÓN MYSQL - SISTEMA DE GESTIÓN DE INVENTARIO');

  // TEST 1: Variables de entorno
  console.log('\n📋 CREDENCIALES DESDE .env:');
  log('ℹ️ ', `Host: ${process.env.DB_HOST || 'localhost'}`);
  log('ℹ️ ', `Port: ${process.env.DB_PORT || 3306}`);
  log('ℹ️ ', `User: ${process.env.DB_USER || 'root'}`);
  log('ℹ️ ', `Database: ${process.env.DB_NAME || 'gestion_tienda'}`);
  log('ℹ️ ', `Password: ${process.env.DB_PASSWORD ? '✓ Definida' : '✗ NO DEFINIDA'}\n`);

  // TEST 2: Conectar sin base de datos
  let connection = null;
  logSection('PASO 1: Conectar al servidor MySQL');
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });
    addTest('Conexión al servidor MySQL', true);
  } catch (error) {
    addTest('Conexión al servidor MySQL', false, error.message);
    logSection('DIAGNÓSTICO: FALLO EN CONEXIÓN BÁSICA');
    console.log('SOLUCIONES:');
    console.log('1. Verifica que MySQL está ejecutándose:');
    console.log('   Windows: net start MySQL80');
    console.log('   Mac: brew services start mysql');
    console.log('   Linux: sudo systemctl start mysql');
    console.log('\n2. Verifica las credenciales en .env\n');
    process.exit(1);
  }

  // TEST 3: Conectar a base de datos específica
  logSection('PASO 2: Conectar a la base de datos específica');
  
  try {
    const newConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'gestion_tienda',
    });
    addTest(`Base de datos '${process.env.DB_NAME || 'gestion_tienda'}'`, true);
    
    if (connection) await connection.end();
    connection = newConnection;
  } catch (error) {
    addTest(`Base de datos '${process.env.DB_NAME || 'gestion_tienda'}'`, false, error.message);
    
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n⚠️  La base de datos no existe. Creándola...');
      try {
        const tempConn = await mysql.createConnection({
          host: process.env.DB_HOST || 'localhost',
          port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
        });
        await tempConn.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'gestion_tienda'}`);
        console.log('✅ Base de datos creada\n');
        await tempConn.end();
        
        connection = await mysql.createConnection({
          host: process.env.DB_HOST || 'localhost',
          port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_NAME || 'gestion_tienda',
        });
      } catch (createError) {
        addTest('Crear base de datos', false, createError.message);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }

  // TEST 4: Ping
  logSection('PASO 3: Verificar conexión (PING)');
  
  try {
    await connection.ping();
    addTest('PING a MySQL', true);
  } catch (error) {
    addTest('PING a MySQL', false, error.message);
    await connection.end();
    process.exit(1);
  }

  // TEST 5: Verificar tabla usuarios
  logSection('PASO 4: Verificar tabla usuarios');
  
  let tableExists = false;
  try {
    const [tables] = await connection.query('SHOW TABLES LIKE "usuarios"');
    tableExists = tables.length > 0;
    addTest('Tabla "usuarios" existe', tableExists);
  } catch (error) {
    addTest('Tabla "usuarios" existe', false, error.message);
  }

  // TEST 6: Contar usuarios
  logSection('PASO 5: Verificar usuarios administrativos');
  
  let totalUsers = 0;
  let admin1Exists = false;
  let admin2Exists = false;
  
  if (tableExists) {
    try {
      const [users] = await connection.query('SELECT COUNT(*) as total FROM usuarios');
      totalUsers = users[0].total;
      addTest(`Total de usuarios en BD`, true, `${totalUsers} usuario(s)`);
      
      // Verificar usuarios específicos
      const [admin1] = await connection.query(
        'SELECT id_usuario, nombre FROM usuarios WHERE correo = ?',
        ['admin@tienda.com']
      );
      admin1Exists = admin1.length > 0;
      addTest('✓ Administrador 1 (admin@tienda.com)', admin1Exists, 
        admin1Exists ? admin1[0].nombre : 'No encontrado');
      
      const [admin2] = await connection.query(
        'SELECT id_usuario, nombre FROM usuarios WHERE correo = ?',
        ['vania@gmail.com']
      );
      admin2Exists = admin2.length > 0;
      addTest('✓ Administrador 2 (vania@gmail.com)', admin2Exists,
        admin2Exists ? admin2[0].nombre : 'No encontrado');
      
      // Listar todos los usuarios
      if (totalUsers > 0) {
        console.log('\n📊 Usuarios en la base de datos:');
        const [allUsers] = await connection.query(
          'SELECT id_usuario, nombre, correo, rol FROM usuarios ORDER BY creado_en ASC'
        );
        allUsers.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.nombre} (${user.correo}) - ${user.rol}`);
        });
      }
    } catch (error) {
      addTest('Lectura de usuarios', false, error.message);
    }
  }

  // TEST 7: Verificar otras tablas principales
  logSection('PASO 6: Verificar tablas del sistema');
  
  const requiredTables = ['categorias', 'proveedores', 'productos', 'ventas', 'detalle_ventas', 'notificaciones'];
  
  try {
    for (const table of requiredTables) {
      const [tableCheck] = await connection.query(`SHOW TABLES LIKE "${table}"`);
      addTest(`Tabla "${table}"`, tableCheck.length > 0);
    }
  } catch (error) {
    console.error('Error verificando tablas:', error.message);
  }

  // TEST 8: Verificar .env está siendo leído
  logSection('PASO 7: Verificar variables de entorno');
  
  addTest('.env DB_HOST', !!process.env.DB_HOST, process.env.DB_HOST);
  addTest('.env DB_PORT', !!process.env.DB_PORT, process.env.DB_PORT);
  addTest('.env DB_USER', !!process.env.DB_USER, process.env.DB_USER);
  addTest('.env DB_NAME', !!process.env.DB_NAME, process.env.DB_NAME);
  addTest('.env DB_PASSWORD', !!process.env.DB_PASSWORD, process.env.DB_PASSWORD ? '✓' : '✗');

  // Cerrar conexión
  await connection.end();

  // RESUMEN FINAL
  logSection('📊 RESUMEN DEL TEST');
  
  const passed = tests.filter(t => t.result).length;
  const total = tests.length;
  const passPercentage = ((passed / total) * 100).toFixed(1);
  
  console.log(`\n✅ Tests pasados: ${passed}/${total} (${passPercentage}%)\n`);
  
  if (passed === total) {
    console.log('🎉 ¡TODOS LOS TESTS PASARON! Sistema listo para usar.\n');
    logSection('PRÓXIMOS PASOS');
    console.log('1. Ejecuta: npm start');
    console.log('2. Abre: http://localhost:3000');
    console.log('3. Prueba login con:');
    console.log('   - Email: admin@tienda.com');
    console.log('   - Password: admin123');
    console.log('   O con:');
    console.log('   - Email: vania@gmail.com');
    console.log('   - Password: 1234\n');
  } else {
    console.log('⚠️  Algunos tests fallaron. Revisa la configuración.\n');
    process.exit(1);
  }
};

// Ejecutar
runTests().catch(error => {
  console.error('\n❌ Error fatal:', error.message);
  process.exit(1);
});
