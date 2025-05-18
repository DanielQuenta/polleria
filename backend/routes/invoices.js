const express = require('express');
const router = express.Router();
const pool = require('../db');

// Obtener todas las facturas
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM invoices');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener facturas' });
  }
});

// Obtener una factura por id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener factura' });
  }
});

// Crear una factura
router.post('/', async (req, res) => {
  const { order_id, total_amount, payment_method, nit_cliente, nombre_cliente_factura } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO invoices (order_id, total_amount, payment_method, nit_cliente, nombre_cliente_factura)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [order_id, total_amount, payment_method, nit_cliente, nombre_cliente_factura]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear factura' });
  }
});

// Actualizar una factura
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { order_id, total_amount, payment_method, nit_cliente, nombre_cliente_factura } = req.body;

  try {
    const result = await pool.query(
      `UPDATE invoices
       SET order_id = $1, total_amount = $2, payment_method = $3, nit_cliente = $4, nombre_cliente_factura = $5
       WHERE id = $6 RETURNING *`,
      [order_id, total_amount, payment_method, nit_cliente, nombre_cliente_factura, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar factura' });
  }
});

// Eliminar una factura
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM invoices WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    res.json({ message: 'Factura eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar factura' });
  }
});

module.exports = router;
