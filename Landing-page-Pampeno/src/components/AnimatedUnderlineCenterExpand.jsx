import React, { useState, useEffect } from "react";

const underlineCenterExpandAnimation = `
@keyframes underline-center-expand-in {
  0% { width: 0; opacity: 1; }
  100% { width: 100%; opacity: 1; }
}
@keyframes underline-center-expand-out {
  0% { width: 100%; opacity: 1; }
  100% { width: 0; opacity: 1; }
}
`;

export default function AnimatedUnderlineCenterExpand({ animate }) {
  const [visible, setVisible] = useState(false);
  const [anim, setAnim] = useState("");
  useEffect(() => {
    if (animate) {
      setVisible(true);
      setAnim("in");
    } else if (visible) {
      setAnim("out");
      const timeout = setTimeout(() => setVisible(false), 380);
      return () => clearTimeout(timeout);
    }
  }, [animate]);
  if (!visible)
    return (
      <>
        <style>{underlineCenterExpandAnimation}</style>
      </>
    );
  return (
    <>
      <style>{underlineCenterExpandAnimation}</style>
      <span
        className={`
          block absolute left-1/2 bottom-[-8px] h-2
          bg-[#FFD166] rounded-xl pointer-events-none
        `}
        style={{
          minWidth: 80,
          maxWidth: 800,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 0,
          animation:
            anim === "in"
              ? "underline-center-expand-in 0.4s cubic-bezier(.4,0,.2,1) forwards"
              : "underline-center-expand-out 0.38s cubic-bezier(.4,0,.2,1) forwards",
          opacity: 1,
        }}
      ></span>
    </>
  );
}