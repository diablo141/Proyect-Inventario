const pool = require('../config/db');

const getCategorias = async (req, res) => {
  try {
    const [categorias] = await pool.query('SELECT id_categoria AS id, nombre, descripcion, creado_en FROM categorias ORDER BY nombre ASC');
    res.json(categorias);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ message: 'Error al obtener categorías' });
  }
};

const getCategoriaById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT id_categoria AS id, nombre, descripcion, creado_en FROM categorias WHERE id_categoria = ?', [id]);
    if (!rows.length) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({ message: 'Error al obtener categoría' });
  }
};

const createCategoria = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre) {
      return res.status(400).json({ message: 'El nombre de la categoría es obligatorio' });
    }

    const [result] = await pool.query('INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)', [nombre, descripcion || '']);
    const [categoria] = await pool.query('SELECT id_categoria AS id, nombre, descripcion, creado_en FROM categorias WHERE id_categoria = ?', [result.insertId]);
    res.status(201).json(categoria[0]);
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ message: 'Error interno al crear categoría' });
  }
};

const updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    const [result] = await pool.query('UPDATE categorias SET nombre = ?, descripcion = ? WHERE id_categoria = ?', [nombre, descripcion || '', id]);

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    const [categoria] = await pool.query('SELECT id_categoria AS id, nombre, descripcion, creado_en FROM categorias WHERE id_categoria = ?', [id]);
    res.json(categoria[0]);
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({ message: 'Error interno al actualizar categoría' });
  }
};

const deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM categorias WHERE id_categoria = ?', [id]);

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    res.json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({ message: 'Error interno al eliminar categoría' });
  }
};

module.exports = {
  getCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria
};
