-- Base de datos completa para Sistema de Gestión de Inventario para Tienda
CREATE DATABASE IF NOT EXISTS gestion_tienda;
USE gestion_tienda;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(150) NOT NULL,
  rol VARCHAR(50) DEFAULT 'administrador',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion VARCHAR(255),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS proveedores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  contacto VARCHAR(150) NOT NULL,
  email VARCHAR(150),
  telefono VARCHAR(50),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  categoria_id INT NOT NULL,
  proveedor_id INT NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  descripcion TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  total DECIMAL(12,2) NOT NULL,
  gana DECIMAL(12,2) NOT NULL DEFAULT 0,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS detalle_ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venta_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mensaje VARCHAR(255) NOT NULL,
  tipo ENUM('info', 'warning', 'alert') DEFAULT 'info',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  leido BOOLEAN DEFAULT FALSE
) ENGINE=InnoDB;

INSERT INTO usuarios (nombre, email, password) VALUES
('Administrador Principal', 'admin@tienda.com', 'admin123');

INSERT INTO categorias (nombre, descripcion) VALUES
('Calzado', 'Productos de calzado y accesorios'),
('Electrónica', 'Dispositivos electrónicos y gadgets'),
('Papelería', 'Material de oficina y papelería'),
('Hogar', 'Productos para el hogar y decoración');

INSERT INTO proveedores (nombre, contacto, email, telefono) VALUES
('Proveedor Azul', 'María López', 'contacto@proveedorazul.com', '555-1234'),
('Proveedor Digital', 'Carlos Gómez', 'ventas@proveedordigital.com', '555-5678'),
('Proveedor Office', 'Luisa Pérez', 'oficina@proveedoffice.com', '555-9012');

INSERT INTO productos (nombre, categoria_id, proveedor_id, precio, stock, descripcion) VALUES
('Zapatillas deportivas', 1, 1, 59.99, 24, 'Zapatillas cómodas para uso diario'),
('Audífonos Bluetooth', 2, 2, 79.50, 14, 'Audífonos inalámbricos con sonido premium'),
('Cuaderno profesional', 3, 3, 8.20, 38, 'Cuaderno tapa dura para notas'),
('Cafetera eléctrica', 4, 2, 120.00, 9, 'Cafetera de goteo para hogar'),
('Bolígrafo gel', 3, 3, 1.50, 48, 'Bolígrafo suave y resistente'),
('Lámpara LED', 4, 1, 35.00, 6, 'Lámpara de escritorio con luz regulable'),
('Smartwatch', 2, 2, 149.99, 20, 'Reloj inteligente con monitoreo de salud'),
('Sandalias casuales', 1, 1, 29.95, 11, 'Sandalias de verano con diseño moderno');

INSERT INTO ventas (total, gana, creado_en) VALUES
(119.98, 0, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(47.70, 0, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(299.98, 0, NOW());

INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, total) VALUES
(1, 1, 2, 59.99, 119.98),
(2, 3, 3, 8.20, 24.60),
(2, 5, 3, 1.50, 4.50),
(3, 7, 2, 149.99, 299.98);

INSERT INTO notificaciones (mensaje, tipo) VALUES
('Producto "Lámpara LED" tiene stock bajo. Revisa el proveedor recomendado.', 'alert'),
('Producto "Cafetera eléctrica" está próximo a agotarse.', 'warning');
