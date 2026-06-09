#!/usr/bin/env node

/**
 * TEST-LOGIN.JS
 * Prueba automáticamente el login de los dos administradores
 * 
 * Uso: node test-login.js
 * 
 * Requisito: El servidor debe estar ejecutándose (npm start)
 */

require('dotenv').config({ override: true });
const http = require('http');

const API_BASE_URL = `http://localhost:${process.env.PORT || 3000}`;

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
// FUNCIONES HTTP
// ============================================================

const makeRequest = (method, path, body = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: data ? JSON.parse(data) : null,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
            headers: res.headers
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
// TEST SUITE
// ============================================================

const testAdminLogin = async (email, password, adminName) => {
  logSection(`PROBANDO LOGIN: ${adminName}`);
  
  log('ℹ️ ', `Email: ${email}`);
  log('ℹ️ ', `Password: ${'*'.repeat(password.length)}`);
  log('ℹ️ ', `URL: POST ${API_BASE_URL}/api/auth/login\n`);

  try {
    const response = await makeRequest('POST', '/api/auth/login', {
      email: email,
      password: password
    });

    addTest(`Respuesta del servidor`, response.status !== null);
    addTest(`Status code`, response.status === 200, `${response.status}`);

    if (response.status === 200 && response.data) {
      addTest('Token JWT recibido', !!response.data.token, 
        response.data.token ? `${response.data.token.substring(0, 20)}...` : 'No');
      
      if (response.data.usuario) {
        addTest('Datos de usuario', true, response.data.usuario.nombre);
        log('ℹ️ ', `Rol: ${response.data.usuario.rol}`);
        log('ℹ️ ', `ID: ${response.data.usuario.id_usuario}`);
      }

      return response.data.token;
    } else {
      addTest('Mensaje de error', true, response.data?.message || 'No especificado');
      return null;
    }
  } catch (error) {
    addTest('Conexión al servidor', false, error.message);
    return null;
  }
};

const testProfileEndpoint = async (token, adminName) => {
  logSection(`VERIFICANDO PERFIL: ${adminName}`);
  
  if (!token) {
    log('❌', 'No hay token, saltando test de perfil');
    return;
  }

  try {
    const response = await makeRequest('GET', '/api/auth/profile', null);
    response.headers = { 'Authorization': `Bearer ${token}` };

    // Rehacemos la request con el token
    const url = new URL('/api/auth/profile', API_BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const result = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({
              status: res.statusCode,
              data: JSON.parse(data)
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
      req.end();
    });

    addTest(`Endpoint /api/auth/profile`, result.status === 200, `Status ${result.status}`);
    
    if (result.status === 200 && result.data) {
      addTest('Datos de perfil', true, result.data.nombre);
    }
  } catch (error) {
    addTest('Test de perfil', false, error.message);
  }
};

const testAPIEndpoint = async () => {
  logSection('PROBANDO ENDPOINT: GET /api/test');

  try {
    const response = await makeRequest('GET', '/api/test', null);

    addTest(`Endpoint /api/test`, response.status === 200, `Status ${response.status}`);
    
    if (response.data) {
      addTest('Status en respuesta', response.data.status === 'ok', response.data.status);
      addTest('MySQL conectado', response.data.mysql === 'connected', response.data.mysql);
      addTest('Servidor corriendo', response.data.server === 'running', response.data.server);
    }
  } catch (error) {
    addTest('Conexión a /api/test', false, error.message);
  }
};

// ============================================================
// MAIN
// ============================================================

const runTests = async () => {
  logSection('🧪 TEST DE LOGIN - SISTEMA DE GESTIÓN DE INVENTARIO');
  
  log('ℹ️ ', `URL del servidor: ${API_BASE_URL}`);
  log('ℹ️ ', `Comprobando si el servidor está activo...\n`);

  // Verificar que el servidor está corriendo
  try {
    const response = await makeRequest('GET', '/', null);
    addTest('Servidor activo', response.status !== null);
  } catch (error) {
    console.error('\n❌ El servidor no está corriendo');
    console.error(`   Error: ${error.message}`);
    console.error(`\nSolución: Ejecuta "npm start" en otra terminal\n`);
    process.exit(1);
  }

  // Test de endpoint /api/test
  await testAPIEndpoint();

  // Test de login Admin 1
  let token1 = await testAdminLogin('admin@tienda.com', 'admin123', 'Admin 1 (admin@tienda.com)');
  
  // Test de perfil Admin 1
  await testProfileEndpoint(token1, 'Admin 1');

  // Test de login Admin 2
  let token2 = await testAdminLogin('vania@gmail.com', '1234', 'Admin 2 (vania@gmail.com)');
  
  // Test de perfil Admin 2
  await testProfileEndpoint(token2, 'Admin 2');

  // RESUMEN FINAL
  logSection('📊 RESUMEN DEL TEST');
  
  const passed = tests.filter(t => t.result).length;
  const total = tests.length;
  const passPercentage = ((passed / total) * 100).toFixed(1);
  
  console.log(`\n✅ Tests pasados: ${passed}/${total} (${passPercentage}%)\n`);
  
  if (passed === total) {
    console.log('🎉 ¡TODOS LOS TESTS DE LOGIN PASARON!\n');
    logSection('FRONTEND LISTO');
    console.log('1. Abre el navegador: http://localhost:3000/login');
    console.log('2. Ingresa credenciales:');
    console.log('   - Email: admin@tienda.com');
    console.log('   - Password: admin123');
    console.log('   O:');
    console.log('   - Email: vania@gmail.com');
    console.log('   - Password: 1234\n');
  } else {
    console.log('⚠️  Algunos tests fallaron.\n');
    process.exit(1);
  }
};

// Ejecutar
runTests().catch(error => {
  console.error('\n❌ Error fatal:', error.message);
  process.exit(1);
});
