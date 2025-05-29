import { useEffect } from "react";

// Carrusel horizontal infinito y suave usando scrollLeft
export default function useCarousel(ref, products, paused = false) {
  useEffect(() => {
    if (!ref.current || products.length <= 4 || paused) return;
    const el = ref.current;
    let reqId;
    let running = true;
    let acc = 0;

    function step() {
      if (!running) return;
      // Si estamos al final, reinicia para el efecto infinito
      if (el.scrollLeft + el.offsetWidth + 1 >= el.scrollWidth) {
        el.scrollLeft = 0;
      } else {
        acc += 0.5; // Velocidad de scroll (ajusta este valor para más lento/rápido)
        if (acc >= 1) {
          el.scrollLeft += Math.floor(acc);
          acc -= Math.floor(acc);
        }
      }
      reqId = requestAnimationFrame(step);
    }
    step();

    return () => {
      running = false;
      if (reqId) cancelAnimationFrame(reqId);
    };
  }, [ref, products, paused]);
}