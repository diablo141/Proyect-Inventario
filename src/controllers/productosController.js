const pool = require('../config/db');

const getProductos = async (req, res) => {
  try {
    const { search, categoria, proveedor, lowStock } = req.query;
    let query = `SELECT
      p.id_producto AS id,
      p.nombre,
      p.precio,
      p.stock,
      p.descripcion,
      p.categoria_id,
      p.proveedor_id,
      c.nombre AS categoria,
      pr.nombre AS proveedor
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id_categoria
      JOIN proveedores pr ON p.proveedor_id = pr.id_proveedor`;

    const filters = [];
    const values = [];

    if (search) {
      filters.push('p.nombre LIKE ?');
      values.push(`%${search}%`);
    }
    if (categoria) {
      filters.push('p.categoria_id = ?');
      values.push(categoria);
    }
    if (proveedor) {
      filters.push('p.proveedor_id = ?');
      values.push(proveedor);
    }
    if (lowStock === 'true') {
      filters.push('p.stock < 10');
    }

    if (filters.length) {
      query += ` WHERE ${filters.join(' AND ')}`;
    }

    query += ' ORDER BY p.stock ASC, p.nombre ASC';

    const [productos] = await pool.query(query, values);
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};

const getProductoById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT
        p.id_producto AS id,
        p.nombre,
        p.precio,
        p.stock,
        p.descripcion,
        p.categoria_id,
        p.proveedor_id,
        c.nombre AS categoria,
        pr.nombre AS proveedor
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id_categoria
      JOIN proveedores pr ON p.proveedor_id = pr.id_proveedor
      WHERE p.id_producto = ?`,
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
    const { nombre, precio, stock, descripcion, categoria_id, proveedor_id } = req.body;
    if (!nombre || precio == null || stock == null || !categoria_id || !proveedor_id) {
      return res.status(400).json({ message: 'Faltan campos obligatorios para crear el producto' });
    }

    const [result] = await pool.query(
      'INSERT INTO productos (nombre, precio, stock, descripcion, categoria_id, proveedor_id) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, precio, stock, descripcion || '', categoria_id, proveedor_id]
    );

    const [producto] = await pool.query(
      `SELECT
         p.id_producto AS id,
         p.nombre,
         p.precio,
         p.stock,
         p.descripcion,
         p.categoria_id,
         p.proveedor_id,
         c.nombre AS categoria,
         pr.nombre AS proveedor
       FROM productos p
       JOIN categorias c ON p.categoria_id = c.id_categoria
       JOIN proveedores pr ON p.proveedor_id = pr.id_proveedor
       WHERE p.id_producto = ?`,
      [result.insertId]
    );
    res.status(201).json(producto[0]);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ message: 'Error interno al crear producto' });
  }
};

const updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, precio, stock, descripcion, categoria_id, proveedor_id } = req.body;

    const [result] = await pool.query(
      'UPDATE productos SET nombre = ?, precio = ?, stock = ?, descripcion = ?, categoria_id = ?, proveedor_id = ? WHERE id_producto = ?',
      [nombre, precio, stock, descripcion || '', categoria_id, proveedor_id, id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const [producto] = await pool.query(
      `SELECT
         p.id_producto AS id,
         p.nombre,
         p.precio,
         p.stock,
         p.descripcion,
         p.categoria_id,
         p.proveedor_id,
         c.nombre AS categoria,
         pr.nombre AS proveedor
       FROM productos p
       JOIN categorias c ON p.categoria_id = c.id_categoria
       JOIN proveedores pr ON p.proveedor_id = pr.id_proveedor
       WHERE p.id_producto = ?`,
      [id]
    );
    res.json(producto[0]);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ message: 'Error interno al actualizar producto' });
  }
};

const deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM productos WHERE id_producto = ?', [id]);

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ message: 'Error interno al eliminar producto' });
  }
};

module.exports = {
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto
};
