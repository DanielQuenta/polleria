import React from 'react';

function OrderSummary({ items, products, onRemove, onChangeQty }) {
  const getProduct = id => products.find(p => String(p.id) === String(id));
  const total = items.reduce((sum, item) => sum + Number(item.price_at_order || 0), 0);

  return (
    <div className="card" style={{ borderRadius: 14, background: "#d7f9e5", border: "2px solid #FFD166" }}>
      <div className="card-body">
        <h5 className="card-title mb-3">Resumen del pedido</h5>
        {items.length === 0 && <div className="text-muted">No hay productos agregados.</div>}
        {items.map((item, idx) => {
          const prod = getProduct(item.product_id);
          return (
            <div key={idx} className="d-flex align-items-center mb-2" style={{ borderBottom: "1px dashed #b35012" }}>
              <span className="fw-bold flex-grow-1">
                {prod?.name || "Producto"} x {item.quantity} = Bs. {item.price_at_order}
              </span>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={e => onChangeQty(idx, e.target.value)}
                style={{ width: 50, marginRight: 6, borderRadius: 6, border: "1px solid #FFD166" }}
              />
              <button className="btn btn-sm btn-outline-danger" onClick={() => onRemove(idx)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          );
        })}
        <div className="fw-bold mt-3 fs-5 text-end">
          Total: Bs. {total.toFixed(2)}
        </div>
      </div>
    </div>
  );
}

export default OrderSummary;