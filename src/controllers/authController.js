const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const jwtSecret = process.env.JWT_SECRET || 'secret_key';
const jwtExpiry = '8h';

const register = async (req, res) => {
  try {
    const nombre = req.body.nombre;
    const correo = req.body.correo || req.body.email;
    const password = req.body.password;

    if (!nombre || !correo || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const [existing] = await pool.query('SELECT id_usuario FROM usuarios WHERE correo = ?', [correo]);
    if (existing.length) {
      return res.status(409).json({ message: 'El correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, correo, password, rol) VALUES (?, ?, ?, ?)',
      [nombre, correo, hashedPassword, 'administrador']
    );

    const token = jwt.sign(
      { id_usuario: result.insertId, nombre, correo, rol: 'administrador' },
      jwtSecret,
      { expiresIn: jwtExpiry }
    );

    res.status(201).json({
      token,
      usuario: { id_usuario: result.insertId, nombre, correo, rol: 'administrador' }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error interno al registrar usuario' });
  }
};

const login = async (req, res) => {
  try {
    const correo = req.body.correo || req.body.email;
    const password = req.body.password;
    if (!correo || !password) {
      return res.status(400).json({ message: 'Correo y contraseña son requeridos' });
    }

    const [users] = await pool.query(
      'SELECT id_usuario, nombre, correo, password, rol FROM usuarios WHERE correo = ?',
      [correo]
    );

    const user = users[0];
    if (!user) {
      return res.status(401).json({ message: 'Usuario o contrase�a incorrectos' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Usuario o contrase�a incorrectos' });
    }

    const token = jwt.sign(
      { id_usuario: user.id_usuario, nombre: user.nombre, correo: user.correo, rol: user.rol },
      jwtSecret,
      { expiresIn: jwtExpiry }
    );

    res.json({ token, usuario: { id_usuario: user.id_usuario, nombre: user.nombre, correo: user.correo, rol: user.rol } });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno al iniciar sesi�n' });
  }
};

const profile = async (req, res) => {
  try {
    const userId = req.user?.id_usuario;
    const [users] = await pool.query(
      'SELECT id_usuario, nombre, correo, rol, creado_en FROM usuarios WHERE id_usuario = ?',
      [userId]
    );

    const user = users[0];
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error en profile:', error);
    res.status(500).json({ message: 'Error interno al obtener perfil' });
  }
};

module.exports = { register, login, profile };
