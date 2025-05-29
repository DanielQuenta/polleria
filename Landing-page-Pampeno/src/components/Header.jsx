import React from "react";
import logo from "../assets/logo.png";

/*
  Cambios:
  - El título "Pollos Pampeño" tiene un efecto mejorado: un "flash" más vibrante y un sutil pop/zoom (escala) al aparecer.
  - El slogan "Rico hasta el coto!.." sigue apareciendo letra por letra con efecto flash.
  - Logo y título SIEMPRE perfectamente centrados.
  - Asegúrate de tener la fuente signature (p.ej. Great Vibes) importada en tu HTML/CSS.
*/

const slogan = "Rico hasta el coto!..";

const SloganFlash = () => (
  <div className="w-full flex items-center justify-center md:justify-start md:pl-1 pb-2 md:pb-0 select-none">
    {slogan.split("").map((char, idx) => (
      <span
        key={idx}
        className="signature-font text-xl md:text-2xl lg:text-3xl"
        style={{
          color: "#fff",
          textShadow: "0 1px 8px #e6394677, 0 2px 2px #FFD16655",
          letterSpacing: "0.03em",
          animation: `flash-once 0.5s ${0.45 + 0.045 * idx}s both`,
          display: "inline-block",
          minWidth: char === " " ? "0.6em" : undefined,
          fontFamily: "'Great Vibes', 'Dancing Script', 'Pacifico', cursive",
        }}
      >
        {char}
      </span>
    ))}
  </div>
);

const Header = () => (
  <header
    className="
      bg-gradient-to-r from-[#E63946] via-[#FFB347] to-[#FFD166]
      shadow-lg transition-shadow duration-500 hover:shadow-2xl
      animate-slide-down
      z-30
      mb-3
    "
    style={{
      animation: "slide-down 0.85s cubic-bezier(.73,.17,.24,1.14) 0s both"
    }}
  >
    <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between">
      {/* Slogan a la izquierda en desktop, arriba en mobile */}
      <div className="w-full md:w-auto md:flex-1 flex flex-col md:block">
        <SloganFlash />
      </div>
      {/* Logo y título centrados siempre */}
      <div className="w-full md:w-auto md:flex-1 flex flex-col items-center justify-center relative">
        <img
          src={logo}
          alt="Pollos Pampeño Logo"
          className="
            w-20 h-20 rounded-full border-4 border-white shadow-md
            hover:scale-105 transform transition-transform duration-300 bg-white object-cover
            animate-flash-once
          "
          style={{
            animation: "flash-once 0.68s 0.45s both"
          }}
        />
        <span
          className="
            text-2xl md:text-3xl font-extrabold text-white drop-shadow-lg mt-2 tracking-wide
            font-logo
            animate-title-flash-pop
          "
          style={{
            fontFamily: "'Bebas Neue', Poppins, sans-serif",
            animation: "title-flash-pop 0.9s 0.45s cubic-bezier(.68,1.9,.36,1.08) both"
          }}
        >
          Pollos Pampeño
        </span>
      </div>
      {/* Navegación */}
      <nav
        className="
          hidden md:flex gap-6 items-center text-right
          animate-flash-once
          md:justify-end md:flex-1
        "
        style={{
          animation: "flash-once 0.68s 0.45s both"
        }}
      >
        {/* Individual */}
        <a
          href="#individual"
          className="text-white hover:text-yellow-100 transition-colors duration-200 flex flex-col items-center group"
          title="Individual"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 mb-1 transition-transform duration-300 group-hover:scale-110"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <rect x="3" y="6" width="18" height="2" rx="1" />
            <rect x="3" y="11" width="18" height="2" rx="1" />
            <rect x="3" y="16" width="18" height="2" rx="1" />
          </svg>
          <span className="text-xs font-semibold">Individual</span>
        </a>
        {/* Porción */}
        <a
          href="#porcion"
          className="text-white hover:text-yellow-100 transition-colors duration-200 flex flex-col items-center group"
          title="Porción"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 mb-1 transition-transform duration-300 group-hover:scale-110"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M21 3C14.2 3 8.4 7.8 6.3 14.1c-.2.6.1 1.2.7 1.4.6.2 1.2-.1 1.4-.7C10.5 10 15.1 6.2 21 5.1V3z" />
            <circle cx="9.5" cy="12.5" r="1.5" />
            <circle cx="14.5" cy="9.5" r="1" />
          </svg>
          <span className="text-xs font-semibold">Porción</span>
        </a>
        {/* Combos */}
        <a
          href="#combos"
          className="text-white hover:text-yellow-100 transition-colors duration-200 flex flex-col items-center group"
          title="Combos"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 mb-1 transition-transform duration-300 group-hover:scale-110"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <circle cx="7.5" cy="16.5" r="2.5" />
            <circle cx="16.5" cy="16.5" r="2.5" />
            <rect x="3" y="7" width="18" height="6" rx="2" />
            <rect x="5" y="5" width="14" height="2" rx="1" />
          </svg>
          <span className="text-xs font-semibold">Combos</span>
        </a>
        {/* Pedidos/Delivery */}
        <a
          href="#pedidos"
          className="text-white hover:text-yellow-100 transition-colors duration-200 flex flex-col items-center group"
          title="Pedidos"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 mb-1 transition-transform duration-300 group-hover:scale-110"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M3 12v4a2 2 0 0 0 2 2h1" />
            <rect x="7" y="8" width="10" height="8" rx="2" fill="currentColor" stroke="none" />
            <circle cx="7.5" cy="18.5" r="1.5" />
            <circle cx="16.5" cy="18.5" r="1.5" />
            <path d="M21 16v-5a2 2 0 0 0-2-2h-3" />
          </svg>
          <span className="text-xs font-semibold">Pedidos</span>
        </a>
      </nav>
    </div>
    {/* Animaciones y fuente signature */}
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
      .signature-font {
        font-family: 'Great Vibes', 'Dancing Script', 'Pacifico', cursive !important;
      }
      @keyframes slide-down {
        0% {
          opacity: 0; transform: translateY(-64px) scaleY(.96) skewY(-3deg);
        }
        70% {
          opacity: 1; transform: translateY(8px) scaleY(1.04) skewY(-2deg);
        }
        100% {
          opacity: 1; transform: translateY(0) scaleY(1) skewY(0deg);
        }
      }
      @keyframes flash-once {
        0% {
          opacity: 0.5; filter: brightness(1.1) blur(1.5px);
        }
        40% {
          opacity: 1; filter: brightness(1.8) blur(.2px);
        }
        100% {
          opacity: 1; filter: brightness(1) blur(0);
        }
      }
      @keyframes title-flash-pop {
        0% {
          opacity: 0;
          filter: brightness(1.2) blur(3px);
          transform: scale(0.85) skewY(-5deg);
          letter-spacing: 0.05em;
        }
        30% {
          opacity: 1;
          filter: brightness(2.2) blur(0.5px);
          transform: scale(1.12) skewY(2deg);
          letter-spacing: 0.11em;
          text-shadow: 0 0 12px #FFD166, 0 0 24px #E63946;
        }
        80% {
          opacity: 1;
          filter: brightness(1.08);
          transform: scale(1.03) skewY(-1deg);
        }
        100% {
          opacity: 1;
          filter: brightness(1) blur(0);
          transform: scale(1) skewY(0deg);
          letter-spacing: 0.04em;
          text-shadow: 0 1px 12px #FFD16660, 0 0 10px #E6394630;
        }
      }
      .animate-slide-down { animation: slide-down 0.85s cubic-bezier(.73,.17,.24,1.14) 0s both; }
      .animate-flash-once { animation: flash-once 0.68s 0.45s both; }
      .animate-title-flash-pop { animation: title-flash-pop 0.9s 0.45s cubic-bezier(.68,1.9,.36,1.08) both; }
    `}</style>
  </header>
);

export default Header;