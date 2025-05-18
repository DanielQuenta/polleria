const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken'); // asegurate de haberlo instalado con npm install jsonwebtoken

// Ruta de login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    const user = result.rows[0];

    // Comparación directa (sin bcrypt por ahora)
    if (password !== user.password_hash) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // 🛡️ Ahora sí generamos el token
    const token = jwt.sign({ userId: user.id, role: user.role }, 'secreto', { expiresIn: '1h' });

    res.json({ message: 'Login exitoso', token }); // <-- ya está definida
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;
