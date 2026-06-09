-- =============================================================
-- INSERT: Segundo Administrador del Sistema
-- =============================================================

-- Verificar si admin@tienda.com ya existe
SELECT COUNT(*) as 'admin@tienda.com existe' FROM usuarios WHERE correo = 'admin@tienda.com';

-- Insertar Administrador 1 (si no existe)
-- Contraseña: admin123
-- Hash: $2b$10$8hyTbVLth9PtN1r.QLqemuc6Mf715goVV7BcbiTxlkTXlCkXP4eoG
INSERT IGNORE INTO usuarios (nombre, correo, password, rol) 
VALUES ('Administrador Principal', 'admin@tienda.com', '$2b$10$8hyTbVLth9PtN1r.QLqemuc6Mf715goVV7BcbiTxlkTXlCkXP4eoG', 'administrador');

-- Verificar si vania@gmail.com ya existe
SELECT COUNT(*) as 'vania@gmail.com existe' FROM usuarios WHERE correo = 'vania@gmail.com';

-- Insertar Administrador 2
-- Contraseña: 1234
-- Hash: $2b$10$uMgiXPiiYU.Yao9meMjVN./6w4qhfg4SxYMFn0vxAMKX5QuxklZqW
INSERT IGNORE INTO usuarios (nombre, correo, password, rol) 
VALUES ('Vania Pérez', 'vania@gmail.com', '$2b$10$uMgiXPiiYU.Yao9meMjVN./6w4qhfg4SxYMFn0vxAMKX5QuxklZqW', 'administrador');

-- Verificar que ambos usuarios existan
SELECT id_usuario, nombre, correo, rol, creado_en FROM usuarios ORDER BY creado_en ASC;
