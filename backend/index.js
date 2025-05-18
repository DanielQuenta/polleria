const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importar rutas (deben ser routers "puros", sus rutas internas empiezan en "/")
const authRoutes = require('./routes/auth');            // /login, /register, etc.
const productRoutes = require('./routes/products');     // /, /:id, etc.
const invoiceRoutes = require('./routes/invoices');     // /, /:id, etc.
const ordersRouter = require('./routes/orders');        // /, /:id, etc.
const orderItemsRouter = require('./routes/order_items'); // /, /:id, etc.

// Inicializar app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api', authRoutes); // Login/Registro, ejemplo: /api/login
app.use('/api/products', productRoutes); // /api/products
app.use('/api/invoices', invoiceRoutes); // /api/invoices
app.use('/api/orders', ordersRouter);    // /api/orders
app.use('/api/order_items', orderItemsRouter); // /api/order_items

// Puerto de escucha
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en puerto ${PORT}`);
});