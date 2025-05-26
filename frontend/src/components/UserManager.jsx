import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Paletas de colores (ya definidas)
const mainTheme = {
  SOFT_YELLOW: "#fffbe8",
  SOFT_ORANGE: "#FFD166",
  SOFT_GREEN: "#d7f9e5",
  SOFT_BROWN: "#b35012",
  SOFT_PINK: "#ffd8d8",
  SOFT_GRAY: "#f4f4f4"
};
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
function iconUser() {
  return <i className="bi bi-person" style={{ color: "#FFD166", fontSize: 32, marginRight: 7 }}></i>;
}
function iconUserBig(role) {
  return (
    <i
      className="bi bi-person-circle"
      style={{
        color: role === 'admin' ? "#FFD166" : "#d7f9e5",
        fontSize: 40,
      }}
    ></i>
  );
}
function iconEdit() {
  return <i className="bi bi-pencil"></i>;
}
function iconDelete() {
  return <i className="bi bi-trash"></i>;
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
function iconPassword() {
  return <i className="bi bi-shield-lock" style={{ color: "#b37d53", fontSize: 16, marginRight: 5 }}></i>;
}
function iconRol() {
  return <i className="bi bi-person-badge" style={{ color: "#FFD166", fontSize: 16, marginRight: 5 }}></i>;
}

function UsersCrud({ colors }) {
  const palette = colors || getThemeColors();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    username: '',
    password: '',
    role: 'empleado'
  });

  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Obtener usuarios
  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Error al obtener usuarios', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.role || form.role === '') {
      alert('Por favor selecciona un rol.');
      return;
    }
    try {
      if (editMode) {
        await axios.put(`http://localhost:4000/api/users/${editingId}`, form);
        setEditMode(false);
        setEditingId(null);
      } else {
        await axios.post('http://localhost:4000/api/users', form);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1500);
      }
      setForm({ username: '', password: '', role: 'empleado' });
      fetchUsers();
    } catch (err) {
      console.error('Error al guardar usuario', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/api/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error('Error al eliminar usuario', err);
    }
  };

  const handleEdit = (user) => {
    setForm({
      username: user.username,
      password: '',
      role: user.role
    });
    setEditingId(user.id);
    setEditMode(true);
  };

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
        {iconUser()}
        {editMode ? 'Editar Usuario' : 'Agregar Usuario'}
      </h3>
      <form 
        onSubmit={handleSubmit} 
        className="row g-2 align-items-end mb-4"
        style={{
          background: palette.SOFT_GRAY,
          borderRadius: 16,
          border: `2px solid ${palette.SOFT_ORANGE}`,
          boxShadow: `0 2px 10px ${palette.SOFT_ORANGE}55`
        }}
      >
        <div className="col-md-3">
          <label className="mb-1 fw-semibold" style={{ color: palette.SOFT_BROWN }}>
            <i className="bi bi-person-circle" style={{ color: palette.SOFT_ORANGE, marginRight: 4 }}></i> Usuario
          </label>
          <input
            className="form-control"
            placeholder="Usuario"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            required
            style={{ borderRadius: 8, border: `1px solid ${palette.SOFT_ORANGE}` }}
            autoComplete="off"
          />
        </div>
        <div className="col-md-3">
          <label className="mb-1 fw-semibold" style={{ color: palette.SOFT_BROWN }}>
            {iconPassword()} {editMode ? "Nueva contraseña (opcional)" : "Contraseña"}
          </label>
          <input
            className="form-control"
            placeholder={editMode ? "Nueva contraseña (opcional)" : "Contraseña"}
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            style={{ borderRadius: 8, border: `1px solid ${palette.SOFT_ORANGE}` }}
            autoComplete="new-password"
            required={!editMode}
          />
        </div>
        <div className="col-md-3">
          <label className="mb-1 fw-semibold" style={{ color: palette.SOFT_BROWN }}>
            {iconRol()} Rol
          </label>
          <select
            className="form-select"
            value={form.role || 'empleado'}
            onChange={e => setForm({ ...form, role: e.target.value })}
            required
            style={{ borderRadius: 8, border: `1px solid ${palette.SOFT_ORANGE}` }}
          >
            <option value="">Seleccionar rol</option>
            <option value="empleado">Empleado</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <div className="col-md-3 d-flex gap-1 align-items-end">
          <button 
            type="submit" 
            className="btn fw-bold d-flex align-items-center gap-1"
            style={{
              background: palette.SOFT_ORANGE,
              color: palette.SOFT_BROWN,
              borderRadius: 8,
              border: "none",
              boxShadow: `0 2px 6px ${palette.SOFT_ORANGE}`
            }}>
            {editMode ? iconUpdate() : iconRegister()}
            {editMode ? 'Actualizar' : 'Agregar'}
          </button>
          {editMode && (
            <button
              type="button"
              className="btn btn-secondary d-flex align-items-center gap-1"
              style={{ borderRadius: 8 }}
              onClick={() => {
                setForm({
                  username: '',
                  password: '',
                  role: 'empleado'
                });
                setEditMode(false);
                setEditingId(null);
              }}
            >
              {iconCancel()} Cancelar
            </button>
          )}
        </div>
      </form>

      {showSuccess && (
        <div 
          className="alert text-center fw-bold d-flex align-items-center justify-content-center gap-2"
          style={{
            background: palette.SOFT_GREEN,
            color: palette.SOFT_BROWN,
            borderRadius: 16,
            fontSize: 22,
            position: "fixed",
            top: 70,
            left: "50%",
            transform: "translateX(-50%) scale(1.1)",
            zIndex: 2000,
            minWidth: 300,
            boxShadow: `0 4px 16px ${palette.SOFT_ORANGE}`,
            transition: "opacity 0.5s, transform 0.5s"
          }}
        >
          <i className="bi bi-check-circle-fill" style={{ fontSize: 24 }}></i>
          ¡Usuario agregado con éxito!
        </div>
      )}

      <div className="row mt-4 g-4">
        {users.map(u => (
          <div className="col-md-4 col-lg-3" key={u.id}>
            <div 
              className="card shadow border-0"
              style={{
                minHeight: 270,
                borderRadius: 18,
                overflow: "hidden",
                background: palette.SOFT_GRAY,
                boxShadow: `0 6px 32px 0 ${palette.SOFT_ORANGE}40`
              }}
            >
              <div
                className="d-flex flex-column align-items-center"
                style={{
                  background: u.role === 'admin' ? palette.SOFT_ORANGE : palette.SOFT_GREEN,
                  borderBottom: `4px solid ${palette.SOFT_YELLOW}`,
                  padding: "36px 0 18px 0"
                }}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: 76,
                    height: 76,
                    background: palette.SOFT_YELLOW,
                    border: `3px solid ${u.role === 'admin' ? palette.SOFT_BROWN : palette.SOFT_GREEN}`,
                    fontSize: 40,
                    color: palette.SOFT_BROWN,
                    marginBottom: 10,
                    boxShadow: "0 2px 16px #FFD16633"
                  }}
                >
                  {iconUserBig(u.role)}
                </div>
                <h5 className="fw-bold mb-1 text-center" style={{ color: palette.SOFT_BROWN }}>
                  {u.username}
                </h5>
                <div>
                  <span className={`badge ${u.role === 'admin' ? 'bg-warning text-dark' : 'bg-success text-white'}`}>
                    {u.role === 'admin' ? 'Administrador' : 'Empleado'}
                  </span>
                </div>
              </div>
              <div className="card-body text-center py-3">
                <div className="d-flex justify-content-center gap-2">
                  <button
                    className="btn btn-outline-primary btn-sm px-3 fw-bold d-flex align-items-center gap-1"
                    onClick={() => handleEdit(u)}
                    style={{ borderRadius: 7 }}
                  >
                    {iconEdit()} Editar
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm px-3 fw-bold d-flex align-items-center gap-1"
                    onClick={() => handleDelete(u.id)}
                    style={{ borderRadius: 7 }}
                  >
                    {iconDelete()} Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <div className="text-center text-muted mt-4">
            No hay usuarios registrados aún.
          </div>
        )}
      </div>
    </div>
  );
}

export default UsersCrud;