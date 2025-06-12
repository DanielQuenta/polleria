const express = require('express');
const router = express.Router();
const pool = require('../db');

// Obtener todos los items de pedido (sin cambios)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM order_items');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener items de pedido' });
  }
});

// Obtener un item por id (sin cambios)
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

// Crear un item de pedido y descontar stock
router.post('/', async (req, res) => {
  const { order_id, product_id, quantity, price_at_order } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Verificar stock actual
    const stockResult = await client.query(
      'SELECT stock FROM products WHERE id = $1 FOR UPDATE',
      [product_id]
    );
    if (stockResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Producto no encontrado para controlar stock' });
    }
    const currentStock = parseInt(stockResult.rows[0].stock, 10);
    if (currentStock < quantity) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `Stock insuficiente para el producto (stock actual: ${currentStock})` });
    }
    // Descontar stock
    await client.query(
      'UPDATE products SET stock = stock - $1 WHERE id = $2',
      [quantity, product_id]
    );
    // Crear el item de pedido
    const result = await client.query(
      `INSERT INTO order_items (order_id, product_id, quantity, price_at_order)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [order_id, product_id, quantity, price_at_order]
    );
    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error al crear item de pedido y descontar stock' });
  } finally {
    client.release();
  }
});

// Actualizar un item de pedido (opcional: puedes ajustar stock aquí si permites cambiar cantidad/producto)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { order_id, product_id, quantity, price_at_order } = req.body;

  // Recomendado: No modificar stock desde aquí a menos que realmente permitas editar cantidad/producto y quieras controlar stock
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

// Eliminar un item de pedido y (opcional) devolver stock
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Buscar el item para saber cuánto devolver de stock (opcional)
    const itemResult = await client.query('SELECT product_id, quantity FROM order_items WHERE id = $1', [id]);
    if (itemResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Item de pedido no encontrado' });
    }
    const { product_id, quantity } = itemResult.rows[0];
    // Eliminar el item
    const delResult = await client.query('DELETE FROM order_items WHERE id = $1 RETURNING *', [id]);
    // Devolver stock
    await client.query('UPDATE products SET stock = stock + $1 WHERE id = $2', [quantity, product_id]);
    await client.query('COMMIT');
    res.json({ message: 'Item de pedido eliminado y stock devuelto' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar item de pedido y devolver stock' });
  } finally {
    client.release();
  }
});

// Insertar múltiples items de pedido y descontar stock
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
      // Verificar stock actual
      const stockResult = await client.query(
        'SELECT stock FROM products WHERE id = $1 FOR UPDATE',
        [product_id]
      );
      if (stockResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: `Producto no encontrado para controlar stock (ID: ${product_id})` });
      }
      const currentStock = parseInt(stockResult.rows[0].stock, 10);
      if (currentStock < quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Stock insuficiente para el producto (ID: ${product_id}, stock actual: ${currentStock})` });
      }
      // Descontar stock
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [quantity, product_id]
      );
      // Crear el item de pedido
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
    res.status(500).json({ error: 'Error al insertar items de pedido y descontar stock' });
  } finally {
    client.release();
  }
});

module.exports = router;