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

function ProductManager({ colors }) {
  const palette = colors || getThemeColors();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    type: 'combo',
    available: true,
    image_url: '',
    estado: 'disponible',
    stock: ''
  });

  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Efecto de producto agregado
  const [showSuccess, setShowSuccess] = useState(false);

  // Obtener productos
  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Error al obtener productos', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.type || form.type === '') {
      alert('Por favor selecciona un tipo de producto.');
      return;
    }

    try {
      const data = new FormData();
      data.append('name', form.name);
      data.append('description', form.description || '');
      data.append('price', form.price);
      data.append('type', form.type);
      data.append('available', form.available);
      data.append('estado', form.estado);
      data.append('stock', form.stock === '' ? 0 : form.stock);
      if (imageFile) {
        data.append('image', imageFile);
      } else if (form.image_url) {
        data.append('image_url', form.image_url);
      }

      if (editMode) {
        await axios.put(`http://localhost:4000/api/products/${editingId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setEditMode(false);
        setEditingId(null);
      } else {
        await axios.post('http://localhost:4000/api/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1500);
      }

      setForm({
        name: '',
        description: '',
        price: '',
        type: 'combo',
        available: true,
        image_url: '',
        estado: 'disponible',
        stock: ''
      });
      setImageFile(null);
      fetchProducts();
    } catch (err) {
      console.error('Error al guardar producto', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/api/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error('Error al eliminar producto', err);
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      type: product.type,
      available: product.available,
      image_url: product.image_url || '',
      estado: product.estado || 'disponible',
      stock: product.stock === null || product.stock === undefined ? '' : product.stock
    });
    setEditingId(product.id);
    setEditMode(true);
    setImageFile(null);
  };

  // Iconos decorativos
  function iconProduct() {
    return <i className="bi bi-box-seam" style={{ color: palette.SOFT_ORANGE, fontSize: 20, marginRight: 4 }}></i>;
  }
  function iconType() {
    return <i className="bi bi-tags-fill" style={{ color: palette.SOFT_ORANGE, fontSize: 18, marginRight: 4 }}></i>;
  }
  function iconStock() {
    return <i className="bi bi-layers" style={{ color: palette.SOFT_BROWN, fontSize: 18, marginRight: 4 }}></i>;
  }
  function iconPrice() {
    return <i className="bi bi-cash-coin" style={{ color: palette.SOFT_GREEN, fontSize: 18, marginRight: 4 }}></i>;
  }
  function iconDescription() {
    return <i className="bi bi-card-text" style={{ color: palette.SOFT_BROWN, fontSize: 18, marginRight: 4 }}></i>;
  }
  function iconStatus() {
    return <i className="bi bi-check2-circle" style={{ color: palette.SOFT_GREEN, fontSize: 18, marginRight: 4 }}></i>;
  }
  function iconImage() {
    return <i className="bi bi-image" style={{ color: palette.SOFT_ORANGE, fontSize: 18, marginRight: 4 }}></i>;
  }

  return (
    <div className="container my-4" style={{ background: palette.SOFT_YELLOW, borderRadius: 20, padding: 20 }}>
      {/* Botón de volver */}
      <div className="mb-4">
        <button
          className="btn fw-bold"
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
          <i className="bi bi-arrow-left"></i> Volver
        </button>
      </div>
      <h3 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: palette.SOFT_BROWN }}>
        <i className="bi bi-boxes" style={{ color: palette.SOFT_ORANGE, fontSize: 33 }}></i>
        {editMode ? 'Editar Producto' : 'Agregar Producto'}
      </h3>
      <form 
        onSubmit={handleSubmit} 
        encType="multipart/form-data"
        className="row g-2 align-items-end mb-4"
        style={{
          background: palette.SOFT_GRAY,
          borderRadius: 16,
          border: `2px solid ${palette.SOFT_ORANGE}`,
          boxShadow: `0 2px 10px ${palette.SOFT_ORANGE}55`
        }}
      >
        <div className="col-md-3">
          <label className="mb-1 fw-semibold" style={{ color: palette.SOFT_BROWN }}>{iconProduct()} Nombre</label>
          <input
            className="form-control"
            placeholder="Nombre"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
            style={{ borderRadius: 8, border: `1px solid ${palette.SOFT_ORANGE}` }}
          />
        </div>
        <div className="col-md-3">
          <label className="mb-1 fw-semibold" style={{ color: palette.SOFT_BROWN }}>{iconDescription()} Descripción</label>
          <input
            className="form-control"
            placeholder="Descripción"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            style={{ borderRadius: 8, border: `1px solid ${palette.SOFT_ORANGE}` }}
          />
        </div>
        <div className="col-md-2">
          <label className="mb-1 fw-semibold" style={{ color: palette.SOFT_BROWN }}>{iconPrice()} Precio</label>
          <input
            className="form-control"
            placeholder="Precio"
            type="number"
            value={form.price}
            onChange={e => setForm({ ...form, price: e.target.value })}
            required
            style={{ borderRadius: 8, border: `1px solid ${palette.SOFT_ORANGE}` }}
            min="0"
            step="0.01"
          />
        </div>
        <div className="col-md-2">
          <label className="mb-1 fw-semibold" style={{ color: palette.SOFT_BROWN }}>{iconType()} Tipo</label>
          <select
            className="form-select"
            value={form.type || 'combo'}
            onChange={e => setForm({ ...form, type: e.target.value })}
            required
            style={{ borderRadius: 8, border: `1px solid ${palette.SOFT_ORANGE}` }}
          >
            <option value="">Seleccionar tipo</option>
            <option value="combo">Combo</option>
            <option value="porcion">Porción</option>
            <option value="individual">Individual</option>
          </select>
        </div>
        <div className="col-md-2">
          <label className="mb-1 fw-semibold" style={{ color: palette.SOFT_BROWN }}>{iconImage()} Imagen</label>
          <input
            className="form-control"
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            style={{ borderRadius: 8, border: `1px solid ${palette.SOFT_ORANGE}` }}
          />
          {form.image_url && !imageFile && (
            <div className="mt-1" style={{ fontSize: 13 }}>
              <span className="badge bg-warning text-dark">Imagen actual</span>
              <a href={form.image_url.startsWith('/') ? `http://localhost:4000${form.image_url}` : form.image_url} 
                 target="_blank" rel="noreferrer" style={{ marginLeft: 6 }}>
                Ver imagen
              </a>
            </div>
          )}
        </div>
        <div className="col-md-2">
          <label className="mb-1 fw-semibold" style={{ color: palette.SOFT_BROWN }}>{iconStatus()} Estado</label>
          <select
            className="form-select"
            value={form.estado}
            onChange={e => setForm({ ...form, estado: e.target.value })}
            style={{ borderRadius: 8, border: `1px solid ${palette.SOFT_ORANGE}` }}
          >
            <option value="disponible">Disponible</option>
            <option value="agotado">Agotado</option>
            <option value="temporalmente no disponible">Temporalmente no disponible</option>
          </select>
        </div>
        <div className="col-md-2">
          <label className="mb-1 fw-semibold" style={{ color: palette.SOFT_BROWN }}>{iconStock()} Stock</label>
          <input
            className="form-control"
            placeholder="Stock"
            type="number"
            min="0"
            value={form.stock}
            // Permitir borrar con backspace y dejar vacío
            onChange={e => {
              const val = e.target.value;
              // Permitir campo vacío, o valor >= 0
              if (val === '' || /^[0-9]+$/.test(val)) {
                setForm({ ...form, stock: val });
              }
            }}
            style={{ borderRadius: 8, border: `1px solid ${palette.SOFT_ORANGE}` }}
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
          />
        </div>
        <div className="col-md-2 d-flex gap-1">
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
            <i className={`bi ${editMode ? 'bi-arrow-repeat' : 'bi-plus-circle'}`}></i>
            {editMode ? 'Actualizar' : 'Agregar'}
          </button>
          {editMode && (
            <button
              type="button"
              className="btn btn-secondary d-flex align-items-center gap-1"
              style={{ borderRadius: 8 }}
              onClick={() => {
                setForm({
                  name: '',
                  description: '',
                  price: '',
                  type: 'combo',
                  available: true,
                  image_url: '',
                  estado: 'disponible',
                  stock: ''
                });
                setImageFile(null);
                setEditMode(false);
                setEditingId(null);
              }}
            >
              <i className="bi bi-x-circle"></i> Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Efecto visual de producto agregado */}
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
          ¡Producto agregado con éxito!
        </div>
      )}

      <div className="row mt-4">
        {products.map(p => (
          <div className="col-md-4 mb-3" key={p.id}>
            <div 
              className="card h-100 shadow"
              style={{
                border: `2px solid ${p.estado === 'agotado' ? palette.SOFT_PINK : palette.SOFT_ORANGE}`,
                borderRadius: 16,
                background: palette.SOFT_GRAY
              }}
            >
              <div className="card-header d-flex align-items-center gap-2" style={{
                background: p.estado === 'agotado'
                  ? palette.SOFT_PINK
                  : p.estado === 'disponible'
                  ? palette.SOFT_ORANGE
                  : "#ffd54f",
                color: palette.SOFT_BROWN,
                borderRadius: "14px 14px 0 0",
                fontWeight: "bold"
              }}>
                {iconProduct()} {p.name}
              </div>
              <div className="card-body">
                {p.image_url && (
                  <img
                    src={p.image_url.startsWith('/') ? `http://localhost:4000${p.image_url}` : p.image_url}
                    alt={p.name}
                    style={{
                      width: '100%',
                      maxHeight: 140,
                      objectFit: 'contain',
                      borderRadius: 10,
                      marginBottom: 8,
                      background: palette.SOFT_YELLOW
                    }}
                  />
                )}
                <div className="mb-1">
                  <span className="badge bg-warning text-dark">{iconType()}{p.type}</span>
                  <span className={`badge ms-2 ${p.estado === 'agotado' ? 'bg-danger' : 'bg-success'}`}>
                    {iconStatus()}{p.estado}
                  </span>
                </div>
                <p className="mb-1">{iconPrice()} <strong>Precio:</strong> Bs. {p.price}</p>
                <p className="mb-1">{iconStock()} <strong>Stock:</strong> {p.stock}</p>
                <p className="mb-1 d-flex align-items-center" style={{ fontSize: 14, color: palette.SOFT_BROWN }}>{iconDescription()}{p.description}</p>
                <div className="d-flex gap-2 mt-2 justify-content-center">
                  <button className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1" onClick={() => handleEdit(p)}>
                    <i className="bi bi-pencil"></i> Editar
                  </button>
                  <button className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1" onClick={() => handleDelete(p.id)}>
                    <i className="bi bi-trash"></i> Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="text-center text-muted mt-4">
            No hay productos registrados aún.
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductManager;