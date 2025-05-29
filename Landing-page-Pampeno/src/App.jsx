import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
// Puedes agregar aquí más páginas si tienes

function App() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(to bottom, #F7F4E9, #FFFFFF)",
        color: "#6A4A3C",
      }}
    >
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Agrega aquí otras rutas si las necesitas */}
        </Routes>
      </Router>
    </div>
  );
}

export default App;