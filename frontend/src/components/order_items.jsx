import React, { useEffect, useState } from 'react';
import axios from 'axios';

function OrderItems({ orderId, colors, setNotification, navigate }) {
  // Paleta de colores por defecto y mejor contraste para botones grandes
  const palette = colors || {
    SOFT_YELLOW: "#fffbe8",
    SOFT_ORANGE: "#ffe4ba",
    SOFT_GREEN: "#4DD599",
    SOFT_BROWN: "#b37d53",
    SOFT_PINK: "#ffe8e8",
    SOFT_GRAY: "#f4f4f4",
    BTN_PRIMARY: "#ffb347",      // Botón principal
    BTN_PRIMARY_TEXT: "#b35012",
    BTN_DANGER: "#e63946",
    BTN_DANGER_TEXT: "#fff",
    BTN_SECONDARY: "#ffd166",
    BTN_SECONDARY_TEXT: "#b35012",
    BTN_DISABLED: "#f0e6d2"
  };

  // Estados
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);

  // Para crear orden+ítems en un solo paso
  const [form, setForm] = useState({
    customer_name: '',
    nit: '',
    products: [
      { product_id: '', quantity: '', price_at_order: '', price_locked: false }
    ]
  });

  // Edición
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    order_id: '',
    product_id: '',
    quantity: '',
    price_at_order: ''
  });

  // Filtros y paginación
  const [filterOrderId, setFilterOrderId] = useState('');
  const [filterProductId, setFilterProductId] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 6;

  // Fetch data
  useEffect(() => {
    axios.get('http://localhost:4000/api/products').then(res => setProducts(res.data));
    axios.get('http://localhost:4000/api/order_items').then(res => setItems(res.data));
    axios.get('http://localhost:4000/api/orders').then(res => setOrders(res.data));
  }, []);

  useEffect(() => { setPage(1); }, [filterOrderId, filterProductId]);

  // --- Handlers de formulario principal ---
  const handleProductChange = (idx, productId) => {
    const product = products.find(p => String(p.id) === String(productId));
    setForm(f => ({
      ...f,
      products: f.products.map((item, i) =>
        i === idx
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
    }));
  };

  const handleQuantityChange = (idx, value) => {
    setForm(f => ({
      ...f,
      products: f.products.map((item, i) => {
        if (i !== idx) return item;
        const product = products.find(p => String(p.id) === String(item.product_id));
        let newPrice = item.price_at_order;
        if (!item.price_locked && product) {
          newPrice = (parseFloat(product.price) * parseInt(value || 1, 10)).toFixed(2);
        }
        return { ...item, quantity: value, price_at_order: newPrice };
      })
    }));
  };

  const handleEnablePriceEdit = (idx) => {
    setForm(f => ({
      ...f,
      products: f.products.map((item, i) =>
        i === idx ? { ...item, price_locked: true } : item
      )
    }));
  };

  const handlePriceChange = (idx, value) => {
    setForm(f => ({
      ...f,
      products: f.products.map((item, i) =>
        i === idx ? { ...item, price_at_order: value } : item
      )
    }));
  };

  const handleAddField = () => {
    setForm(f => ({
      ...f,
      products: [...f.products, { product_id: '', quantity: '', price_at_order: '', price_locked: false }]
    }));
  };

  const handleRemoveField = (idx) => {
    setForm(f => ({
      ...f,
      products: f.products.filter((_, i) => i !== idx)
    }));
  };

  // --- Validación y control de stock en el submit ---
  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.customer_name) return alert('Nombre de cliente obligatorio');
    for (const item of form.products) {
      if (!item.product_id || !item.quantity || !item.price_at_order) {
        return alert('Completa todos los campos de los productos');
      }
      // Control de stock: busca el producto y verifica
      const prod = products.find(p => String(p.id) === String(item.product_id));
      if (prod && parseInt(item.quantity) > prod.stock) {
        return alert(`Stock insuficiente para ${prod.name}. Disponible: ${prod.stock}`);
      }
      if (prod && prod.stock === 0) {
        return alert(`El producto ${prod.name} está agotado.`);
      }
    }
    try {
      // 1. Crear la orden con los campos requeridos
      const orderRes = await axios.post('http://localhost:4000/api/orders', {
        customer_name: form.customer_name,
        nit: form.nit
      });
      const newOrderId = orderRes.data.id;
      // 2. Crear los items asociados a la orden
      const itemsToSend = form.products.map(item => ({
        order_id: newOrderId,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_order: item.price_at_order
      }));
      await axios.post('http://localhost:4000/api/order_items/bulk', { items: itemsToSend });
      // 3. (Opcional) crear factura automática si hay NIT o nombre
      if ((form.nit && form.nit.trim()) || (form.customer_name && form.customer_name.trim())) {
        await axios.post('http://localhost:4000/api/invoices', {
          order_id: newOrderId,
          total_amount: itemsToSend.reduce((a, i) => a + parseFloat(i.price_at_order), 0),
          payment_method: "efectivo",
          nit_cliente: form.nit,
          nombre_cliente_factura: form.customer_name
        });
      }
      setForm({
        customer_name: '',
        nit: '',
        products: [
          { product_id: '', quantity: '', price_at_order: '', price_locked: false }
        ]
      });
      await axios.get('http://localhost:4000/api/order_items').then(res => setItems(res.data));
      await axios.get('http://localhost:4000/api/products').then(res => setProducts(res.data)); // Actualiza stock visual
      if (setNotification && navigate) {
        setNotification({ message: "¡Pedido y productos agregados exitosamente!", type: "success" });
        setTimeout(() => {
          setNotification(null);
          navigate('/dashboard');
        }, 1600);
      }
    } catch (error) {
      alert('Error al crear pedido y/o ítems');
    }
  };

  // ----------- EDICIÓN -----------
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
      axios.get('http://localhost:4000/api/order_items').then(res => setItems(res.data));
      axios.get('http://localhost:4000/api/products').then(res => setProducts(res.data));
    } catch (error) {
      alert('Error al guardar ítem de pedido');
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
      axios.get('http://localhost:4000/api/order_items').then(res => setItems(res.data));
      axios.get('http://localhost:4000/api/products').then(res => setProducts(res.data));
    } catch (error) {
      alert('Error al eliminar ítem');
    }
  };

  // --- FILTROS Y PAGINACIÓN ---
  const filteredItems = items
    .filter(item => {
      if (filterOrderId && String(item.order_id) !== String(filterOrderId)) return false;
      if (filterProductId && String(item.product_id) !== String(filterProductId)) return false;
      return true;
    })
    .sort((a, b) => b.id - a.id);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / perPage));
  const paginatedItems = filteredItems.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [filteredItems, totalPages, page]);

  // --- RENDER ---
  function iconProduct() {
    return <i className="bi bi-box-seam" style={{ color: palette.SOFT_ORANGE, fontSize: 22, marginRight: 5 }}></i>;
  }
  function iconQuantity() {
    return <i className="bi bi-stack" style={{ color: palette.SOFT_BROWN, fontSize: 20, marginRight: 4 }}></i>;
  }
  function iconPrice() {
    return <i className="bi bi-cash-coin" style={{ color: palette.SOFT_GREEN, fontSize: 21, marginRight: 4 }}></i>;
  }
  function iconOrder() {
    return <i className="bi bi-receipt" style={{ color: palette.SOFT_ORANGE, fontSize: 20, marginRight: 4 }}></i>;
  }

  const ProductSelector = ({ idx, value, onChange }) => (
    <div className="d-flex align-items-center gap-2">
      {iconProduct()}
      <select
        className="form-select form-select-lg"
        value={value}
        onChange={e => onChange(idx, e.target.value)}
        required
        style={{
          minWidth: 180,
          border: `2.5px solid ${palette.SOFT_ORANGE}`,
          background: palette.SOFT_YELLOW,
          borderRadius: 12,
          fontSize: 18,
          fontWeight: 'bold'
        }}
      >
        <option value="">Selecciona producto</option>
        {products.map(prod => (
          <option
            key={prod.id}
            value={prod.id}
            disabled={prod.stock <= 0}
            style={{
              color: prod.stock <= 0 ? palette.BTN_DANGER : palette.BTN_PRIMARY_TEXT,
              background: prod.stock <= 0 ? palette.BTN_DISABLED : palette.SOFT_YELLOW
            }}
          >
            {prod.name} {prod.stock <= 0 ? " (Agotado)" : `(${prod.stock} disp.)`}
          </option>
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
                width: 50, height: 50, objectFit: 'cover',
                borderRadius: 9, border: `2px solid ${palette.SOFT_ORANGE}`,
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

  return (
    <div className="container my-4" style={{
      background: palette.SOFT_YELLOW,
      borderRadius: 22,
      padding: 24,
      transition: 'background 0.3s'
    }}>
      <h2 className="fw-bolder mb-4 d-flex align-items-center gap-3" style={{ color: palette.SOFT_BROWN, fontSize: 36 }}>
        <i className="bi bi-basket2-fill" style={{ color: palette.SOFT_ORANGE, fontSize: 44 }}></i>
        {editMode ? 'Editar Ítem de Pedido' : 'Nuevo Pedido y Productos'}
      </h2>

      {/* --- FORMULARIO PRINCIPAL --- */}
      {!editMode && (
        <form onSubmit={handleSubmit} style={{
          background: palette.SOFT_GRAY,
          borderRadius: 18,
          border: `2.5px solid ${palette.SOFT_ORANGE}`,
          boxShadow: "0 6px 20px #ffd16690",
          padding: 24
        }}>
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="fw-semibold" style={{ color: palette.SOFT_BROWN, fontSize: 19 }}><i className="bi bi-person-lines-fill"></i> Nombre Cliente</label>
              <input
                className="form-control form-control-lg"
                placeholder="Nombre del Cliente"
                type="text"
                value={form.customer_name}
                onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))}
                required
                style={{ borderRadius: 12, border: `2px solid ${palette.SOFT_ORANGE}`, fontSize: 20 }}
              />
            </div>
            <div className="col-md-4">
              <label className="fw-semibold" style={{ color: palette.SOFT_BROWN, fontSize: 19 }}><i className="bi bi-person-vcard"></i> NIT Cliente</label>
              <input
                className="form-control form-control-lg"
                placeholder="NIT Cliente (opcional)"
                type="text"
                value={form.nit}
                onChange={e => setForm(f => ({ ...f, nit: e.target.value }))}
                style={{ borderRadius: 12, border: `2px solid ${palette.SOFT_ORANGE}`, fontSize: 20 }}
              />
            </div>
          </div>
          {form.products.map((item, idx) => (
            <div className="card mb-4 shadow" key={idx} style={{
              border: `2px solid ${palette.SOFT_ORANGE}`,
              borderRadius: 16,
              background: palette.SOFT_YELLOW
            }}>
              <div className="card-header d-flex align-items-center gap-2" style={{
                background: palette.SOFT_ORANGE,
                color: palette.SOFT_BROWN,
                fontWeight: "bold",
                borderRadius: "14px 14px 0 0",
                fontSize: 22
              }}>
                <i className="bi bi-box2-heart-fill" style={{ color: palette.SOFT_PINK, fontSize: 29 }}></i>
                Producto #{idx + 1}
              </div>
              <div className="card-body row g-4 align-items-center">
                <div className="col-md-5">
                  <ProductSelector
                    idx={idx}
                    value={item.product_id}
                    onChange={handleProductChange}
                  />
                </div>
                <div className="col-md-2">
                  <label className="fw-semibold" style={{ color: palette.SOFT_BROWN, fontSize: 17 }}>{iconQuantity()} Cantidad</label>
                  <input
                    className="form-control form-control-lg"
                    placeholder="Cantidad"
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={e => handleQuantityChange(idx, e.target.value)}
                    required
                    style={{ borderRadius: 10, border: `2px solid ${palette.SOFT_ORANGE}`, fontSize: 19 }}
                  />
                </div>
                <div className="col-md-3 d-flex align-items-center">
                  <label className="fw-semibold mb-0 me-2" style={{ color: palette.SOFT_BROWN, fontSize: 17 }}>{iconPrice()} Precio</label>
                  <input
                    className="form-control form-control-lg"
                    placeholder="Precio en Pedido"
                    type="number"
                    step="0.01"
                    value={item.price_at_order}
                    onChange={e => item.price_locked ? handlePriceChange(idx, e.target.value) : undefined}
                    required
                    readOnly={!item.price_locked}
                    style={{
                      borderRadius: 10,
                      border: `2px solid ${palette.SOFT_ORANGE}`,
                      background: item.price_locked ? palette.SOFT_PINK : palette.SOFT_GRAY,
                      fontSize: 19,
                      cursor: item.price_locked ? 'text' : 'not-allowed'
                    }}
                  />
                  {!item.price_locked && (
                    <button type="button" className="btn btn-lg btn-outline-info ms-2" style={{
                      borderRadius: 10,
                      fontSize: 18,
                      fontWeight: "bold"
                    }} onClick={() => handleEnablePriceEdit(idx)}>
                      <i className="bi bi-pencil"></i>
                    </button>
                  )}
                </div>
                <div className="col-md-2">
                  {form.products.length > 1 && (
                    <button type="button" className="btn btn-lg" style={{
                      borderRadius: 10,
                      background: palette.BTN_DANGER,
                      color: palette.BTN_DANGER_TEXT,
                      fontWeight: "bold",
                      fontSize: 18
                    }} onClick={() => handleRemoveField(idx)}>
                      <i className="bi bi-trash"></i> Quitar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div className="mb-4 d-flex gap-3">
            <button type="button" className="btn btn-lg" style={{
              borderRadius: 12,
              background: palette.BTN_SECONDARY,
              color: palette.BTN_SECONDARY_TEXT,
              fontWeight: "bold",
              fontSize: 20
            }} onClick={handleAddField}>
              <i className="bi bi-plus-square"></i> Agregar producto
            </button>
            <button type="submit" className="btn btn-lg" style={{
              background: palette.BTN_PRIMARY,
              color: palette.BTN_PRIMARY_TEXT,
              borderRadius: 12,
              fontWeight: "bold",
              fontSize: 22,
              padding: '12px 28px'
            }}><i className="bi bi-cloud-arrow-down-fill"></i> Guardar Pedido</button>
          </div>
        </form>
      )}

      {/* --- FORMULARIO EDICIÓN --- */}
      {editMode && (
        <form onSubmit={handleEditSubmit} className="mb-4 row g-3 align-items-end" style={{
          background: palette.SOFT_GRAY,
          borderRadius: 16,
          border: `2px solid ${palette.SOFT_ORANGE}`,
          boxShadow: "0 2px 8px #f8e8d2",
          padding: 20
        }}>
          <div className="col-md-2">
            <label className="fw-semibold" style={{ color: palette.SOFT_BROWN }}>{iconOrder()} ID Pedido</label>
            <input
              className="form-control form-control-lg"
              placeholder="ID Pedido"
              type="number"
              value={editForm.order_id}
              onChange={e => handleEditChange('order_id', e.target.value)}
              required
              disabled
              style={{ borderRadius: 10, border: `2px solid ${palette.SOFT_ORANGE}` }}
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
              className="form-control form-control-lg"
              placeholder="Cantidad"
              type="number"
              value={editForm.quantity}
              onChange={e => setEditForm({ ...editForm, quantity: e.target.value })}
              required
              style={{ borderRadius: 10, border: `2px solid ${palette.SOFT_ORANGE}` }}
            />
          </div>
          <div className="col-md-2">
            <label className="fw-semibold" style={{ color: palette.SOFT_BROWN }}>{iconPrice()} Precio en Pedido</label>
            <input
              className="form-control form-control-lg"
              placeholder="Precio en Pedido"
              type="number"
              step="0.01"
              value={editForm.price_at_order}
              onChange={e => setEditForm({ ...editForm, price_at_order: e.target.value })}
              required
              style={{ borderRadius: 10, border: `2px solid ${palette.SOFT_ORANGE}` }}
            />
          </div>
          <div className="col-md-2 d-flex gap-2 align-items-end">
            <button className="btn btn-lg" style={{
              background: palette.BTN_PRIMARY,
              color: palette.BTN_PRIMARY_TEXT,
              borderRadius: 10,
              fontWeight: "bold",
              fontSize: 19
            }} type="submit"><i className="bi bi-arrow-repeat"></i> Actualizar</button>
            <button className="btn btn-lg btn-secondary" style={{ borderRadius: 10, fontSize: 19 }} type="button" onClick={handleCancel}><i className="bi bi-x-circle"></i> Cancelar</button>
          </div>
        </form>
      )}

      {/* --- LISTA DE ITEMS --- */}
      <h4 className="mt-5 fw-bold d-flex align-items-center gap-2" style={{ color: palette.SOFT_BROWN, fontSize: 28 }}>
        <i className="bi bi-archive-fill" style={{ color: palette.SOFT_ORANGE, fontSize: 34 }}></i>
        Ítems guardados
      </h4>
      <div className="mb-4 row g-3 align-items-center">
        <div className="col-sm-4">
          <label className="fw-semibold" style={{ color: palette.SOFT_BROWN }}>{iconOrder()} Buscar por ID Pedido</label>
          <input
            className="form-control form-control-lg"
            placeholder="Buscar por ID Pedido"
            type="number"
            value={filterOrderId}
            onChange={e => setFilterOrderId(e.target.value)}
            style={{ borderRadius: 10, border: `2px solid ${palette.SOFT_ORANGE}`, fontSize: 18 }}
          />
        </div>
        <div className="col-sm-4">
          <label className="fw-semibold" style={{ color: palette.SOFT_BROWN }}>{iconProduct()} Filtrar por producto</label>
          <select
            className="form-select form-select-lg"
            value={filterProductId}
            onChange={e => setFilterProductId(e.target.value)}
            style={{ borderRadius: 10, border: `2px solid ${palette.SOFT_ORANGE}`, fontSize: 18 }}
          >
            <option value="">Todos los productos</option>
            {products.map(prod => (
              <option key={prod.id} value={prod.id}>{prod.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="d-flex justify-content-center align-items-center mt-3 gap-2">
        <button
          className="btn btn-lg btn-outline-secondary"
          style={{ borderRadius: 12, fontWeight: "bold", fontSize: 19, padding: "8px 22px" }}
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        ><i className="bi bi-chevron-double-left"></i> Anterior</button>
        <span style={{ color: palette.SOFT_BROWN, fontWeight: "bold", fontSize: 20 }}>
          Página {page} de {totalPages}
        </span>
        <button
          className="btn btn-lg btn-outline-secondary"
          style={{ borderRadius: 12, fontWeight: "bold", fontSize: 19, padding: "8px 22px" }}
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
        >Siguiente <i className="bi bi-chevron-double-right"></i></button>
      </div>
      <div className="row">
        {paginatedItems.map(item => {
          const prod = products.find(p => String(p.id) === String(item.product_id));
          return (
            <div className="col-md-4 mb-4" key={item.id}>
              <div className="card h-100 shadow" style={{
                border: `2px solid ${palette.SOFT_ORANGE}`,
                borderRadius: 16,
                background: palette.SOFT_YELLOW
              }}>
                <div className="card-header d-flex align-items-center gap-2" style={{
                  background: palette.SOFT_ORANGE,
                  color: palette.SOFT_BROWN,
                  fontWeight: "bold",
                  borderRadius: "16px 16px 0 0",
                  fontSize: 21
                }}>
                  {iconOrder()} <strong>Item #{item.id}</strong> - Pedido: {item.order_id}
                </div>
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    {iconProduct()}
                    {prod && prod.image_url && /\.(png|jpe?g)$/i.test(prod.image_url) && (
                      <img
                        src={prod.image_url.startsWith('/') ? `http://localhost:4000${prod.image_url}` : prod.image_url}
                        alt={prod.name}
                        style={{ width: 48, height: 48, objectFit: 'cover', marginRight: 12, borderRadius: 9, border: `2px solid ${palette.SOFT_ORANGE}` }}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <span className="fw-bold" style={{ fontSize: 20 }}>{prod ? prod.name : item.product_id}</span>
                  </div>
                  <p className="mb-2" style={{ fontSize: 18 }}>{iconQuantity()} <strong>Cantidad:</strong> {item.quantity}</p>
                  <p className="mb-2" style={{ fontSize: 18 }}>{iconPrice()} <strong>Precio:</strong> Bs. {item.price_at_order}</p>
                  <div className="d-flex gap-2 mt-3">
                    <button className="btn btn-lg btn-outline-primary d-flex align-items-center gap-2" style={{
                      borderRadius: 10, fontSize: 18, fontWeight: "bold"
                    }} onClick={() => handleEdit(item)}>
                      <i className="bi bi-pencil"></i> Editar
                    </button>
                    <button className="btn btn-lg" style={{
                      borderRadius: 10, fontSize: 18, fontWeight: "bold",
                      background: palette.BTN_DANGER, color: palette.BTN_DANGER_TEXT
                    }} onClick={() => handleDelete(item.id)}>
                      <i className="bi bi-trash"></i> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {paginatedItems.length === 0 && (
          <div className="text-center text-muted mt-4" style={{ fontSize: 22 }}>
            No hay ítems registrados con estos filtros.
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderItems;