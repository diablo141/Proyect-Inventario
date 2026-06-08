-- Script SQL completo para Sistema de Gestión de Inventario para Tienda
CREATE DATABASE IF NOT EXISTS gestion_tienda CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gestion_tienda;

DROP TABLE IF EXISTS detalle_ventas;
DROP TABLE IF EXISTS ventas;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS proveedores;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS notificaciones;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  rol VARCHAR(50) NOT NULL DEFAULT 'administrador',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS categorias (
  id_categoria INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL UNIQUE,
  descripcion VARCHAR(255),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS proveedores (
  id_proveedor INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  telefono VARCHAR(50) NOT NULL,
  correo VARCHAR(150) NOT NULL,
  direccion VARCHAR(255),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS productos (
  id_producto INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  categoria_id INT NOT NULL,
  proveedor_id INT NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  descripcion TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_producto_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id_categoria) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_producto_proveedor FOREIGN KEY (proveedor_id) REFERENCES proveedores(id_proveedor) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ventas (
  id_venta INT AUTO_INCREMENT PRIMARY KEY,
  total DECIMAL(12,2) NOT NULL,
  ganancia DECIMAL(12,2) NOT NULL DEFAULT 0,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS detalle_ventas (
  id_detalle INT AUTO_INCREMENT PRIMARY KEY,
  venta_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  CONSTRAINT fk_detalle_venta FOREIGN KEY (venta_id) REFERENCES ventas(id_venta) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_detalle_producto FOREIGN KEY (producto_id) REFERENCES productos(id_producto) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notificaciones (
  id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
  mensaje VARCHAR(255) NOT NULL,
  tipo ENUM('info','warning','alert') NOT NULL DEFAULT 'info',
  leido TINYINT(1) NOT NULL DEFAULT 0,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO usuarios (nombre, correo, password, rol) VALUES
('Administrador Principal', 'admin@tienda.com', '$2b$10$OdzFYGwWKio.DP8Brm/JDOP6lVgUQdNtdpl9fGlT7SNlf87eCNv56', 'administrador');

INSERT INTO categorias (nombre, descripcion) VALUES
('Calzado', 'Calzado deportivo y urbano'),
('Electrónica', 'Accesorios y dispositivos electrónicos'),
('Papelería', 'Material de oficina y escolar'),
('Hogar', 'Productos para el hogar y decoración');

INSERT INTO proveedores (nombre, telefono, correo, direccion) VALUES
('Proveedor Azul', '555-1234', 'contacto@proveedorazul.com', 'Av. Central 123'),
('Proveedor Digital', '555-5678', 'ventas@proveedordigital.com', 'Calle Tech 45'),
('Proveedor Office', '555-9012', 'oficina@proveedoffice.com', 'Boulevard Oficina 78');

INSERT INTO productos (nombre, categoria_id, proveedor_id, precio, stock, descripcion) VALUES
('Zapatillas deportivas', 1, 1, 59.99, 24, 'Zapatillas cómodas para uso diario'),
('Audífonos Bluetooth', 2, 2, 79.50, 14, 'Audífonos inalámbricos con sonido premium'),
('Cuaderno profesional', 3, 3, 8.20, 38, 'Cuaderno tapa dura para notas'),
('Cafetera eléctrica', 4, 2, 120.00, 9, 'Cafetera de goteo para hogar'),
('Bolígrafo gel', 3, 3, 1.50, 48, 'Bolígrafo suave y resistente'),
('Lámpara LED', 4, 1, 35.00, 6, 'Lámpara de escritorio con luz regulable'),
('Smartwatch', 2, 2, 149.99, 20, 'Reloj inteligente con monitoreo de salud'),
('Sandalias casuales', 1, 1, 29.95, 11, 'Sandalias de verano con diseño moderno');

INSERT INTO ventas (total, ganancia, creado_en) VALUES
(119.98, 119.98, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(47.70, 47.70, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(299.98, 299.98, NOW());

INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, total) VALUES
(1, 1, 2, 59.99, 119.98),
(2, 3, 3, 8.20, 24.60),
(2, 5, 3, 1.50, 4.50),
(3, 7, 2, 149.99, 299.98);

INSERT INTO notificaciones (mensaje, tipo) VALUES
('Producto "Lámpara LED" tiene stock bajo. Revisa el proveedor para reposición.', 'alert'),
('Producto "Cafetera eléctrica" está próximo a agotarse.', 'warning');
