// AnimatedMenuTitle.jsx
// Efecto de subrayado animado mostaza para "NUESTRO MENÚ"

export default function AnimatedMenuTitle({ children }) {
  return (
    <div className="inline-block relative group">
      <h2
        className="text-4xl font-logo text-center mb-6 tracking-wide"
        style={{
          color: "#E63946",
          textShadow: "1px 2px 8px rgba(0,0,0,0.14)",
          fontFamily: "'Bebas Neue', sans-serif",
          letterSpacing: 2,
          transition: "color 0.2s",
        }}
      >
        {children}
      </h2>
      {/* Subrayado animado */}
      <span
        className="
          block absolute left-1/2 bottom-0 h-2
          bg-[#FFD166] rounded-xl
          w-1/3
          transition-all duration-300
          group-hover:w-5/6
        "
        style={{
          transform: "translateX(-50%)",
          zIndex: 0,
        }}
      ></span>
    </div>
  );
}