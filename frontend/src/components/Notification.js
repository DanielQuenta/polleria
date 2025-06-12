import React from 'react';

function Notification({ message, type = "success" }) {
  const color = type === "success" ? "#28a745" : "#dc3545";
  return (
    <div
      style={{
        position: "fixed",
        top: 80,
        right: 40,
        zIndex: 9999,
        background: "#fff",
        border: `3px solid ${color}`,
        color: color,
        padding: "1.3rem 2.2rem",
        borderRadius: "1.3rem",
        fontWeight: "bold",
        fontSize: "1.35rem",
        boxShadow: "0 4px 32px rgba(0,0,0,0.20)",
        transition: "all 0.3s",
        display: "flex",
        alignItems: "center",
        gap: "1rem"
      }}
    >
      {type === "success" ? (
        <span style={{ fontSize: "1.6rem" }}>✅</span>
      ) : (
        <span style={{ fontSize: "1.6rem" }}>⚠️</span>
      )}
      {message}
    </div>
  );
}

export default Notification;