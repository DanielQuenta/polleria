const express = require('express');
const router = express.Router();
const pool = require('../db');

// Obtener todos los items de pedido
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM order_items');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener items de pedido' });
  }
});

// Obtener un item por id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM order_items WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item de pedido no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener item de pedido' });
  }
});

// Crear un item de pedido
router.post('/', async (req, res) => {
  const { order_id, product_id, quantity, price_at_order } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO order_items (order_id, product_id, quantity, price_at_order)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [order_id, product_id, quantity, price_at_order]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear item de pedido' });
  }
});

// Actualizar un item de pedido
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { order_id, product_id, quantity, price_at_order } = req.body;

  try {
    const result = await pool.query(
      `UPDATE order_items
       SET order_id = $1, product_id = $2, quantity = $3, price_at_order = $4
       WHERE id = $5 RETURNING *`,
      [order_id, product_id, quantity, price_at_order, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item de pedido no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar item de pedido' });
  }
});

// Eliminar un item de pedido
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM order_items WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Item de pedido no encontrado' });
    }
    res.json({ message: 'Item de pedido eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar item de pedido' });
  }
});

// ...otros endpoints

// Insertar múltiples items de pedido
router.post('/bulk', async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'No se enviaron items para insertar' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const results = [];
    for (const item of items) {
      const { order_id, product_id, quantity, price_at_order } = item;
      const result = await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_at_order)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [order_id, product_id, quantity, price_at_order]
      );
      results.push(result.rows[0]);
    }
    await client.query('COMMIT');
    res.status(201).json(results);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error al insertar items de pedido' });
  } finally {
    client.release();
  }
});


module.exports = router;
