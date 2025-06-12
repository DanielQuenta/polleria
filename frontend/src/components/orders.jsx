import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Paletas de colores
const mainTheme = {
  SOFT_YELLOW: "#fffbe8",
  SOFT_ORANGE: "#FFD166",
  SOFT_GREEN: "#d7f9e5",
  SOFT_BROWN: "#b35012",
  SOFT_PINK: "#ffd8d8",
  SOFT_GRAY: "#f4f4f4",
  SOFT_RED: "#ffd8d8",
  TEXT_DANGER: "#c94a4a"
};
const pastelTheme = {
  SOFT_YELLOW: "#fffbe8",
  SOFT_ORANGE: "#ffe4ba",
  SOFT_GREEN: "#d7f9e5",
  SOFT_BROWN: "#b37d53",
  SOFT_PINK: "#ffe8e8",
  SOFT_GRAY: "#f4f4f4",
  SOFT_RED: "#ffd8d8",
  TEXT_DANGER: "#c94a4a"
};

function getThemeColors() {
  const theme = localStorage.getItem('theme') || 'main';
  return theme === 'main' ? mainTheme : pastelTheme;
}

// Cambia este valor según el usuario logueado real
const LOGGED_USER_ID = 1;

function Orders({ onOrderCreated, colors }) {
  // Usa el theme del dashboard si no viene por props
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'main');
  const palette = colors || (theme === 'main' ? mainTheme : pastelTheme);
  const navigate = useNavigate();

  // Permitir cambiar de tema en esta vista también
  const handleToggleTheme = () => {
    const newTheme = theme === 'main' ? 'pastel' : 'main';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({
    customer_name: '',
    order_date: '',
    status: 'pendiente',
    handled_by: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [searchDate, setSearchDate] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  });

  const [page, setPage] = useState(1);
  const perPage = 6;

  function getNowDatetimeLocal() {
    const now = new Date();
    now.setSeconds(0, 0);
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  }

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Error al obtener órdenes', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    setForm(f => ({
      ...f,
      handled_by: LOGGED_USER_ID,
      order_date: getNowDatetimeLocal()
    }));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let customerName = form.customer_name.trim();
      if (!customerName) customerName = "Sin Nombre";

      let payload = {
        ...form,
        customer_name: customerName,
        handled_by: form.handled_by ? Number(form.handled_by) : null,
        order_date: form.order_date ? form.order_date : null
      };

      if (payload.order_date) {
        const [datePart, timePart] = payload.order_date.split('T');
        const isoLocal = `${datePart}T${timePart}:00`;
        payload.order_date = isoLocal;
      }

      if (editMode) {
        await axios.put(`http://localhost:4000/api/orders/${editingId}`, payload);
        setEditMode(false);
        setEditingId(null);
      } else {
        const response = await axios.post('http://localhost:4000/api/orders', payload);
        const newOrderId = response.data.id;
        if (onOrderCreated) onOrderCreated(newOrderId);
      }
      setForm({
        customer_name: '',
        order_date: getNowDatetimeLocal(),
        status: 'pendiente',
        handled_by: LOGGED_USER_ID
      });
      fetchOrders();
    } catch (err) {
      console.error('Error al guardar orden', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/api/orders/${id}`);
      fetchOrders();
    } catch (err) {
      console.error('Error al eliminar orden', err);
    }
  };

  const handleEdit = (order) => {
    setForm({
      customer_name: order.customer_name || '',
      order_date: order.order_date ? order.order_date.slice(0, 16) : getNowDatetimeLocal(),
      status: order.status || 'pendiente',
      handled_by: order.handled_by || LOGGED_USER_ID
    });
    setEditingId(order.id);
    setEditMode(true);
  };

  function statusColor(status) {
    if (status === 'entregado') return palette.SOFT_GREEN;
    if (status === 'cancelado') return palette.SOFT_RED;
    if (status === 'en preparación') return palette.SOFT_ORANGE;
    return palette.SOFT_YELLOW;
  }
  function statusTextColor(status) {
    if (status === 'entregado' || status === 'en preparación') return palette.SOFT_BROWN;
    if (status === 'cancelado') return palette.TEXT_DANGER || "#c94a4a";
    return palette.SOFT_BROWN;
  }

  function statusIcon(status) {
    if (status === 'entregado') return <i className="bi bi-check-circle-fill" style={{ color: palette.SOFT_GREEN, fontSize: 20 }} title="Entregado"></i>;
    if (status === 'cancelado') return <i className="bi bi-x-circle-fill" style={{ color: palette.SOFT_RED, fontSize: 20 }} title="Cancelado"></i>;
    if (status === 'en preparación') return <i className="bi bi-alarm" style={{ color: palette.SOFT_ORANGE, fontSize: 20 }} title="En preparación"></i>;
    return <i className="bi bi-hourglass-split" style={{ color: palette.SOFT_YELLOW, fontSize: 20 }} title="Pendiente"></i>;
  }

  function userIcon() {
    return <i className="bi bi-person-badge" style={{ color: palette.SOFT_BROWN, fontSize: 18, marginRight: 3 }}></i>;
  }

  function calendarIcon() {
    return <i className="bi bi-calendar-event" style={{ color: palette.SOFT_ORANGE, fontSize: 18, marginRight: 3 }}></i>;
  }

  const filteredOrders = orders.filter(order => {
    if (!order.order_date) return false;
    const od = new Date(order.order_date);
    const orderDay = od.toISOString().slice(0, 10);
    return orderDay === searchDate;
  }).sort((a, b) => new Date(b.order_date) - new Date(a.order_date));

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / perPage));
  const paginatedOrders = filteredOrders.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [filteredOrders, totalPages, page]);

  return (
    <div className="container my-4" style={{
      background: palette.SOFT_YELLOW,
      borderRadius: 20,
      padding: 20,
      transition: 'background 0.3s'
    }}>
      {/* Botón de volver y cambiar tema */}
      <div className="mb-4 d-flex gap-2">
        <button
          className="btn fw-bold d-flex align-items-center gap-2"
          onClick={() => navigate('/dashboard')}
          style={{
            background: palette.SOFT_ORANGE,
            color: palette.SOFT_BROWN,
            border: `1.5px solid ${palette.SOFT_GREEN}`,
            borderRadius: 8,
            fontWeight: "bold",
            boxShadow: `0 1px 4px ${palette.SOFT_ORANGE}50`
          }}
        >
          <i className="bi bi-arrow-left"></i> Volver
        </button>
        <button
          className="btn fw-bold d-flex align-items-center gap-2"
          style={{
            background: palette.SOFT_GREEN,
            color: palette.SOFT_BROWN,
            border: `1.5px solid ${palette.SOFT_ORANGE}`,
            borderRadius: 8,
            fontWeight: "bold"
          }}
          onClick={handleToggleTheme}
        >
          <i className={`bi ${theme === 'main' ? 'bi-brightness-high' : 'bi-moon'}`}></i>
          Cambiar tema
        </button>
      </div>
      <h3 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: palette.SOFT_BROWN }}>
        <i className="bi bi-receipt-cutoff" style={{ color: palette.SOFT_ORANGE, fontSize: 33 }}></i>
        {editMode ? 'Editar Orden' : 'Agregar Orden'}
      </h3>
      <form onSubmit={handleSubmit} className="mb-4 row g-2 align-items-end"
        style={{
          background: palette.SOFT_GRAY,
          borderRadius: 16,
          border: `2px solid ${palette.SOFT_ORANGE}`,
          boxShadow: `0 2px 10px ${palette.SOFT_ORANGE}`,
          transition: 'all 0.3s'
        }}
      >
        <div className="col-sm-3">
          <label className="mb-1 fw-semibold" style={{ color: palette.SOFT_BROWN }}>
            <i className="bi bi-person-circle"></i> Cliente
          </label>
          <input
            className="form-control"
            placeholder="Cliente"
            value={form.customer_name}
            onChange={e => setForm({ ...form, customer_name: e.target.value })}
            required
            style={{ borderRadius: 8, border: `1px solid ${palette.SOFT_ORANGE}` }}
          />
        </div>
        <div className="col-sm-3">
          <label className="mb-1 fw-semibold" style={{ color: palette.SOFT_BROWN }}>
            <i className="bi bi-calendar2-week"></i> Fecha y hora
          </label>
          <input
            className="form-control"
            type="datetime-local"
            value={form.order_date}
            onChange={e => setForm({ ...form, order_date: e.target.value })}
            required
            style={{ borderRadius: 8, border: `1px solid ${palette.SOFT_ORANGE}` }}
          />
        </div>
        <div className="col-sm-2">
          <label className="mb-1 fw-semibold" style={{ color: palette.SOFT_BROWN }}>
            <i className="bi bi-info-circle"></i> Estado
          </label>
          <select
            className="form-select"
            value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value })}
            style={{ borderRadius: 8, border: `1px solid ${palette.SOFT_ORANGE}` }}
          >
            <option value="pendiente">Pendiente</option>
            <option value="en preparación">En preparación</option>
            <option value="entregado">Entregado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <div className="col-sm-2">
          <label className="mb-1 fw-semibold" style={{ color: palette.SOFT_BROWN }}>
            <i className="bi bi-person-badge"></i> Encargado
          </label>
          <input
            className="form-control"
            placeholder="ID usuario encargado"
            type="number"
            value={form.handled_by}
            onChange={e => setForm({ ...form, handled_by: e.target.value })}
            readOnly
            style={{ background: palette.SOFT_GRAY, borderRadius: 8, border: `1px solid ${palette.SOFT_ORANGE}`, cursor: 'not-allowed' }}
          />
        </div>
        <div className="col-sm-2 d-flex gap-1 align-items-end">
          <button className="btn" type="submit"
            style={{
              background: palette.SOFT_ORANGE,
              color: palette.SOFT_BROWN,
              borderRadius: 8,
              fontWeight: "bold",
              border: "none"
            }}>
            <i className={`bi ${editMode ? 'bi-arrow-repeat' : 'bi-plus-circle'}`}></i> {editMode ? 'Actualizar' : 'Agregar'}
          </button>
          {editMode && (
            <button
              className="btn btn-secondary"
              type="button"
              style={{ borderRadius: 8 }}
              onClick={() => {
                setForm({
                  customer_name: '',
                  order_date: getNowDatetimeLocal(),
                  status: 'pendiente',
                  handled_by: LOGGED_USER_ID
                });
                setEditMode(false);
                setEditingId(null);
              }}
            >
              <i className="bi bi-x-circle"></i> Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Selector de fecha para búsquedas */}
      <div className="mb-4 d-flex align-items-center gap-2">
        <label className="fw-bold" style={{ color: palette.SOFT_BROWN }}>
          <i className="bi bi-calendar-range"></i> Ver pedidos del día:&nbsp;
        </label>
        <input
          type="date"
          value={searchDate}
          onChange={e => setSearchDate(e.target.value)}
          className="form-control"
          style={{ maxWidth: 180, borderRadius: 8, border: `1px solid ${palette.SOFT_ORANGE}` }}
        />
      </div>

      <div className="row">
        {paginatedOrders.map(order => (
          <div className="col-md-4 mb-3" key={order.id}>
            <div
              className="card h-100 shadow"
              style={{
                border: `2px solid ${statusColor(order.status)}`,
                borderRadius: 16,
                background: palette.SOFT_GRAY,
                transition: 'border 0.3s, background 0.3s'
              }}
            >
              <div
                className="card-header d-flex align-items-center gap-2"
                style={{
                  background: statusColor(order.status),
                  color: statusTextColor(order.status),
                  fontWeight: "bold",
                  borderRadius: "14px 14px 0 0"
                }}
              >
                {statusIcon(order.status)}
                <strong>#{order.id}</strong> - {order.customer_name}
              </div>
              <div className="card-body">
                <p className="card-text mb-1">
                  {statusIcon(order.status)} <strong>Estado:</strong> {order.status}
                </p>
                <p className="card-text mb-1">
                  {calendarIcon()} <strong>Fecha:</strong> {order.order_date ? new Date(order.order_date).toLocaleString() : ''}
                </p>
                <p className="card-text mb-1">
                  {userIcon()} <strong>Encargado:</strong> {order.handled_by || 'N/A'}
                </p>
                <div className="d-flex gap-2 mt-2 justify-content-center">
                  <button
                    className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                    style={{ borderRadius: 7 }}
                    onClick={() => handleEdit(order)}
                  >
                    <i className="bi bi-pencil"></i> Editar
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                    style={{ borderRadius: 7 }}
                    onClick={() => handleDelete(order.id)}
                  >
                    <i className="bi bi-trash"></i> Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {paginatedOrders.length === 0 && (
          <div className="text-center text-muted mt-4">
            No hay órdenes para este día.
          </div>
        )}
      </div>

      {/* Paginación */}
      <div className="d-flex justify-content-center align-items-center mt-3 gap-2">
        <button
          className="btn btn-outline-secondary"
          style={{ borderRadius: 8, fontWeight: "bold" }}
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >
          <i className="bi bi-chevron-double-left"></i> Anterior
        </button>
        <span style={{ color: palette.SOFT_BROWN, fontWeight: "bold" }}>
          Página {page} de {totalPages}
        </span>
        <button
          className="btn btn-outline-secondary"
          style={{ borderRadius: 8, fontWeight: "bold" }}
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
        >
          Siguiente <i className="bi bi-chevron-double-right"></i>
        </button>
      </div>
    </div>
  );
}

export default Orders;