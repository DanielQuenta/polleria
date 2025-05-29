import React from "react";
const palette = {
  WHITE: "#FFFFFF",
  RED: "#E63946",
  YELLOW: "#FFD60A",
  BEIGE: "#F7F4E9",
  DARK_TEXT: "#2B2B2B",
};

export default function ProductCard({ product, type, handleAddToCart, onPauseCarousel }) {
  let cardBg = palette.WHITE;
  let cardText = palette.DARK_TEXT;
  if (type === "individual") {
    cardBg = palette.RED;
    cardText = palette.WHITE;
  }
  if (type === "porcion") {
    cardBg = palette.YELLOW;
    cardText = palette.DARK_TEXT;
  }
  if (type === "combo") {
    cardBg = palette.BEIGE;
    cardText = palette.DARK_TEXT;
  }

  return (
    <div
      className="shadow-xl transition-transform hover:scale-105"
      style={{
        borderRadius: "36px",
        background: cardBg,
        color: cardText,
        border: `3px solid #fde4a1`,
        width: 340,
        minWidth: 340,
        minHeight: 440,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: 10,
        cursor: "pointer",
      }}
      onClick={onPauseCarousel}
    >
      <div
        className="overflow-hidden rounded-2xl w-full relative"
        style={{
          borderRadius: "36px 36px 0 0",
          overflow: "hidden",
          boxShadow: "0 5px 20px 0 #e6394622",
          background: "#F8F8F8",
          minHeight: 200,
          maxHeight: 250,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {product.image_url && (
          <img
            src={
              product.image_url.startsWith("/")
                ? `http://localhost:4000${product.image_url}`
                : product.image_url
            }
            alt={product.name}
            className="hover:scale-110 transition-transform duration-500 w-full"
            style={{
              maxHeight: 240,
              objectFit: "cover",
              borderRadius: "36px 36px 0 0",
            }}
          />
        )}
      </div>
      <div className="w-full flex-1 flex flex-col p-4">
        <h4 className="text-2xl font-bold mb-1">{product.name}</h4>
        <div className="mb-2">
          <span className="inline-block bg-yellow-200 text-yellow-900 text-xs font-semibold rounded px-2 py-1 mr-2">
            {product.type}
          </span>
          <span className="inline-block bg-green-200 text-green-800 text-xs font-semibold rounded px-2 py-1">
            Disponible
          </span>
        </div>
        <p className="text-base font-semibold mb-1">Bs. {product.price}</p>
        <p className="text-sm mb-2 flex-1">{product.description}</p>
        <span className="text-xs" style={{ opacity: 0.7 }}>
          Stock: {product.stock}
        </span>
        <button
          className="mt-4 px-4 py-2 rounded-xl font-bold shadow hover:scale-105 transition-transform"
          style={{
            fontFamily: "Poppins, sans-serif",
            letterSpacing: 1,
            background: type === "individual" ? palette.WHITE : palette.RED,
            color: type === "individual" ? palette.RED : palette.WHITE,
            border: "none",
          }}
          onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
        >
          Agregar
        </button>
      </div>
    </div>
  );
}