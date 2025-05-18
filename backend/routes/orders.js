const express = require('express');
const router = express.Router();
const pool = require('../db');

// Obtener todas las órdenes
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener órdenes:', err);
    res.status(500).json({ error: 'Error al obtener órdenes' });
  }
});

// Obtener una orden por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener orden:', err);
    res.status(500).json({ error: 'Error al obtener orden' });
  }
});

// Crear nueva orden
router.post('/', async (req, res) => {
  const {
    customer_name = null,
    order_date = null, // puede omitirse, la BD pone CURRENT_TIMESTAMP
    status = 'pendiente',
    handled_by = null
  } = req.body;

  // Validar status permitido
  const allowedStatus = ['pendiente', 'en preparación', 'entregado', 'cancelado'];
  if (status && !allowedStatus.includes(status)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO orders (customer_name, order_date, status, handled_by)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [customer_name, order_date, status, handled_by]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear orden:', err);
    res.status(500).json({ error: 'Error al crear orden', detalle: err.message });
  }
});

// Actualizar orden
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    customer_name = null,
    order_date = null,
    status,
    handled_by = null
  } = req.body;

  // Validar status permitido
  const allowedStatus = ['pendiente', 'en preparación', 'entregado', 'cancelado'];
  if (status && !allowedStatus.includes(status)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  try {
    const result = await pool.query(
      `UPDATE orders
      SET customer_name = $1,
          order_date = COALESCE($2, order_date),
          status = COALESCE($3, status),
          handled_by = $4
      WHERE id = $5
      RETURNING *`,
      [customer_name, order_date, status, handled_by, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Orden no encontrada para actualizar' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar orden:', err);
    res.status(500).json({ error: 'Error al actualizar orden', detalle: err.message });
  }
});

// Eliminar orden
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Orden no encontrada para eliminar' });
    }
    res.json({ message: 'Orden eliminada correctamente' });
  } catch (err) {
    console.error('Error al eliminar orden:', err);
    res.status(500).json({ error: 'Error al eliminar orden' });
  }
});

module.exports = router;