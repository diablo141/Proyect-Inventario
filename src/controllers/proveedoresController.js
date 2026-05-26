const db = require('../config/db');

const getProveedores = async (req, res) => {
  try {
    const [proveedores] = await db.query(
      'SELECT id_proveedor AS id, nombre_proveedor AS nombre, telefono, correo, direccion FROM proveedores ORDER BY nombre_proveedor ASC'
    );
    res.json(proveedores);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({ message: 'Error al obtener proveedores' });
  }
};

const getProveedorById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      'SELECT id_proveedor AS id, nombre_proveedor AS nombre, telefono, correo, direccion FROM proveedores WHERE id_proveedor = ?',
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener proveedor:', error);
    res.status(500).json({ message: 'Error al obtener proveedor' });
  }
};

const createProveedor = async (req, res) => {
  try {
    const { nombre, telefono, correo, direccion } = req.body;
    if (!nombre || !telefono || !correo) {
      return res.status(400).json({ message: 'Nombre, teléfono y correo son obligatorios' });
    }
    const [result] = await db.query(
      'INSERT INTO proveedores (nombre_proveedor, telefono, correo, direccion) VALUES (?, ?, ?, ?)',
      [nombre, telefono, correo, direccion || '']
    );
    const [proveedor] = await db.query('SELECT id_proveedor AS id, nombre_proveedor AS nombre, telefono, correo, direccion FROM proveedores WHERE id_proveedor = ?', [result.insertId]);
    res.status(201).json(proveedor[0]);
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    res.status(500).json({ message: 'Error al crear proveedor' });
  }
};

const updateProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, telefono, correo, direccion } = req.body;
    const [result] = await db.query(
      'UPDATE proveedores SET nombre_proveedor = ?, telefono = ?, correo = ?, direccion = ? WHERE id_proveedor = ?',
      [nombre, telefono, correo, direccion || '', id]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }
    const [proveedor] = await db.query('SELECT id_proveedor AS id, nombre_proveedor AS nombre, telefono, correo, direccion FROM proveedores WHERE id_proveedor = ?', [id]);
    res.json(proveedor[0]);
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    res.status(500).json({ message: 'Error al actualizar proveedor' });
  }
};

const deleteProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM proveedores WHERE id_proveedor = ?', [id]);
    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }
    res.json({ message: 'Proveedor eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    res.status(500).json({ message: 'Error al eliminar proveedor' });
  }
};

module.exports = {
  getProveedores,
  getProveedorById,
  createProveedor,
  updateProveedor,
  deleteProveedor
};
