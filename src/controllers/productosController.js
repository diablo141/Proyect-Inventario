const db = require('../config/db');

const getProductos = async (req, res) => {
  try {
    const { search, categoria, lowStock } = req.query;
    let query = `SELECT p.id, p.nombre, p.precio, p.stock, p.descripcion, p.categoria_id, p.proveedor_id, c.nombre AS categoria, v.nombre_proveedor AS proveedor, v.correo AS proveedor_correo, v.telefono AS proveedor_telefono
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      JOIN proveedores v ON p.proveedor_id = v.id_proveedor`;
    const conditions = [];
    const values = [];

    if (search) {
      conditions.push('p.nombre LIKE ?');
      values.push(`%${search}%`);
    }
    if (categoria) {
      conditions.push('p.categoria_id = ?');
      values.push(categoria);
    }
    if (lowStock === 'true') {
      conditions.push('p.stock < 10');
    }

    if (conditions.length) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' ORDER BY p.stock ASC, p.nombre ASC';

    const [productos] = await db.query(query, values);
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};

const getProductoById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT p.id, p.nombre, p.precio, p.stock, p.descripcion, p.categoria_id, p.proveedor_id, c.nombre AS categoria, v.nombre_proveedor AS proveedor, v.correo AS proveedor_correo, v.telefono AS proveedor_telefono
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      JOIN proveedores v ON p.proveedor_id = v.id_proveedor
      WHERE p.id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ message: 'Error al obtener producto' });
  }
};

const createProducto = async (req, res) => {
  try {
    const { nombre, categoria_id, proveedor_id, precio, stock, descripcion } = req.body;
    if (!nombre || !categoria_id || !proveedor_id || precio == null || stock == null) {
      return res.status(400).json({ message: 'Debe ingresar todos los campos requeridos' });
    }

    const [result] = await db.query(
      'INSERT INTO productos (nombre, categoria_id, proveedor_id, precio, stock, descripcion) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, categoria_id, proveedor_id, precio, stock, descripcion || '']
    );

    const [producto] = await db.query('SELECT * FROM productos WHERE id = ?', [result.insertId]);
    res.status(201).json(producto[0]);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ message: 'Error al crear producto' });
  }
};

const updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, categoria_id, proveedor_id, precio, stock, descripcion } = req.body;

    const [result] = await db.query(
      'UPDATE productos SET nombre = ?, categoria_id = ?, proveedor_id = ?, precio = ?, stock = ?, descripcion = ? WHERE id = ?',
      [nombre, categoria_id, proveedor_id, precio, stock, descripcion || '', id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const [producto] = await db.query('SELECT * FROM productos WHERE id = ?', [id]);
    res.json(producto[0]);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
};

const deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM productos WHERE id = ?', [id]);

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
};

module.exports = {
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto
};
