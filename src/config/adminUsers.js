/**
 * Módulo para verificar y crear usuarios administrativos
 * Se ejecuta automáticamente al iniciar el servidor
 */

const ADMIN_USERS = [
  {
    nombre: 'Administrador Principal',
    correo: 'admin@tienda.com',
    password: 'admin123',
    // Hash pre-generado para admin123
    hash: '$2b$10$8hyTbVLth9PtN1r.QLqemuc6Mf715goVV7BcbiTxlkTXlCkXP4eoG',
    rol: 'administrador'
  },
  {
    nombre: 'Vania Pérez',
    correo: 'vania@gmail.com',
    password: '1234',
    // Hash pre-generado para 1234
    hash: '$2b$10$uMgiXPiiYU.Yao9meMjVN./6w4qhfg4SxYMFn0vxAMKX5QuxklZqW',
    rol: 'administrador'
  }
];

const verifyAdminUsers = async (pool) => {
  try {
    console.log('\n📋 Verificando usuarios administrativos...');
    
    for (const admin of ADMIN_USERS) {
      const [existing] = await pool.query(
        'SELECT id_usuario, nombre, correo FROM usuarios WHERE correo = ?',
        [admin.correo]
      );

      if (existing.length === 0) {
        // Usuario no existe, crear
        await pool.query(
          'INSERT INTO usuarios (nombre, correo, password, rol) VALUES (?, ?, ?, ?)',
          [admin.nombre, admin.correo, admin.hash, admin.rol]
        );
        console.log(`  ✅ CREADO: ${admin.correo} (${admin.nombre})`);
      } else {
        console.log(`  ✓ EXISTE: ${admin.correo} (${existing[0].nombre})`);
      }
    }

    // Mostrar todos los usuarios
    const [allUsers] = await pool.query(
      'SELECT id_usuario, nombre, correo, rol, creado_en FROM usuarios ORDER BY creado_en ASC'
    );
    
    console.log(`\n📊 Total de usuarios en el sistema: ${allUsers.length}\n`);
    
    return true;
  } catch (error) {
    console.error('❌ Error verificando usuarios:', error.message);
    return false;
  }
};

module.exports = {
  verifyAdminUsers,
  ADMIN_USERS
};
