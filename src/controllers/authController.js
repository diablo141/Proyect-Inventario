const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET || 'secret_key';
const jwtExpiry = '8h';

const register = async (req, res) => {
  try {
    const { nombre, correo, password } = req.body;
    if (!nombre || !correo || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const [existing] = await db.query('SELECT id_usuario FROM usuarios WHERE correo = ?', [correo]);
    if (existing.length) {
      return res.status(409).json({ message: 'El correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO usuarios (nombre, correo, password, rol) VALUES (?, ?, ?, ?)',
      [nombre, correo, hashedPassword, 'administrador']
    );

    const payload = { id_usuario: result.insertId, nombre, correo, rol: 'administrador' };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiry });
    res.status(201).json({ token, usuario: payload });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error interno al registrar usuario' });
  }
};

const login = async (req, res) => {
  try {
    const { correo, password } = req.body;
    if (!correo || !password) {
      return res.status(400).json({ message: 'Correo y contraseña son requeridos' });
    }

    const [users] = await db.query('SELECT id_usuario, nombre, correo, password, rol FROM usuarios WHERE correo = ?', [correo]);
    const user = users[0];
    if (!user) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    const payload = {
      id_usuario: user.id_usuario,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol
    };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiry });
    res.json({ token, usuario: payload });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno al iniciar sesión' });
  }
};

const profile = async (req, res) => {
  try {
    const { id_usuario } = req.user;
    const [users] = await db.query('SELECT id_usuario, nombre, correo, rol, fecha_registro FROM usuarios WHERE id_usuario = ?', [id_usuario]);
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
