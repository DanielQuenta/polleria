import React, { useEffect, useRef, useState } from "react";
import useCarousel from "../utils/Carousel";

const cardStyles = {
  individual: { bg: "#E63946", text: "#fff" },
  porcion: { bg: "#FFD60A", text: "#2B2B2B" },
  combo: { bg: "#F7F4E9", text: "#2B2B2B" }
};

// Estilos para los botones del carrusel, acorde a tu branding
const carouselButtonStyle = {
  background: "linear-gradient(135deg, #E63946 60%, #FFD60A 100%)",
  color: "#fff",
  border: "none",
  borderRadius: "50%",
  width: 44,
  height: 44,
  cursor: "pointer",
  fontSize: 26,
  boxShadow: "0 4px 16px #0002",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "transform 0.17s cubic-bezier(.65,1.5,.66,1.2), box-shadow 0.18s",
  outline: "none",
};

const carouselButtonHover = {
  transform: "scale(1.08) rotate(-6deg)",
  boxShadow: "0 8px 28px #E6394688",
  background: "linear-gradient(135deg, #FFD60A 60%, #E63946 100%)",
};

export default function CarouselSection({
  type,
  products = [],
  handleAddToCart,
  isOverSection,
  setIsOverSection
}) {
  const visibleCount = 4;
  const total = products.length;
  const carouselRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dragStartX, setDragStartX] = useState(null);
  const [dragStartScroll, setDragStartScroll] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [leftHover, setLeftHover] = useState(false);
  const [rightHover, setRightHover] = useState(false);

  const displayProducts = total > visibleCount
    ? [...products, ...products.slice(0, visibleCount)]
    : products;

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  useCarousel(carouselRef, displayProducts, paused);

  useEffect(() => {
    if (!carouselRef.current || total <= visibleCount) return;
    const el = carouselRef.current;
    let lastScrollLeft = 0;
    const cardWidth = el.offsetWidth / visibleCount;

    const onScroll = () => {
      if (el.scrollLeft >= cardWidth * total) {
        el.style.scrollBehavior = "auto";
        el.scrollLeft = 0;
        el.style.scrollBehavior = "smooth";
      } else if (el.scrollLeft <= 0 && lastScrollLeft > el.scrollLeft) {
        el.style.scrollBehavior = "auto";
        el.scrollLeft = cardWidth * total;
        el.style.scrollBehavior = "smooth";
      }
      lastScrollLeft = el.scrollLeft;
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [carouselRef, total, visibleCount]);

  // Drag/Swipe para touch y mouse
  const touchData = useRef({ startX: 0, startScroll: 0, moved: false });

  const handleDragStart = (e) => {
    setPaused(true);
    setIsDragging(true);
    if (e.type === "touchstart") {
      touchData.current.startX = e.touches[0].clientX;
      touchData.current.startScroll = carouselRef.current.scrollLeft;
      touchData.current.moved = false;
    } else {
      setDragStartX(e.clientX);
      setDragStartScroll(carouselRef.current.scrollLeft);
    }
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    if (e.type === "touchmove") {
      const currentX = e.touches[0].clientX;
      const diff = touchData.current.startX - currentX;
      if (Math.abs(diff) > 5) touchData.current.moved = true;
      carouselRef.current.scrollLeft = touchData.current.startScroll + diff;
    } else {
      const currentX = e.clientX;
      const diff = dragStartX - currentX;
      carouselRef.current.scrollLeft = dragStartScroll + diff;
    }
  };

  const handleDragEnd = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    const el = carouselRef.current;
    const cardWidth = el.offsetWidth / visibleCount;
    let moved = false;
    if (e && e.type && e.type.startsWith("touch")) {
      moved = touchData.current.moved;
    }
    if (moved || !e || !e.type || !e.type.startsWith("touch")) {
      const nearest = Math.round(el.scrollLeft / cardWidth);
      el.style.scrollBehavior = "smooth";
      el.scrollLeft = nearest * cardWidth;
    }
  };

  // Botones manuales
  const moveLeft = () => {
    setPaused(true);
    const el = carouselRef.current;
    const cardWidth = el.offsetWidth / visibleCount;
    if (el.scrollLeft <= 0 && total > visibleCount) {
      el.style.scrollBehavior = "auto";
      el.scrollLeft = cardWidth * total;
      el.style.scrollBehavior = "smooth";
    }
    el.scrollLeft -= cardWidth;
  };

  const moveRight = () => {
    setPaused(true);
    const el = carouselRef.current;
    const cardWidth = el.offsetWidth / visibleCount;
    el.scrollLeft += cardWidth;
  };

  const [lastSelected, setLastSelected] = useState(null);
  const handleProductClick = (p) => {
    if (lastSelected && lastSelected === p.id && paused) {
      setPaused(false);
      setLastSelected(null);
    } else {
      setPaused(true);
      setLastSelected(p.id);
    }
  };

  const handleAdd = (p, e) => {
    e.stopPropagation();
    setPaused(true);
    setLastSelected(p.id);
    handleAddToCart(p);
  };

  const juicyTitles = {
    individual: "¡Cómeme YA!",
    porcion: "¡Porciones irresistibles!",
    combo: "¡Combos para compartir!"
  };

  return (
    <div
      className="w-full"
      onMouseEnter={() => setIsOverSection(true)}
      onMouseLeave={() => setIsOverSection(false)}
      style={{ overflowX: "hidden" }}
    >
      <h3
        className="drip-text text-3xl font-logo mb-8 text-center"
        style={{
          color: cardStyles[type].text,
          background: cardStyles[type].bg,
          borderRadius: 16,
          padding: "16px 0",
          margin: "0 auto",
          maxWidth: 400,
          display: "inline-block",
          letterSpacing: 2,
          fontFamily: "Bebas Neue, Poppins, sans-serif",
          boxShadow: "0 8px 32px 0 #00000010",
          filter: "brightness(1.05) saturate(1.2)",
        }}
      >
        {juicyTitles[type]}
      </h3>
      <div className="relative flex flex-col items-center">
        {/* Botones ahora encima del carrusel */}
        {total > visibleCount && (
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: 18,
            position: "absolute",
            top: -36,
            left: 0,
            right: 0,
            zIndex: 3,
            pointerEvents: "none"
          }}>
            <button
              aria-label="Izquierda"
              onClick={moveLeft}
              style={{
                ...carouselButtonStyle,
                ...(leftHover ? carouselButtonHover : {}),
                transform: leftHover ? carouselButtonHover.transform : undefined,
                marginRight: 8,
                pointerEvents: "auto",
                fontFamily: "Bebas Neue, Poppins, sans-serif",
              }}
              onMouseEnter={() => setLeftHover(true)}
              onMouseLeave={() => setLeftHover(false)}
            >
              {"‹"}
            </button>
            <button
              aria-label="Derecha"
              onClick={moveRight}
              style={{
                ...carouselButtonStyle,
                ...(rightHover ? carouselButtonHover : {}),
                transform: rightHover ? carouselButtonHover.transform : undefined,
                marginLeft: 8,
                pointerEvents: "auto",
                fontFamily: "Bebas Neue, Poppins, sans-serif",
              }}
              onMouseEnter={() => setRightHover(true)}
              onMouseLeave={() => setRightHover(false)}
            >
              {"›"}
            </button>
          </div>
        )}
        <div
          ref={carouselRef}
          className="flex gap-7 py-2 select-none"
          style={{
            scrollBehavior: isDragging ? "auto" : "smooth",
            cursor: isDragging ? "grabbing" : total > visibleCount ? "grab" : "default",
            width: "100%",
            userSelect: "none",
            overflow: "hidden",
            touchAction: "pan-y",
            marginTop: total > visibleCount ? 40 : 0,
          }}
          tabIndex={0}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          {displayProducts.length === 0 ? (
            <div className="text-center text-gray-500 text-lg py-8 w-full">
              No hay productos en esta sección.
            </div>
          ) : (
            displayProducts.map((p, idx) => (
              <div
                key={p.id + "-" + idx}
                className="shadow-lg hover:scale-105 transition cursor-pointer"
                style={{
                  width: `calc(100% / ${visibleCount})`,
                  minWidth: 0,
                  flex: `0 0 calc(100% / ${visibleCount})`,
                  maxWidth: `calc(100% / ${visibleCount})`,
                  minHeight: 350,
                  marginBottom: 10,
                  background: cardStyles[type].bg,
                  color: cardStyles[type].text,
                  borderRadius: "20px",
                  boxShadow: "0 6px 24px #0002",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  animation: mounted
                    ? (type === "individual"
                        ? `${idx % 2 === 0 ? "card-slide-in-left" : "card-slide-in-right"} 0.75s ${0.08 * idx
                          }s cubic-bezier(.6,.2,.3,1) both`
                        : type === "porcion"
                        ? `card-slide-in-bottom 0.75s ${0.08 * idx
                          }s cubic-bezier(.6,.2,.3,1) both`
                        : `card-fade-pop 0.8s ${0.08 * idx
                          }s cubic-bezier(.6,.2,.3,1) both`)
                    : undefined,
                }}
                onClick={() => handleProductClick(p)}
              >
                <div
                  className="overflow-hidden w-full"
                  style={{
                    borderRadius: "16px 16px 0 0",
                    background: "#fff",
                    marginBottom: 8,
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 130,
                    maxHeight: 170,
                    boxShadow: "0 2px 8px #FFD60A44",
                  }}
                >
                  {p.image_url && (
                    <img
                      src={
                        p.image_url.startsWith("/")
                          ? `http://localhost:4000${p.image_url}`
                          : p.image_url
                      }
                      alt={p.name}
                      className="rounded-md mb-2 shadow-md hover:scale-110 transition-transform w-full max-h-[150px] object-cover cursor-pointer"
                      style={{
                        borderRadius: "18px 18px 32px 10px/20px 20px 30px 10px",
                        border: "3px solid #fff",
                        boxShadow: "0 6px 24px #FFD60A33, 0 16px 42px #E6394620",
                      }}
                    />
                  )}
                </div>
                <div className="w-full flex-1 flex flex-col p-4">
                  <h4
                    className="text-lg font-bold mb-1"
                    style={{
                      color: cardStyles[type].text,
                      fontFamily: "Poppins, sans-serif",
                    }}
                  >
                    {p.name}
                  </h4>
                  <div className="mb-2">
                    <span
                      className="inline-block text-xs font-semibold rounded px-2 py-1 mr-2"
                      style={{
                        background: "#fff2",
                        color: cardStyles[type].text,
                      }}
                    >
                      {p.type}
                    </span>
                    <span className="inline-block bg-green-200 text-green-800 text-xs font-semibold rounded px-2 py-1">
                      Disponible
                    </span>
                  </div>
                  <p
                    className="text-base font-semibold mb-1"
                    style={{ color: cardStyles[type].text }}
                  >
                    Bs. {p.price}
                  </p>
                  <p
                    className="text-sm mb-2 flex-1"
                    style={{ color: cardStyles[type].text }}
                  >
                    {p.description}
                  </p>
                  <span
                    className="text-xs"
                    style={{ color: cardStyles[type].text }}
                  >
                    Stock: {p.stock}
                  </span>
                  <button
                    className={
                      type === "porcion"
                        ? "mt-4 px-4 py-2 rounded-xl font-bold shadow bg-yellow-500 hover:bg-yellow-600 active:scale-95 transition-all duration-150 text-[#2B2B2B]"
                        : "mt-4 px-4 py-2 rounded-xl font-bold shadow bg-[#e63946] text-white transition-transform hover:scale-105"
                    }
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      letterSpacing: 1,
                      background:
                        type === "porcion"
                          ? "#FFD60A"
                          : type === "combo"
                          ? "#F7F4E9"
                          : "#E63946",
                      color: type === "combo" ? "#2B2B2B" : "#fff",
                      border: "none",
                      transition: "transform .18s",
                    }}
                    onClick={e => handleAdd(p, e)}
                  >
                    {type === "porcion" ? "¡Lo quiero!" : "Agregar"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Sticker rotado con el slogan */}
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 22,
            transform: "rotate(-5deg)",
            background: "linear-gradient(115deg, #FFD60A 70%, #E63946 100%)",
            color: "#E63946",
            fontFamily: "Bebas Neue, Poppins, sans-serif",
            fontWeight: "bold",
            fontSize: 18,
            boxShadow: "0 4px 16px #FFD60A44",
            padding: "7px 22px",
            borderRadius: 16,
            letterSpacing: 1.5,
            zIndex: 10,
            userSelect: "none"
          }}
        >
          ¡Sabor que conquista!
        </div>
      </div>
    </div>
  );
}