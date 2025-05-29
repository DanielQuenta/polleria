import React, { useEffect, useState } from "react";
import AnimatedUnderlineCenterExpand from "./AnimatedUnderlineCenterExpand";
import CarouselSection from "./CarouselSection";
import CartModal from "./CartModal";
import { buildWhatsappMessage } from "../utils/cartHelpers";
import "../utils/menuAnimations.css";

const WHATSAPP_NUMBER = "59169536433"; // Cambia por tu número

export default function ProductsMenu() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);
  const [pendingQty, setPendingQty] = useState(1);
  const [stockError, setStockError] = useState("");
  const [isOverSection, setIsOverSection] = useState(false);

  useEffect(() => {
    fetch("http://localhost:4000/api/products")
      .then(r => r.json())
      .then(data =>
        setProducts(data.filter(p => p.estado === "disponible" || p.estado === true))
      );
  }, []);

  const productsByType = {
    individual: products.filter((p) => p.type === "individual"),
    porcion: products.filter((p) => p.type === "porcion"),
    combo: products.filter((p) => p.type === "combo"),
  };

  // Carrito handlers
  const handleAddToCart = (product) => {
    setPendingProduct(product);
    setPendingQty(1);
    setStockError("");
    setShowPopup(true);
  };

  const confirmAdd = () => {
    if (!pendingProduct) return;

    // Chequeo de stock: contar en carrito + nuevo pedido
    const enCarrito = cart.find((p) => p.id === pendingProduct.id);
    const actualEnCarrito = enCarrito ? enCarrito.qty : 0;
    if (actualEnCarrito + pendingQty > pendingProduct.stock) {
      setStockError("¡No hay suficiente stock disponible!");
      return;
    }

    setCart((prev) => {
      const found = prev.find((p) => p.id === pendingProduct.id);
      if (found) {
        return prev.map((p) =>
          p.id === pendingProduct.id ? { ...p, qty: p.qty + pendingQty } : p
        );
      }
      return [...prev, { ...pendingProduct, qty: pendingQty }];
    });
    setShowPopup(false);
    setPendingProduct(null);
    setPendingQty(1);
    setStockError("");
  };

  const finalizeOrder = () => {
    if (!pendingProduct) return;

    // Chequeo de stock: contar en carrito + nuevo pedido
    const enCarrito = cart.find((p) => p.id === pendingProduct.id);
    const actualEnCarrito = enCarrito ? enCarrito.qty : 0;
    if (actualEnCarrito + pendingQty > pendingProduct.stock) {
      setStockError("¡No hay suficiente stock disponible!");
      return;
    }

    confirmAdd();
    setTimeout(() => {
      const msg = buildWhatsappMessage(
        cart.concat([{ ...pendingProduct, qty: pendingQty }])
      );
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
      setCart([]);
    }, 200);
  };

  // Permite aumentar/cambiar cantidad en el popup
  const handleQtyChange = (delta) => {
    if (!pendingProduct) return;
    const enCarrito = cart.find((p) => p.id === pendingProduct.id);
    const actualEnCarrito = enCarrito ? enCarrito.qty : 0;
    const nuevoValor = pendingQty + delta;
    if (nuevoValor < 1) return;
    if (nuevoValor + actualEnCarrito > pendingProduct.stock) {
      setStockError("¡No hay suficiente stock disponible!");
      return;
    }
    setPendingQty(nuevoValor);
    setStockError("");
  };

  // Permitir editar cantidad desde el carrito y controlar stock
  const updateCartQty = (id, qty) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    if (qty < 1) return;
    if (qty > product.stock) {
      alert("¡No hay suficiente stock disponible!");
      return;
    }
    setCart((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, qty } : p
      )
    );
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((p) => p.id !== id));
  const clearCart = () => setCart([]);
  const openCart = () => setShowCart(true);
  const closeCart = () => setShowCart(false);
  const sendCartToWhatsapp = () => {
    const msg = buildWhatsappMessage(cart);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
    setCart([]);
    setShowCart(false);
  };

  // Estilos para botones principales (Lo quiero/Agregar)
  const mainButtonClass =
    "bg-gradient-to-r from-[#FFD166] via-[#FFB347] to-[#E63946] text-[#1d3557] font-bold px-5 py-2 rounded-full shadow hover:scale-105 transition-transform border-2 border-[#FFD166] drop-shadow-lg";
  // Estilos para el botón de carrito flotante
  const cartButtonClass =
    "fixed bottom-6 right-6 z-50 px-5 py-3 bg-gradient-to-r from-[#E63946] via-[#FFB347] to-[#FFD166] text-[#1d3557] font-bold rounded-full shadow-2xl flex items-center gap-2 transition-transform hover:scale-105 border-2 border-[#FFD166] drop-shadow-lg";

  // Estilos para el fondo de la sección
  const sectionBg = { background: "#F7F4E9" };

  return (
    <section className="py-10 px-4 min-h-screen" style={sectionBg}>
      {/* Botón carrito flotante */}
      {cart.length > 0 && (
        <button
          onClick={openCart}
          className={cartButtonClass}
          style={{ fontFamily: "Poppins, sans-serif", letterSpacing: 1 }}
        >
          🛒 Ver pedido ({cart.reduce((a, b) => a + b.qty, 0)})
        </button>
      )}

      {/* Modal resumen carrito */}
      <CartModal
        showCart={showCart}
        cart={cart}
        closeCart={closeCart}
        clearCart={clearCart}
        sendCartToWhatsapp={sendCartToWhatsapp}
        removeFromCart={removeFromCart}
        updateCartQty={updateCartQty}
        buttonClass={mainButtonClass}
      />

      {/* Popup para agregar producto y preguntar acción */}
      {showPopup && pendingProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-lg max-w-xs w-full text-center">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
              ¿Agregar {pendingProduct.name} al pedido?
            </h2>
            <p className="mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>Precio: Bs. {pendingProduct.price}</p>
            <p className="mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>Stock: {pendingProduct.stock}</p>
            <div className="flex items-center justify-center gap-2 mb-4">
              <button
                onClick={() => handleQtyChange(-1)}
                className="bg-[#FFD166] text-[#E63946] rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold hover:scale-110 transition-transform"
                aria-label="Disminuir cantidad"
                type="button"
              >-</button>
              <span className="text-lg font-bold px-2">{pendingQty}</span>
              <button
                onClick={() => handleQtyChange(1)}
                className="bg-[#FFD166] text-[#E63946] rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold hover:scale-110 transition-transform"
                aria-label="Aumentar cantidad"
                type="button"
              >+</button>
            </div>
            {stockError && (
              <div className="text-[#E63946] font-semibold mb-2">{stockError}</div>
            )}
            <div className="flex gap-2 justify-center">
              <button
                onClick={confirmAdd}
                className={mainButtonClass}
                style={{ fontFamily: "Poppins, sans-serif", letterSpacing: 1 }}
              >
                Agregar y seguir
              </button>
              <button
                onClick={finalizeOrder}
                className="bg-[#1d3557] hover:bg-[#E63946] text-[#FFD166] font-bold px-5 py-2 rounded-full shadow hover:scale-105 transition-transform border-2 border-[#FFD166] drop-shadow-lg"
                style={{ fontFamily: "Poppins, sans-serif", letterSpacing: 1 }}
              >
                Finalizar pedido
              </button>
              <button
                onClick={() => setShowPopup(false)}
                className="bg-gray-200 hover:bg-gray-300 text-[#E63946] font-bold px-5 py-2 rounded-full shadow hover:scale-105 transition-transform border-2 border-gray-300 drop-shadow"
                style={{ fontFamily: "Poppins, sans-serif", letterSpacing: 1 }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Título principal MENÚ con subrayado expansivo centrado */}
      <div className="inline-block relative w-full text-center mb-10" style={{ minHeight: 48 }}>
        <h2
          className="text-4xl font-logo tracking-wide inline-block"
          style={{
            color: "#E63946",
            textShadow: "1px 2px 8px rgba(0,0,0,0.14)",
            fontFamily: "'Bebas Neue', sans-serif",
            letterSpacing: 2,
            marginBottom: 0,
          }}
        >
          NUESTRO MENÚ
        </h2>
        <AnimatedUnderlineCenterExpand animate={isOverSection} />
      </div>

      <div className="space-y-14">
        {/* Secciones con carrusel usando anchors para navegación por header */}
        <section id="individual">
          <CarouselSection
            type="individual"
            products={productsByType.individual}
            handleAddToCart={handleAddToCart}
            isOverSection={isOverSection}
            setIsOverSection={setIsOverSection}
            buttonClass={mainButtonClass}
          />
        </section>
        <section id="porcion">
          <CarouselSection
            type="porcion"
            products={productsByType.porcion}
            handleAddToCart={handleAddToCart}
            isOverSection={isOverSection}
            setIsOverSection={setIsOverSection}
            buttonClass={mainButtonClass}
          />
        </section>
        <section id="combos">
          <CarouselSection
            type="combo"
            products={productsByType.combo}
            handleAddToCart={handleAddToCart}
            isOverSection={isOverSection}
            setIsOverSection={setIsOverSection}
            buttonClass={mainButtonClass}
          />
        </section>
        <section id="pedidos">
          {/* Aquí puedes poner tu sección de pedidos/contacto */}
        </section>
      </div>
      <div className="inline-block relative w-full text-center mt-14 mb-1" style={{ minHeight: 16 }}>
        <AnimatedUnderlineCenterExpand animate={isOverSection} />
      </div>
    </section>
  );
}