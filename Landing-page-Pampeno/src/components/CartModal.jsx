import React from "react";

export default function CartModal({
  showCart,
  cart,
  closeCart,
  clearCart,
  sendCartToWhatsapp,
  removeFromCart,
}) {
  if (!showCart) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-[#e63946] tracking-wide">🛒 Tu pedido</h2>
        <div style={{ maxHeight: 220, overflowY: "auto" }}>
          {cart.map((item) => (
            <div className="flex items-center justify-between mb-2" key={item.id}>
              <span>
                <b>{item.name}</b> x{item.qty}
              </span>
              <span>Bs. {item.price * item.qty}</span>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 font-bold ml-2 hover:scale-110 transition-transform"
                title="Eliminar"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="mb-3 text-right">
          <b>Total: Bs. {cart.reduce((sum, item) => sum + item.price * item.qty, 0)}</b>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={sendCartToWhatsapp}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-bold text-white"
          >
            Enviar a WhatsApp
          </button>
          <button
            onClick={clearCart}
            className="bg-yellow-500 hover:bg-yellow-600 px-3 py-2 rounded font-bold text-white"
          >
            Vaciar
          </button>
          <button
            onClick={closeCart}
            className="bg-gray-300 px-3 py-2 rounded font-bold text-black"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}