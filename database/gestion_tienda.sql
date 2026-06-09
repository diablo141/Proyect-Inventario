-- Script SQL completo para Sistema de Gesti�n de Inventario para Tienda
CREATE DATABASE IF NOT EXISTS gestion_tienda CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gestion_tienda;

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

INSERT IGNORE INTO usuarios (nombre, correo, password, rol) VALUES
('Administrador Principal', 'admin@tienda.com', '$2b$10$8hyTbVLth9PtN1r.QLqemuc6Mf715goVV7BcbiTxlkTXlCkXP4eoG', 'administrador');

INSERT IGNORE INTO categorias (nombre, descripcion) VALUES
('Calzado', 'Calzado deportivo y urbano'),
('Electr�nica', 'Accesorios y dispositivos electr�nicos'),
('Papeler�a', 'Material de oficina y escolar'),
('Hogar', 'Productos para el hogar y decoraci�n');

INSERT IGNORE INTO proveedores (nombre, telefono, correo, direccion) VALUES
('Proveedor Azul', '555-1234', 'contacto@proveedorazul.com', 'Av. Central 123'),
('Proveedor Digital', '555-5678', 'ventas@proveedordigital.com', 'Calle Tech 45'),
('Proveedor Office', '555-9012', 'oficina@proveedoffice.com', 'Boulevard Oficina 78');

INSERT IGNORE INTO productos (nombre, categoria_id, proveedor_id, precio, stock, descripcion) VALUES
('Zapatillas deportivas', 1, 1, 59.99, 24, 'Zapatillas c�modas para uso diario'),
('Aud�fonos Bluetooth', 2, 2, 79.50, 14, 'Aud�fonos inal�mbricos con sonido premium'),
('Cuaderno profesional', 3, 3, 8.20, 38, 'Cuaderno tapa dura para notas'),
('Cafetera el�ctrica', 4, 2, 120.00, 9, 'Cafetera de goteo para hogar'),
('Bol�grafo gel', 3, 3, 1.50, 48, 'Bol�grafo suave y resistente'),
('L�mpara LED', 4, 1, 35.00, 6, 'L�mpara de escritorio con luz regulable'),
('Smartwatch', 2, 2, 149.99, 20, 'Reloj inteligente con monitoreo de salud'),
('Sandalias casuales', 1, 1, 29.95, 11, 'Sandalias de verano con dise�o moderno');

INSERT IGNORE INTO ventas (total, ganancia, creado_en) VALUES
(119.98, 119.98, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(47.70, 47.70, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(299.98, 299.98, NOW());

INSERT IGNORE INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, total) VALUES
(1, 1, 2, 59.99, 119.98),
(2, 3, 3, 8.20, 24.60),
(2, 5, 3, 1.50, 4.50),
(3, 7, 2, 149.99, 299.98);

INSERT IGNORE INTO notificaciones (mensaje, tipo) VALUES
('Producto "L�mpara LED" tiene stock bajo. Revisa el proveedor para reposici�n.', 'alert'),
('Producto "Cafetera el�ctrica" est� pr�ximo a agotarse.', 'warning');