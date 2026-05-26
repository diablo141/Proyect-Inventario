const db = require('../config/db');

const getCategorias = async (req, res) => {
  try {
    const [categorias] = await db.query('SELECT id, nombre, descripcion FROM categorias ORDER BY nombre ASC');
    res.json(categorias);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ message: 'Error al obtener categorías' });
  }
};

const createCategoria = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre) {
      return res.status(400).json({ message: 'El nombre de la categoría es requerido' });
    }

    const [result] = await db.query('INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)', [nombre, descripcion || '']);
    const [categoria] = await db.query('SELECT * FROM categorias WHERE id = ?', [result.insertId]);

    res.status(201).json(categoria[0]);
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ message: 'Error al crear categoría' });
  }
};

module.exports = {
  getCategorias,
  createCategoria
};
