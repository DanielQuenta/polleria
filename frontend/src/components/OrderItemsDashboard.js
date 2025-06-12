import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';
import OrderSummary from './OrderSummary';

function OrderItemsDashboard({ orderId, setNotification, navigate }) {
  const [products, setProducts] = useState([]);
  const [pendingItems, setPendingItems] = useState([]);
  const [currentOrderId, setCurrentOrderId] = useState(orderId || '');
  const [currentNit, setCurrentNit] = useState('');
  const [currentNombreCliente, setCurrentNombreCliente] = useState('');
  const [loading, setLoading] = useState(false);

  // Cargar productos al montar
  useEffect(() => {
    axios.get('http://localhost:4000/api/products')
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]));
  }, []);

  const handleAddProduct = (product) => {
    // Si ya existe, suma cantidad
    const idx = pendingItems.findIndex(i => i.product_id === product.id);
    if (idx !== -1) {
      const updated = pendingItems.map((item, i) =>
        i === idx
          ? {
              ...item,
              quantity: Number(item.quantity) + 1,
              price_at_order: ((Number(item.quantity) + 1) * parseFloat(product.price)).toFixed(2)
            }
          : item
      );
      setPendingItems(updated);
    } else {
      setPendingItems([
        ...pendingItems,
        {
          product_id: product.id,
          quantity: 1,
          price_at_order: parseFloat(product.price).toFixed(2)
        }
      ]);
    }
  };

  const handleRemoveItem = (idx) => {
    setPendingItems(pendingItems.filter((_, i) => i !== idx));
  };

  const handleChangeQty = (idx, value) => {
    const qty = Math.max(1, Number(value));
    setPendingItems(
      pendingItems.map((item, i) =>
        i === idx
          ? {
              ...item,
              quantity: qty,
              price_at_order: (qty * parseFloat(products.find(p => p.id === item.product_id)?.price || 0)).toFixed(2)
            }
          : item
      )
    );
  };

  const handleSaveOrder = async (e) => {
    e.preventDefault();
    if (!currentOrderId) {
      alert('Ingrese el ID de pedido');
      return;
    }
    if (pendingItems.length === 0) {
      alert('Debe agregar al menos un producto');
      return;
    }
    setLoading(true);
    try {
      // Guardar items
      const itemsToSend = pendingItems.map(item => ({
        order_id: currentOrderId,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_order: item.price_at_order
      }));
      await axios.post('http://localhost:4000/api/order_items/bulk', { items: itemsToSend });

      // Guardar factura si es necesario
      if (currentNit.trim() || currentNombreCliente.trim()) {
        await axios.post('http://localhost:4000/api/invoices', {
          order_id: currentOrderId,
          total_amount: itemsToSend.reduce((acc, item) => acc + parseFloat(item.price_at_order), 0),
          payment_method: "efectivo",
          nit_cliente: currentNit,
          nombre_cliente_factura: currentNombreCliente || "Sin Nombre"
        });
      }

      setNotification && setNotification({ message: '¡Pedido guardado exitosamente!', type: 'success' });
      setTimeout(() => {
        setNotification && setNotification(null);
        navigate && navigate('/dashboard');
      }, 1600);
    } catch (error) {
      setNotification && setNotification({ message: 'Error al guardar el pedido', type: 'error' });
      setTimeout(() => setNotification && setNotification(null), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center" style={{ color: "#b35012" }}>🛒 Nuevo Pedido</h2>
      <div className="row">
        <div className="col-md-8">
          <h4 className="mb-3" style={{ color: "#b37d53" }}>Catálogo de Productos</h4>
          <div className="row">
            {products.length === 0 && <div className="text-muted">No hay productos disponibles.</div>}
            {products.map(prod => (
              <div className="col-md-4 mb-3" key={prod.id}>
                <ProductCard product={prod} onAdd={handleAddProduct} />
              </div>
            ))}
          </div>
        </div>
        <div className="col-md-4">
          <OrderSummary
            items={pendingItems}
            products={products}
            onRemove={handleRemoveItem}
            onChangeQty={handleChangeQty}
          />
          <form onSubmit={handleSaveOrder} className="mt-4">
            <div className="mb-2">
              <label className="form-label">ID Pedido</label>
              <input
                className="form-control"
                type="number"
                value={currentOrderId}
                onChange={e => setCurrentOrderId(e.target.value)}
                required
              />
            </div>
            <div className="mb-2">
              <label className="form-label">NIT Cliente (opcional)</label>
              <input
                className="form-control"
                type="text"
                value={currentNit}
                onChange={e => setCurrentNit(e.target.value)}
              />
            </div>
            <div className="mb-2">
              <label className="form-label">Nombre Cliente Factura (opcional)</label>
              <input
                className="form-control"
                type="text"
                value={currentNombreCliente}
                onChange={e => setCurrentNombreCliente(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn btn-success btn-lg w-100 fw-bold"
              disabled={loading}
            >
              <i className="bi bi-save2"></i> Guardar pedido y generar factura
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OrderItemsDashboard;