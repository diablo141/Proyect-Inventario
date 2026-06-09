#!/usr/bin/env node

/**
 * DIAGNOSTICO.JS
 * Script completo de diagnóstico del Sistema de Gestión de Inventario
 * 
 * Verifica:
 * ✓ Servidor Express
 * ✓ MySQL conexión
 * ✓ Base de datos
 * ✓ Tabla de usuarios
 * ✓ Usuarios administrativos
 * ✓ JWT
 * ✓ Rutas API
 * ✓ Archivos frontend
 * ✓ Login
 * ✓ Dashboard
 * 
 * Uso: node diagnostico.js
 */

require('dotenv').config({ override: true });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const http = require('http');

const results = {
  server: null,
  mysql: null,
  database: null,
  usuarios_table: null,
  admin_users: null,
  jwt: null,
  routes: [],
  files: [],
  login: null,
  dashboard: null
};

// ============================================================
// UTILIDADES
// ============================================================

const log = (symbol, text) => console.log(`${symbol} ${text}`);
const section = (title) => {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`${title}`);
  console.log('='.repeat(70));
};

const checkMark = (value) => value ? '✅' : '❌';
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================
// TEST: SERVIDOR
// ============================================================

const testServer = async () => {
  section('🖥️  SERVIDOR EXPRESS');
  
  try {
    const response = await makeRequest('GET', 'http://localhost:3000/', null);
    const isRunning = response.status !== null;
    results.server = isRunning;
    
    log(checkMark(isRunning), `Servidor corriendo en http://localhost:3000`);
    log('ℹ️ ', `Status code: ${response.status}`);
    
    return isRunning;
  } catch (error) {
    results.server = false;
    log('❌', `Servidor no está corriendo: ${error.message}`);
    log('ℹ️ ', 'Solución: Ejecuta "npm start" en otra terminal');
    return false;
  }
};

// ============================================================
// TEST: MySQL
// ============================================================

const testMySQL = async () => {
  section('🗄️  MYSQL CONEXIÓN');
  
  log('ℹ️ ', `Host: ${process.env.DB_HOST || 'localhost'}`);
  log('ℹ️ ', `Port: ${process.env.DB_PORT || 3306}`);
  log('ℹ️ ', `User: ${process.env.DB_USER || 'root'}`);
  log('ℹ️ ', `Database: ${process.env.DB_NAME || 'gestion_tienda'}\n`);
  
  let connection = null;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });
    
    log('✅', 'Conexión a servidor MySQL exitosa');
    results.mysql = true;
    
    // Test base de datos
    try {
      const dbConnection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'gestion_tienda',
      });
      
      log('✅', `Base de datos '${process.env.DB_NAME || 'gestion_tienda'}' encontrada`);
      results.database = true;
      
      // Test tabla usuarios
      const [tables] = await dbConnection.query('SHOW TABLES LIKE "usuarios"');
      const usuariosExists = tables.length > 0;
      log(checkMark(usuariosExists), `Tabla 'usuarios' ${usuariosExists ? 'encontrada' : 'NO encontrada'}`);
      results.usuarios_table = usuariosExists;
      
      // Contar usuarios
      if (usuariosExists) {
        const [users] = await dbConnection.query('SELECT COUNT(*) as total FROM usuarios');
        const totalUsers = users[0].total;
        log('ℹ️ ', `Total de usuarios: ${totalUsers}`);
        
        // Verificar usuarios específicos
        const [admin1] = await dbConnection.query(
          'SELECT id_usuario, nombre FROM usuarios WHERE correo = ?',
          ['admin@tienda.com']
        );
        const admin1Exists = admin1.length > 0;
        log(checkMark(admin1Exists), `Administrador 1: admin@tienda.com ${admin1Exists ? '✓' : '✗'}`);
        
        const [admin2] = await dbConnection.query(
          'SELECT id_usuario, nombre FROM usuarios WHERE correo = ?',
          ['vania@gmail.com']
        );
        const admin2Exists = admin2.length > 0;
        log(checkMark(admin2Exists), `Administrador 2: vania@gmail.com ${admin2Exists ? '✓' : '✗'}`);
        
        results.admin_users = admin1Exists && admin2Exists;
      }
      
      await dbConnection.end();
    } catch (error) {
      log('❌', `Error con base de datos: ${error.message}`);
      results.database = false;
    }
    
    await connection.end();
  } catch (error) {
    log('❌', `Error de conexión MySQL: ${error.message}`);
    results.mysql = false;
  }
};

// ============================================================
// TEST: JWT
// ============================================================

const testJWT = async () => {
  section('🔐 JWT - TOKENS');
  
  const jwtSecret = process.env.JWT_SECRET;
  log('ℹ️ ', `JWT_SECRET: ${jwtSecret ? '✓ Definido' : '✗ NO DEFINIDO'}`);
  
  try {
    // Intentar login
    const response = await makeRequest(
      'POST',
      'http://localhost:3000/api/auth/login',
      {
        email: 'admin@tienda.com',
        password: 'admin123'
      }
    );
    
    if (response.status === 200 && response.data.token) {
      const token = response.data.token;
      log('✅', 'Login exitoso - JWT generado');
      log('ℹ️ ', `Token: ${token.substring(0, 20)}...`);
      results.jwt = true;
    } else {
      log('❌', `Login fallido: ${response.data?.message || 'Error desconocido'}`);
      results.jwt = false;
    }
  } catch (error) {
    log('❌', `Error probando JWT: ${error.message}`);
    results.jwt = false;
  }
};

// ============================================================
// TEST: RUTAS
// ============================================================

const testRoutes = async () => {
  section('🛣️  RUTAS API');
  
  const routes = [
    { method: 'GET', path: '/api/test', name: 'Test endpoint', auth: false },
    { method: 'GET', path: '/api/auth/profile', name: 'Profile (requiere auth)', auth: true },
    { method: 'GET', path: '/api/productos', name: 'Productos (requiere auth)', auth: true },
    { method: 'GET', path: '/api/categorias', name: 'Categorías (requiere auth)', auth: true },
    { method: 'GET', path: '/api/proveedores', name: 'Proveedores (requiere auth)', auth: true },
  ];
  
  let token = null;
  
  // Obtener token
  try {
    const response = await makeRequest(
      'POST',
      'http://localhost:3000/api/auth/login',
      {
        email: 'admin@tienda.com',
        password: 'admin123'
      }
    );
    
    if (response.data?.token) {
      token = response.data.token;
    }
  } catch (error) {
    log('⚠️ ', `No se pudo obtener token para verificar rutas protegidas`);
  }
  
  for (const route of routes) {
    try {
      const response = await makeRequest(route.method, `http://localhost:3000${route.path}`, null, token);
      const success = response.status < 400;
      
      log(checkMark(success), `${route.method} ${route.path}`);
      log('ℹ️ ', `  Status: ${response.status}`);
      
      results.routes.push({
        route: `${route.method} ${route.path}`,
        status: response.status,
        success
      });
    } catch (error) {
      log('❌', `${route.method} ${route.path} - ${error.message}`);
      results.routes.push({
        route: `${route.method} ${route.path}`,
        error: error.message,
        success: false
      });
    }
  }
};

// ============================================================
// TEST: ARCHIVOS FRONTEND
// ============================================================

const testFiles = async () => {
  section('📁 ARCHIVOS FRONTEND');
  
  const requiredFiles = [
    'src/public/index.html',
    'src/public/login.html',
    'src/public/css/style.css',
    'src/public/css/login.css',
    'src/public/js/app.js',
    'src/public/js/login.js'
  ];
  
  for (const file of requiredFiles) {
    const fullPath = path.join(__dirname, file);
    const exists = fs.existsSync(fullPath);
    
    log(checkMark(exists), file);
    if (!exists) {
      log('⚠️ ', `  Archivo faltante`);
    }
    
    results.files.push({
      file,
      exists
    });
  }
};

// ============================================================
// TEST: LOGIN FLOW
// ============================================================

const testLoginFlow = async () => {
  section('🔑 FLUJO DE LOGIN');
  
  // Login con Admin 1
  log('ℹ️ ', 'Probando login con admin@tienda.com / admin123...\n');
  
  try {
    const response = await makeRequest(
      'POST',
      'http://localhost:3000/api/auth/login',
      {
        email: 'admin@tienda.com',
        password: 'admin123'
      }
    );
    
    if (response.status === 200 && response.data.token) {
      log('✅', 'Administrador 1 login exitoso');
      const token = response.data.token;
      results.login = true;
      
      // Verificar token con profile
      log('ℹ️ ', 'Verificando token con /api/auth/profile...\n');
      const profileResponse = await makeRequest(
        'GET',
        'http://localhost:3000/api/auth/profile',
        null,
        token
      );
      
      if (profileResponse.status === 200) {
        log('✅', 'Token válido - Perfil recuperado');
        log('ℹ️ ', `  Nombre: ${profileResponse.data.nombre}`);
        log('ℹ️ ', `  Email: ${profileResponse.data.correo}`);
        log('ℹ️ ', `  Rol: ${profileResponse.data.rol}`);
      } else {
        log('❌', 'Token no válido');
        results.login = false;
      }
    } else {
      log('❌', `Login fallido: ${response.data?.message || 'Error desconocido'}`);
      results.login = false;
    }
  } catch (error) {
    log('❌', `Error en login: ${error.message}`);
    results.login = false;
  }
  
  // Login con Admin 2
  log('\nℹ️ ', 'Probando login con vania@gmail.com / 1234...\n');
  
  try {
    const response = await makeRequest(
      'POST',
      'http://localhost:3000/api/auth/login',
      {
        email: 'vania@gmail.com',
        password: '1234'
      }
    );
    
    if (response.status === 200 && response.data.token) {
      log('✅', 'Administrador 2 login exitoso');
      log('ℹ️ ', `  Nombre: ${response.data.usuario.nombre}`);
      log('ℹ️ ', `  Email: ${response.data.usuario.correo}`);
    } else {
      log('❌', `Login fallido: ${response.data?.message || 'Error desconocido'}`);
    }
  } catch (error) {
    log('❌', `Error en login: ${error.message}`);
  }
};

// ============================================================
// TEST: DASHBOARD
// ============================================================

const testDashboard = async () => {
  section('📊 DASHBOARD');
  
  try {
    // Obtener token
    const loginResponse = await makeRequest(
      'POST',
      'http://localhost:3000/api/auth/login',
      {
        email: 'admin@tienda.com',
        password: 'admin123'
      }
    );
    
    if (!loginResponse.data?.token) {
      log('❌', 'No se pudo obtener token para verificar dashboard');
      results.dashboard = false;
      return;
    }
    
    const token = loginResponse.data.token;
    
    // Verificar acceso a recursos del dashboard
    const resources = [
      { path: '/api/productos', name: 'Productos' },
      { path: '/api/categorias', name: 'Categorías' },
      { path: '/api/proveedores', name: 'Proveedores' },
      { path: '/api/ventas', name: 'Ventas' },
      { path: '/api/notificaciones', name: 'Notificaciones' },
    ];
    
    let allAccessible = true;
    
    for (const resource of resources) {
      try {
        const response = await makeRequest('GET', `http://localhost:3000${resource.path}`, null, token);
        const accessible = response.status < 400;
        
        log(checkMark(accessible), `${resource.name} - Status ${response.status}`);
        
        if (!accessible) {
          allAccessible = false;
        }
      } catch (error) {
        log('❌', `${resource.name} - ${error.message}`);
        allAccessible = false;
      }
    }
    
    results.dashboard = allAccessible;
  } catch (error) {
    log('❌', `Error verificando dashboard: ${error.message}`);
    results.dashboard = false;
  }
};

// ============================================================
// FUNCIONES HTTP
// ============================================================

const makeRequest = (method, url, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });
    
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

// ============================================================
// REPORTE FINAL
// ============================================================

const generateReport = () => {
  section('📋 REPORTE FINAL DEL DIAGNÓSTICO');
  
  console.log('\n📊 RESUMEN DE COMPONENTES:\n');
  
  console.log(`${checkMark(results.server)}   Servidor Express`);
  console.log(`${checkMark(results.mysql)}   MySQL - Conexión`);
  console.log(`${checkMark(results.database)}   Base de datos 'gestion_tienda'`);
  console.log(`${checkMark(results.usuarios_table)}   Tabla 'usuarios'`);
  console.log(`${checkMark(results.admin_users)}   Usuarios administrativos`);
  console.log(`${checkMark(results.jwt)}   JWT / Autenticación`);
  console.log(`${checkMark(results.login)}   Flujo de Login`);
  console.log(`${checkMark(results.dashboard)}   Dashboard / Recursos`);
  
  const allFiles = results.files.every(f => f.exists);
  console.log(`${checkMark(allFiles)}   Archivos frontend`);
  
  const allRoutes = results.routes.every(r => r.success);
  console.log(`${checkMark(allRoutes)}   Rutas API`);
  
  const systemReady = results.server && results.mysql && results.database && 
                     results.usuarios_table && results.admin_users && results.jwt && 
                     results.login && results.dashboard && allFiles && allRoutes;
  
  console.log('\n' + '='.repeat(70));
  if (systemReady) {
    console.log('🎉 ¡SISTEMA LISTO PARA PRODUCCIÓN!');
    console.log('\n✅ TODOS LOS COMPONENTES FUNCIONAN CORRECTAMENTE\n');
    console.log('Próximos pasos:');
    console.log('1. Abre: http://localhost:3000/login');
    console.log('2. Prueba con:');
    console.log('   - admin@tienda.com / admin123');
    console.log('   - vania@gmail.com / 1234');
    console.log('3. Accede al dashboard completamente funcional\n');
  } else {
    console.log('⚠️  El sistema tiene problemas. Revisa los errores arriba.\n');
  }
  console.log('='.repeat(70) + '\n');
};

// ============================================================
// MAIN
// ============================================================

const main = async () => {
  console.clear();
  console.log('\n');
  section('🔍 DIAGNÓSTICO DEL SISTEMA DE GESTIÓN DE INVENTARIO\n');
  
  log('ℹ️ ', 'Iniciando pruebas completas del sistema...\n');
  
  // Si el servidor no está corriendo, intentamos esperar
  const serverRunning = await testServer();
  
  if (!serverRunning) {
    section('⚠️  ERROR CRÍTICO');
    log('❌', 'El servidor Express no está corriendo');
    log('ℹ️ ', 'Por favor, ejecuta "npm start" en otra terminal y luego vuelve a ejecutar este script');
    process.exit(1);
  }
  
  await testMySQL();
  await testJWT();
  await testRoutes();
  await testFiles();
  await testLoginFlow();
  await testDashboard();
  
  generateReport();
  process.exit(results.server && results.mysql && results.login ? 0 : 1);
};

main().catch(error => {
  console.error('\n❌ Error fatal:', error.message);
  process.exit(1);
});
