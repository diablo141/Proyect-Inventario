-- ============================================================
-- VERIFICACIÓN DE CONEXIÓN Y USUARIOS EN MYSQL
-- ============================================================

-- 1. Ver el usuario actual
SELECT USER() as 'Usuario Actual';

-- 2. Listar todos los usuarios de MySQL
SELECT user, host FROM mysql.user;

-- 3. Ver privilegios del usuario root en localhost
SHOW GRANTS FOR 'root'@'localhost';

-- 4. Verificar que la base de datos existe
SHOW DATABASES LIKE 'gestion_tienda';

-- 5. Si la base de datos existe, mostrar sus tablas
USE gestion_tienda;
SHOW TABLES;

-- 6. Ver estructura de la tabla usuarios (si existe)
DESCRIBE usuarios;

-- ============================================================
-- Si necesitas recrear el usuario root (CUIDADO):
-- ============================================================
-- DROP USER 'root'@'localhost';
-- CREATE USER 'root'@'localhost' IDENTIFIED BY 'Pablo.141';
-- GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;
-- FLUSH PRIVILEGES;
