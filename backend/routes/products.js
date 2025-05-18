const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pool = require('../db');

// Configuración de multer para guardar imágenes en 'uploads'
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// GET /          -> /api/products/
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// GET /:id       -> /api/products/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// POST /         -> /api/products/
router.post('/', upload.single('image'), async (req, res) => {
  const {
    name,
    description = '',
    price,
    type,
    available = true,
    estado = 'disponible',
    stock = 0
  } = req.body;

  let image_url = null;
  if (req.file) {
    image_url = `/uploads/${req.file.filename}`;
  } else if (req.body.image_url) {
    image_url = req.body.image_url;
  }

  if (!name || !price || !type) {
    return res.status(400).json({ error: 'Los campos name, price y type son obligatorios.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO products
      (name, description, price, type, available, image_url, estado, stock)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [name, description, price, type, available, image_url, estado, stock]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear producto', detalle: err.message });
  }
});

// PUT /:id       -> /api/products/:id
router.put('/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description = '',
    price,
    type,
    available = true,
    estado = 'disponible',
    stock = 0,
    image_url: imageUrlFromBody
  } = req.body;

  let image_url = imageUrlFromBody;
  if (req.file) {
    image_url = `/uploads/${req.file.filename}`;
  }

  if (!name || !price || !type) {
    return res.status(400).json({ error: 'Los campos name, price y type son obligatorios.' });
  }

  try {
    const result = await pool.query(
      `UPDATE products
      SET name = $1,
          description = $2,
          price = $3,
          type = $4,
          available = $5,
          image_url = $6,
          estado = $7,
          stock = $8
      WHERE id = $9
      RETURNING *`,
      [name, description, price, type, available, image_url, estado, stock, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Producto no encontrado para actualizar' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar producto', detalle: err.message });
  }
});

// DELETE /:id    -> /api/products/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Producto no encontrado para eliminar' });
    }
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

module.exports = router;