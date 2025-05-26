import React, { useEffect, useState } from 'react';
import axios from 'axios';

function OrderItems({ orderId, colors }) {
  // Usa los colores recibidos por props, define defaults pastel si no te pasan nada
  const palette = colors || {
    SOFT_YELLOW: "#fffbe8",
    SOFT_ORANGE: "#ffe4ba",
    SOFT_GREEN: "#d7f9e5",
    SOFT_BROWN: "#b37d53",
    SOFT_PINK: "#ffe8e8",
    SOFT_GRAY: "#f4f4f4"
  };

  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [currentOrderId, setCurrentOrderId] = useState(orderId || '');
  const [currentNit, setCurrentNit] = useState('');
  const [currentNombreCliente, setCurrentNombreCliente] = useState('');
  const [pendingItems, setPendingItems] = useState([
    { product_id: '', quantity: '', price_at_order: '', price_locked: false }
  ]);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    order_id: '',
    product_id: '',
    quantity: '',
    price_at_order: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);

  // Filtros
  const [filterOrderId, setFilterOrderId] = useState('');
  const [filterProductId, setFilterProductId] = useState('');
  // Paginación
  const [page, setPage] = useState(1);
  const perPage = 6;

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/products');
      setProducts(res.data);
    } catch (error) {
      console.error('Error al obtener productos', error);
    }
  };

  // Fetch order items
  const fetchItems = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/order_items');
      setItems(res.data);
    } catch (error) {
      console.error('Error al obtener ítems de pedido', error);
    }
  };

  // Fetch orders (for customer_name)
  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/orders');
      setOrders(res.data);
    } catch (error) {
      console.error('Error al obtener órdenes', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchItems();
    fetchOrders();
  }, []);

  useEffect(() => {
    if (orderId) setCurrentOrderId(orderId);
  }, [orderId]);

  // Cuando cambian los filtros, vuelve a la primera página
  useEffect(() => {
    setPage(1);
  }, [filterOrderId, filterProductId]);

  const handleAddField = () => {
    setPendingItems([
      ...pendingItems,
      { product_id: '', quantity: '', price_at_order: '', price_locked: false }
    ]);
  };

  const handleRemoveField = (idx) => {
    setPendingItems(pendingItems.filter((_, i) => i !== idx));
  };

  const handleSelectProduct = (idx, productId) => {
    const product = products.find(p => String(p.id) === String(productId));
    setPendingItems(
      pendingItems.map((item, i) =>
        idx === i
          ? {
              ...item,
              product_id: productId,
              price_at_order: item.quantity
                ? (product ? (parseFloat(product.price) * parseInt(item.quantity || 1, 10)).toFixed(2) : '')
                : product ? parseFloat(product.price).toFixed(2) : '',
              price_locked: false
            }
          : item
      )
    );
  };

  const handleQuantityChange = (idx, value) => {
    setPendingItems(
      pendingItems.map((item, i) => {
        if (idx !== i) return item;
        const product = products.find(p => String(p.id) === String(item.product_id));
        let newPrice = item.price_at_order;
        if (!item.price_locked && product) {
          newPrice = (parseFloat(product.price) * parseInt(value || 1, 10)).toFixed(2);
        }
        return {
          ...item,
          quantity: value,
          price_at_order: newPrice
        };
      })
    );
  };

  const handleEnablePriceEdit = (idx) => {
    setPendingItems(
      pendingItems.map((item, i) =>
        idx === i ? { ...item, price_locked: true } : item
      )
    );
  };

  const handlePriceChange = (idx, value) => {
    setPendingItems(
      pendingItems.map((item, i) =>
        idx === i ? { ...item, price_at_order: value } : item
      )
    );
  };

  const ProductSelector = ({ idx, value, onChange }) => (
    <div className="d-flex align-items-center gap-2">
      <i className="bi bi-box-seam" style={{ color: palette.SOFT_ORANGE, fontSize: 22 }}></i>
      <select
        className="form-select"
        value={value}
        onChange={e => onChange(idx, e.target.value)}
        required
        style={{
          minWidth: 140,
          border: `1.5px solid ${palette.SOFT_ORANGE}`,
          background: palette.SOFT_YELLOW,
          borderRadius: 7
        }}
      >
        <option value="">Selecciona producto</option>
        {products.map(prod => (
          <option key={prod.id} value={prod.id}>{prod.name}</option>
        ))}
      </select>
      {value && (() => {
        const prod = products.find(p => String(p.id) === String(value));
        if (prod && prod.image_url && /\.(png|jpe?g)$/i.test(prod.image_url)) {
          return (
            <img
              src={prod.image_url.startsWith('/') ? `http://localhost:4000${prod.image_url}` : prod.image_url}
              alt={prod.name}
              style={{
                width: 40, height: 40, objectFit: 'cover',
                borderRadius: 7, border: `1.5px solid ${palette.SOFT_ORANGE}`,
                background: palette.SOFT_YELLOW
              }}
              onError={e => { e.target.style.display = 'none'; }}
            />
          );
        }
        return null;
      })()}
    </div>
  );

  // ----------- FACTURA AUTOMÁTICA -----------
  const handleSubmitAll = async (e) => {
    e.preventDefault();
    if (!currentOrderId) {
      alert('Ingresa el ID de pedido');
      return;
    }
    for (const item of pendingItems) {
      if (!item.product_id || !item.quantity || !item.price_at_order) {
        alert('Completa todos los campos de productos');
        return;
      }
    }
    try {
      const itemsToSend = pendingItems.map(item => ({
        order_id: currentOrderId,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_order: item.price_at_order
      }));
      await axios.post('http://localhost:4000/api/order_items/bulk', { items: itemsToSend });

      // --------- NOMBRE FACTURA FIABLE (consulta directa a la orden) ---------
      if ((currentNit && currentNit.trim() !== "") || (currentNombreCliente && currentNombreCliente.trim() !== "")) {
        let nombreFactura = currentNombreCliente;
        if (!nombreFactura.trim()) {
          try {
            const orderRes = await axios.get(`http://localhost:4000/api/orders/${currentOrderId}`);
            if (orderRes.data && orderRes.data.customer_name && orderRes.data.customer_name.trim()) {
              nombreFactura = orderRes.data.customer_name;
            } else {
              nombreFactura = "Sin Nombre";
            }
          } catch (error) {
            nombreFactura = "Sin Nombre";
          }
        }
        try {
          await axios.post('http://localhost:4000/api/invoices', {
            order_id: currentOrderId,
            total_amount: itemsToSend.reduce(
              (acc, item) => acc + parseFloat(item.price_at_order), 0
            ),
            payment_method: "efectivo",
            nit_cliente: currentNit,
            nombre_cliente_factura: nombreFactura
          });
        } catch (error) {
          alert('Error al guardar la factura, pero los productos fueron guardados');
        }
      }
      // -----------------------------------------------------------------------

      setPendingItems([{ product_id: '', quantity: '', price_at_order: '', price_locked: false }]);
      setCurrentOrderId('');
      setCurrentNit('');
      setCurrentNombreCliente('');
      fetchItems();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
    } catch (error) {
      console.error('Error al guardar items de pedido o la factura', error);
      alert('Error al guardar items o la factura');
    }
  };

  const handleEdit = (item) => {
    setEditForm({
      order_id: item.order_id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_order: item.price_at_order
    });
    setEditingId(item.id);
    setEditMode(true);
  };

  const handleEditChange = (field, value) => {
    setEditForm({ ...editForm, [field]: value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:4000/api/order_items/${editingId}`, editForm);
      setEditMode(false);
      setEditingId(null);
      setEditForm({
        order_id: '',
        product_id: '',
        quantity: '',
        price_at_order: ''
      });
      fetchItems();
    } catch (error) {
      console.error('Error al guardar ítem de pedido', error);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditingId(null);
    setEditForm({
      order_id: '',
      product_id: '',
      quantity: '',
      price_at_order: ''
    });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/api/order_items/${id}`);
      fetchItems();
    } catch (error) {
      console.error('Error al eliminar ítem', error);
    }
  };

  // FILTRO: por Order ID y por Product
  const filteredItems = items
    .filter(item => {
      if (filterOrderId && String(item.order_id) !== String(filterOrderId)) return false;
      if (filterProductId && String(item.product_id) !== String(filterProductId)) return false;
      return true;
    })
    .sort((a, b) => b.id - a.id);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / perPage));
  const paginatedItems = filteredItems.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [filteredItems, totalPages, page]);

  // Iconos decorativos
  function iconProduct() {
    return <i className="bi bi-box-seam" style={{ color: palette.SOFT_ORANGE, fontSize: 19, marginRight: 4 }}></i>;
  }
  function iconQuantity() {
    return <i className="bi bi-stack" style={{ color: palette.SOFT_BROWN, fontSize: 17, marginRight: 4 }}></i>;
  }
  function iconPrice() {
    return <i className="bi bi-cash-coin" style={{ color: palette.SOFT_GREEN, fontSize: 18, marginRight: 4 }}></i>;
  }
  function iconOrder() {
    return <i className="bi bi-receipt" style={{ color: palette.SOFT_ORANGE, fontSize: 18, marginRight: 4 }}></i>;
  }

  return (
    <div className="container my-4" style={{ background: palette.SOFT_YELLOW, borderRadius: 18, padding: 18, transition: 'background 0.3s' }}>
      <h3 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: palette.SOFT_BROWN }}>
        <i className="bi bi-basket2-fill" style={{ color: palette.SOFT_ORANGE, fontSize: 30 }}></i>
        {editMode ? 'Editar Ítem de Pedido' : 'Agregar Productos al Pedido'}
      </h3>

      {showSuccess && (
        <div
          className="alert text-center fw-bold"
          style={{
            background: palette.SOFT_GREEN,
            color: palette.SOFT_BROWN,
            borderRadius: 16,
            fontSize: 22,
            position: "fixed",
            top: 70,
            left: "50%",
            transform: "translateX(-50%) scale(1.08)",
            zIndex: 2500,
            minWidth: 260,
            boxShadow: `0 4px 16px ${palette.SOFT_ORANGE}`,
            transition: "opacity 0.5s, transform 0.5s"
          }}
        >
          <i className="bi bi-check-circle-fill" style={{ fontSize: 24, marginRight: 8, color: palette.SOFT_BROWN }}></i>
          ¡Productos y factura agregados!
        </div>
      )}

      {/* Formulario de agregar/editar items */}
      {editMode ? (
        <form onSubmit={handleEditSubmit} className="mb-4 row g-2 align-items-end" style={{
          background: palette.SOFT_GRAY,
          borderRadius: 14,
          border: `2px solid ${palette.SOFT_ORANGE}`,
          boxShadow: "0 2px 8px #f8e8d2"
        }}>
          <div className="col-md-2">
            <label className="fw-semibold" style={{ color: palette.SOFT_BROWN }}>{iconOrder()} ID Pedido</label>
            <input
              className="form-control"
              placeholder="ID Pedido"
              type="number"
              value={editForm.order_id}
              onChange={e => handleEditChange('order_id', e.target.value)}
              required
              disabled
              style={{ borderRadius: 8, border: `1px solid ${palette.SOFT_ORANGE}` }}
            />
          </div>
          <div className="col-md-4">
            <label className="fw-semibold" style={{ color: palette.SOFT_BROWN }}>{iconProduct()} Producto</label>
            <ProductSelector
              idx={0}
              value={editForm.product_id}
              onChange={(idx, value) => setEditForm({ ...editForm, product_id: value })}
            />
          </div>
          <div className="col-md-2">
            <label className="fw-semibold" style={{ color: palette.SOFT_BROWN }}>{iconQuantity()} Cantidad</label>
            <input
              className="form-control"
              placeholder="Cantidad"
              type="number"
              value={editForm.quantity}
              onChange={e => setEditForm({ ...editForm, quantity: e.target.value })}
              required
              style={{ borderRadius: 8, border: `1px solid ${palette.SOFT_ORANGE}` }}
            />
          </div>
          <div className="col-md-2">
            <label className="fw-semibold" style={{ color: palette.SOFT_BROWN }}>{iconPrice()} Precio en Pedido</label>
            <input
              className="form-control"
              placeholder="Precio en Pedido"
              type="number"
              step="0.01"
              value={editForm.price_at_order}
              onChange={e => setEditForm({ ...editForm, price_at_order: e.target.value })}
              required
              style={{ borderRadius: 8, border: `1px solid ${palette.SOFT_ORANGE}` }}
            />
          </div>
          <div className="col-md-2 d-flex gap-1 align-items-end">
            <button className="btn" style={{
              background: palette.SOFT_ORANGE,
              color: palette.SOFT_BROWN,
              borderRadius: 8,
              fontWeight: "bold"
            }} type="submit"><i className="bi bi-arrow-repeat"></i> Actualizar</button>
            <button className="btn btn-secondary" style={{ borderRadius: 8 }} type="button" onClick={handleCancel}><i className="bi bi-x-circle"></i> Cancelar</button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmitAll} style={{
          background: palette.SOFT_GRAY,
          borderRadius: 14,
          border: `2px solid ${palette.SOFT_ORANGE}`,
          boxShadow: "0 2px 8px #f8e8d2"
        }}>
          <div className="row mb-2">
            <div className="col-md-3">
              <label className="fw-semibold" style={{ color: palette.SOFT_BROWN }}>{iconOrder()} ID Pedido</label>
              <input
                className="form-control"
                placeholder="ID Pedido"
                type="number"
                value={currentOrderId}
                onChange={e => setCurrentOrderId(e.target.value)}
                required
                readOnly={!!orderId}
                style={{ borderRadius: 8, border: `1px solid ${palette.SOFT_ORANGE}` }}
              />
            </div>
            <div className="col-md-3">
              <label className="fw-semibold" style={{ color: palette.SOFT_BROWN }}><i className="bi bi-person-vcard"></i> NIT Cliente</label>
              <input
                className="form-control"
                placeholder="NIT Cliente (opcional)"
                type="text"
                value={currentNit}
                onChange={e => setCurrentNit(e.target.value)}
                style={{ borderRadius: 8, border: `1px solid ${palette.SOFT_ORANGE}` }}
              />
            </div>
            <div className="col-md-4">
              <label className="fw-semibold" style={{ color: palette.SOFT_BROWN }}><i className="bi bi-person-lines-fill"></i> Nombre Cliente Factura</label>
              <input
                className="form-control"
                placeholder="Nombre Cliente Factura (opcional)"
                type="text"
                value={currentNombreCliente}
                onChange={e => setCurrentNombreCliente(e.target.value)}
                style={{ borderRadius: 8, border: `1px solid ${palette.SOFT_ORANGE}` }}
              />
            </div>
          </div>
          {pendingItems.map((item, idx) => (
            <div className="card mb-3 shadow" key={idx} style={{
              border: `2px solid ${palette.SOFT_ORANGE}`,
              borderRadius: 12,
              background: palette.SOFT_YELLOW
            }}>
              <div className="card-header d-flex align-items-center gap-2" style={{
                background: palette.SOFT_ORANGE,
                color: palette.SOFT_BROWN,
                fontWeight: "bold",
                borderRadius: "10px 10px 0 0"
              }}>
                <i className="bi bi-box2-heart-fill" style={{ color: palette.SOFT_PINK, fontSize: 23 }}></i>
                Producto #{idx + 1}
              </div>
              <div className="card-body row g-2 align-items-center">
                <div className="col-md-4">
                  <ProductSelector
                    idx={idx}
                    value={item.product_id}
                    onChange={handleSelectProduct}
                  />
                </div>
                <div className="col-md-2">
                  <label className="fw-semibold" style={{ color: palette.SOFT_BROWN }}>{iconQuantity()} Cantidad</label>
                  <input
                    className="form-control"
                    placeholder="Cantidad"
                    type="number"
                    value={item.quantity}
                    min={1}
                    onChange={e => handleQuantityChange(idx, e.target.value)}
                    required
                    style={{ borderRadius: 8, border: `1px solid ${palette.SOFT_ORANGE}` }}
                  />
                </div>
                <div className="col-md-3 d-flex align-items-center">
                  <label className="fw-semibold mb-0 me-2" style={{ color: palette.SOFT_BROWN }}>{iconPrice()} Precio</label>
                  <input
                    className="form-control"
                    placeholder="Precio en Pedido"
                    type="number"
                    step="0.01"
                    value={item.price_at_order}
                    onChange={e => item.price_locked ? handlePriceChange(idx, e.target.value) : undefined}
                    required
                    readOnly={!item.price_locked}
                    style={{
                      borderRadius: 8,
                      border: `1px solid ${palette.SOFT_ORANGE}`,
                      background: item.price_locked ? palette.SOFT_PINK : palette.SOFT_GRAY,
                      cursor: item.price_locked ? 'text' : 'not-allowed'
                    }}
                  />
                  {!item.price_locked && (
                    <button type="button" className="btn btn-sm btn-outline-info ms-2" style={{ borderRadius: 8 }} onClick={() => handleEnablePriceEdit(idx)}>
                      <i className="bi bi-pencil"></i> Editar precio
                    </button>
                  )}
                </div>
                <div className="col-md-2">
                  {pendingItems.length > 1 && (
                    <button type="button" className="btn btn-sm btn-outline-danger" style={{ borderRadius: 8 }} onClick={() => handleRemoveField(idx)}>
                      <i className="bi bi-trash"></i> Quitar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div className="mb-2 d-flex gap-2">
            <button type="button" className="btn btn-outline-secondary" style={{ borderRadius: 8, fontWeight: "bold" }} onClick={handleAddField}>
              <i className="bi bi-plus-square"></i> Agregar otro producto
            </button>
            <button type="submit" className="btn" style={{
              background: palette.SOFT_GREEN,
              color: palette.SOFT_BROWN,
              borderRadius: 8,
              fontWeight: "bold",
              padding: '8px 16px'
            }}><i className="bi bi-cloud-arrow-down-fill"></i> Guardar Pedido</button>
          </div>
        </form>
      )}

      <h4 className="mt-4 fw-bold d-flex align-items-center gap-2" style={{ color: palette.SOFT_BROWN }}>
        <i className="bi bi-archive-fill" style={{ color: palette.SOFT_ORANGE, fontSize: 23 }}></i>
        Ítems guardados
      </h4>

      {/* Filtros DEBAJO del título de items guardados */}
      <div className="mb-4 row g-2 align-items-center">
        <div className="col-sm-3">
          <label className="fw-semibold" style={{ color: palette.SOFT_BROWN }}>{iconOrder()} Buscar por ID Pedido</label>
          <input
            className="form-control"
            placeholder="Buscar por ID Pedido"
            type="number"
            value={filterOrderId}
            onChange={e => setFilterOrderId(e.target.value)}
            style={{ borderRadius: 8, border: `1px solid ${palette.SOFT_ORANGE}` }}
          />
        </div>
        <div className="col-sm-3">
          <label className="fw-semibold" style={{ color: palette.SOFT_BROWN }}>{iconProduct()} Filtrar por producto</label>
          <select
            className="form-select"
            value={filterProductId}
            onChange={e => setFilterProductId(e.target.value)}
            style={{ borderRadius: 8, border: `1px solid ${palette.SOFT_ORANGE}` }}
          >
            <option value="">Todos los productos</option>
            {products.map(prod => (
              <option key={prod.id} value={prod.id}>{prod.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Paginación */}
      <div className="d-flex justify-content-center align-items-center mt-3 gap-2">
        <button
          className="btn btn-outline-secondary"
          style={{ borderRadius: 8, fontWeight: "bold" }}
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        ><i className="bi bi-chevron-double-left"></i> Anterior</button>
        <span style={{ color: palette.SOFT_BROWN, fontWeight: "bold" }}>
          Página {page} de {totalPages}
        </span>
        <button
          className="btn btn-outline-secondary"
          style={{ borderRadius: 8, fontWeight: "bold" }}
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
        >Siguiente <i className="bi bi-chevron-double-right"></i></button>
      </div>

      {/* Lista paginada y filtrada */}
      <div className="row">
        {paginatedItems.map(item => {
          const prod = products.find(p => String(p.id) === String(item.product_id));
          return (
            <div className="col-md-4 mb-3" key={item.id}>
              <div className="card h-100 shadow" style={{
                border: `2px solid ${palette.SOFT_ORANGE}`,
                borderRadius: 14,
                background: palette.SOFT_YELLOW
              }}>
                <div className="card-header d-flex align-items-center gap-2" style={{
                  background: palette.SOFT_ORANGE,
                  color: palette.SOFT_BROWN,
                  fontWeight: "bold",
                  borderRadius: "12px 12px 0 0"
                }}>
                  {iconOrder()} <strong>Item #{item.id}</strong> - Pedido: {item.order_id}
                </div>
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    {iconProduct()}
                    {prod && prod.image_url && /\.(png|jpe?g)$/i.test(prod.image_url) && (
                      <img
                        src={prod.image_url.startsWith('/') ? `http://localhost:4000${prod.image_url}` : prod.image_url}
                        alt={prod.name}
                        style={{ width: 40, height: 40, objectFit: 'cover', marginRight: 10, borderRadius: 7, border: `1.5px solid ${palette.SOFT_ORANGE}` }}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <span className="fw-bold">{prod ? prod.name : item.product_id}</span>
                  </div>
                  <p className="mb-1">{iconQuantity()} <strong>Cantidad:</strong> {item.quantity}</p>
                  <p className="mb-1">{iconPrice()} <strong>Precio:</strong> Bs. {item.price_at_order}</p>
                  <div className="d-flex gap-2 mt-2">
                    <button className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1" onClick={() => handleEdit(item)}>
                      <i className="bi bi-pencil"></i> Editar
                    </button>
                    <button className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1" onClick={() => handleDelete(item.id)}>
                      <i className="bi bi-trash"></i> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {paginatedItems.length === 0 && (
          <div className="text-center text-muted mt-4">
            No hay ítems registrados con estos filtros.
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderItems;