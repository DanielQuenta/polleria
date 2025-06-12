import React from 'react';

function ProductCard({ product, onAdd }) {
  return (
    <div className="card h-100 shadow-sm" style={{ borderRadius: 14, border: "2px solid #FFD166", background: "#fffbe8" }}>
      <img
        src={product.image_url}
        alt={product.name}
        style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: "12px 12px 0 0" }}
        onError={e => { e.target.style.display = "none"; }}
      />
      <div className="card-body d-flex flex-column align-items-center justify-content-between">
        <h5 className="card-title text-center">{product.name}</h5>
        <div className="fw-bold mb-2" style={{ color: "#b35012", fontSize: 18 }}>Bs. {product.price}</div>
        <button className="btn btn-warning fw-bold" onClick={() => onAdd(product)}>
          <i className="bi bi-plus-circle"></i> Agregar
        </button>
      </div>
    </div>
  );
}

export default ProductCard;