import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Paleta principal igual a login/header/footer
const mainTheme = {
  SOFT_YELLOW: "#fffbe8",
  SOFT_ORANGE: "#FFD166",
  SOFT_GREEN: "#d7f9e5",
  SOFT_BROWN: "#b35012",
  SOFT_PINK: "#ffd8d8",
  SOFT_GRAY: "#f4f4f4"
};
// Paleta pastel suave
const pastelTheme = {
  SOFT_YELLOW: "#fffbe8",
  SOFT_ORANGE: "#ffe4ba",
  SOFT_GREEN: "#d7f9e5",
  SOFT_BROWN: "#b37d53",
  SOFT_PINK: "#ffe8e8",
  SOFT_GRAY: "#f4f4f4"
};

function getThemeColors() {
  const theme = localStorage.getItem('theme') || 'main';
  return theme === 'main' ? mainTheme : pastelTheme;
}

// Icon helpers
function iconFactura() {
  return <i className="bi bi-file-earmark-text" style={{ color: "#FFD166", fontSize: 32, marginRight: 7 }}></i>;
}
function iconPedido() {
  return <i className="bi bi-receipt" style={{ color: "#FFD166", fontSize: 16, marginRight: 4 }}></i>;
}
function iconTotal() {
  return <i className="bi bi-cash-coin" style={{ color: "#d7f9e5", fontSize: 17, marginRight: 4 }}></i>;
}
function iconMetodopago() {
  return <i className="bi bi-credit-card-2-front" style={{ color: "#FFD166", fontSize: 17, marginRight: 4 }}></i>;
}
function iconNit() {
  return <i className="bi bi-person-vcard" style={{ color: "#b37d53", fontSize: 17, marginRight: 4 }}></i>;
}
function iconCliente() {
  return <i className="bi bi-person" style={{ color: "#b37d53", fontSize: 17, marginRight: 4 }}></i>;
}
function iconEdit() {
  return <i className="bi bi-pencil"></i>;
}
function iconDelete() {
  return <i className="bi bi-trash"></i>;
}
function iconPrev() {
  return <i className="bi bi-chevron-double-left"></i>;
}
function iconNext() {
  return <i className="bi bi-chevron-double-right"></i>;
}
function iconBack() {
  return <i className="bi bi-arrow-left"></i>;
}
function iconRegister() {
  return <i className="bi bi-plus-circle"></i>;
}
function iconUpdate() {
  return <i className="bi bi-arrow-repeat"></i>;
}
function iconCancel() {
  return <i className="bi bi-x-circle"></i>;
}

function InvoiceManager({ colors }) {
  const palette = colors || getThemeColors();
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [form, setForm] = useState({
    order_id: '',
    total_amount: '',
    payment_method: 'efectivo',
    nit_cliente: '',
    nombre_cliente_factura: ''
  });

  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Filtros
  const [filterOrderId, setFilterOrderId] = useState('');
  const [filterNombreCliente, setFilterNombreCliente] = useState('');
  const [filterMetodoPago, setFilterMetodoPago] = useState('');

  // Paginación
  const [page, setPage] = useState(1);
  const perPage = 6;

  const fetchInvoices = async () => {
    const res = await axios.get('http://localhost:4000/api/invoices');
    setInvoices(res.data);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filterOrderId, filterNombreCliente, filterMetodoPago]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editMode) {
      await axios.put(`http://localhost:4000/api/invoices/${editingId}`, form);
      setEditMode(false);
      setEditingId(null);
    } else {
      await axios.post('http://localhost:4000/api/invoices', form);
    }

    setForm({
      order_id: '',
      total_amount: '',
      payment_method: 'efectivo',
      nit_cliente: '',
      nombre_cliente_factura: ''
    });
    fetchInvoices();
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:4000/api/invoices/${id}`);
    fetchInvoices();
  };

  const handleEdit = (invoice) => {
    setForm({
      order_id: invoice.order_id,
      total_amount: invoice.total_amount,
      payment_method: invoice.payment_method,
      nit_cliente: invoice.nit_cliente,
      nombre_cliente_factura: invoice.nombre_cliente_factura
    });
    setEditingId(invoice.id);
    setEditMode(true);
  };

  // Filtro: por ID de pedido, por nombre de cliente (case-insensitive), por método de pago
  const filteredInvoices = invoices
    .filter(f => {
      if (filterOrderId && String(f.order_id) !== String(filterOrderId)) return false;
      if (filterNombreCliente && !String(f.nombre_cliente_factura || "").toLowerCase().includes(filterNombreCliente.toLowerCase())) return false;
      if (filterMetodoPago && f.payment_method !== filterMetodoPago) return false;
      return true;
    })
    .sort((a, b) => b.id - a.id); // más recientes primero

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / perPage));
  const paginatedInvoices = filteredInvoices.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [filteredInvoices, totalPages, page]);

  return (
    <div className="container my-4" style={{ background: palette.SOFT_YELLOW, borderRadius: 20, padding: 20 }}>
      {/* Botón de volver */}
      <div className="mb-4">
        <button
          className="btn fw-bold d-flex align-items-center gap-2"
          onClick={() => navigate(-1)}
          style={{
            background: palette.SOFT_ORANGE,
            color: palette.SOFT_BROWN,
            border: `1.5px solid ${palette.SOFT_GREEN}`,
            borderRadius: 8,
            fontWeight: "bold",
            boxShadow: `0 1px 4px ${palette.SOFT_ORANGE}50`
          }}
        >
          {iconBack()} Volver
        </button>
      </div>
      <h3 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: palette.SOFT_BROWN }}>
        {iconFactura()}
        {editMode ? 'Editar Factura' : 'Registrar Factura'}
      </h3>
      <form onSubmit={handleSubmit} className="mb-4 row g-2 align-items-end"
        style={{
          background: palette.SOFT_GRAY,
          borderRadius: 16,
          border: `2px solid ${palette.SOFT_ORANGE}`,
          boxShadow: `0 2px 10px ${palette.SOFT_ORANGE}55`
        }}
      >
        <div className="col-sm-2">
          <label className="mb-1 fw-semibold" style={{ color: palette.SOFT_BROWN }}>{iconPedido()} ID Pedido</label>
          <input
            className="form-control"
            placeholder="ID Pedido"
            type="number"
            value={form.order_id}
            onChange={e => setForm({ ...form, order_id: e.target.value })}
            required
            style={{ borderRadius: 8, border: `1px solid ${palette.SOFT_ORANGE}` }}
          />
        </div>
        <div className="col-sm-2">
          <label className="mb-1 fw-semibold" style={{ color: palette.SOFT_BROWN }}>{iconTotal()} Total Bs.</label>
          <input
            className="form-control"
            placeholder="Total Bs."
            type="number"
            value={form.total_amount}
            onChange={e => setForm({ ...form, total_amount: e.target.value })}
            required
            style={{ borderRadius: 8, border: `1px solid ${palette.SOFT_ORANGE}` }}
            min="0"
            step="0.01"
          />
        </div>
        <div className="col-sm-2">
          <label className="mb-1 fw-semibold" style={{ color: palette.SOFT_BROWN }}>{iconMetodopago()} Método</label>
          <select
            className="form-select"
            value={form.payment_method}
            onChange={e => setForm({ ...form, payment_method: e.target.value })}
            style={{ borderRadius: 8, border: `1px solid ${palette.SOFT_ORANGE}` }}
          >
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="QR">QR</option>
          </select>
        </div>
        <div className="col-sm-2">
          <label className="mb-1 fw-semibold" style={{ color: palette.SOFT_BROWN }}>{iconNit()} NIT Cliente</label>
          <input
            className="form-control"
            placeholder="NIT Cliente"
            value={form.nit_cliente}
            onChange={e => setForm({ ...form, nit_cliente: e.target.value })}
            style={{ borderRadius: 8, border: `1px solid ${palette.SOFT_ORANGE}` }}
          />
        </div>
        <div className="col-sm-2">
          <label className="mb-1 fw-semibold" style={{ color: palette.SOFT_BROWN }}>{iconCliente()} Nombre Cliente</label>
          <input
            className="form-control"
            placeholder="Nombre Cliente"
            value={form.nombre_cliente_factura}
            onChange={e => setForm({ ...form, nombre_cliente_factura: e.target.value })}
            style={{ borderRadius: 8, border: `1px solid ${palette.SOFT_ORANGE}` }}
          />
        </div>
        <div className="col-sm-2 d-flex gap-1">
          <button className="btn d-flex align-items-center gap-1"
            style={{
              background: palette.SOFT_ORANGE,
              color: palette.SOFT_BROWN,
              borderRadius: 8,
              fontWeight: "bold",
              border: "none"
            }}
            type="submit">
            {editMode ? iconUpdate() : iconRegister()}
            {editMode ? 'Actualizar' : 'Registrar'}
          </button>
          {editMode && (
            <button
              className="btn btn-secondary d-flex align-items-center gap-1"
              type="button"
              style={{ borderRadius: 8 }}
              onClick={() => {
                setEditMode(false);
                setForm({
                  order_id: '',
                  total_amount: '',
                  payment_method: 'efectivo',
                  nit_cliente: '',
                  nombre_cliente_factura: ''
                });
                setEditingId(null);
              }}
            >
              {iconCancel()} Cancelar
            </button>
          )}
        </div>
      </form>

      <h4 className="mt-4 fw-bold d-flex align-items-center gap-2" style={{ color: palette.SOFT_BROWN }}>
        <i className="bi bi-journal-bookmark-fill" style={{ color: palette.SOFT_ORANGE, fontSize: 23 }}></i>
        Facturas registradas
      </h4>

      {/* Filtros debajo del título de facturas */}
      <div className="mb-4 row g-2 align-items-center">
        <div className="col-sm-3">
          <label className="fw-semibold" style={{ color: palette.SOFT_BROWN }}>{iconPedido()} Buscar por ID Pedido</label>
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
          <label className="fw-semibold" style={{ color: palette.SOFT_BROWN }}>{iconCliente()} Buscar por Nombre Cliente</label>
          <input
            className="form-control"
            placeholder="Buscar por Nombre Cliente"
            value={filterNombreCliente}
            onChange={e => setFilterNombreCliente(e.target.value)}
            style={{ borderRadius: 8, border: `1px solid ${palette.SOFT_ORANGE}` }}
          />
        </div>
        <div className="col-sm-3">
          <label className="fw-semibold" style={{ color: palette.SOFT_BROWN }}>{iconMetodopago()} Filtrar por método</label>
          <select
            className="form-select"
            value={filterMetodoPago}
            onChange={e => setFilterMetodoPago(e.target.value)}
            style={{ borderRadius: 8, border: `1px solid ${palette.SOFT_ORANGE}` }}
          >
            <option value="">Todos los métodos</option>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="QR">QR</option>
          </select>
        </div>
      </div>

      {/* Paginación */}
      <div className="d-flex justify-content-center align-items-center mt-3 gap-2">
        <button
          className="btn btn-outline-secondary d-flex align-items-center gap-1"
          style={{ borderRadius: 8, fontWeight: "bold" }}
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >{iconPrev()} Anterior</button>
        <span style={{ color: palette.SOFT_BROWN, fontWeight: "bold" }}>
          Página {page} de {totalPages}
        </span>
        <button
          className="btn btn-outline-secondary d-flex align-items-center gap-1"
          style={{ borderRadius: 8, fontWeight: "bold" }}
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
        >Siguiente {iconNext()}</button>
      </div>

      <div className="row">
        {paginatedInvoices.map(f => (
          <div className="col-md-4 mb-3" key={f.id}>
            <div className="card h-100 shadow" style={{
              border: `2px solid ${palette.SOFT_ORANGE}`,
              borderRadius: 14,
              background: palette.SOFT_GRAY
            }}>
              <div className="card-header d-flex align-items-center gap-2" style={{
                background: palette.SOFT_GREEN,
                color: palette.SOFT_BROWN,
                fontWeight: "bold",
                borderRadius: "12px 12px 0 0"
              }}>
                {iconFactura()} Factura #{f.id}
              </div>
              <div className="card-body">
                <p className="card-text mb-1">{iconPedido()}<strong>Pedido:</strong> #{f.order_id}</p>
                <p className="card-text mb-1">{iconTotal()}<strong>Total:</strong> Bs. {f.total_amount}</p>
                <p className="card-text mb-1">{iconMetodopago()}<strong>Método de Pago:</strong> {f.payment_method}</p>
                <p className="card-text mb-1">{iconNit()}<strong>NIT:</strong> {f.nit_cliente || '-'}</p>
                <p className="card-text mb-1">{iconCliente()}<strong>Cliente:</strong> {f.nombre_cliente_factura || '-'}</p>
                <div className="d-flex gap-2 mt-2 justify-content-center">
                  <button className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1" onClick={() => handleEdit(f)}>{iconEdit()} Editar</button>
                  <button className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1" onClick={() => handleDelete(f.id)}>{iconDelete()} Eliminar</button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {paginatedInvoices.length === 0 && (
          <div className="text-center text-muted mt-4">
            No hay facturas registradas con estos filtros.
          </div>
        )}
      </div>
    </div>
  );
}

export default InvoiceManager;