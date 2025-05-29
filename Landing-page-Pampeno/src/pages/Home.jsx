import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductsMenu from "../components/ProductsMenu"; // Importa el menú de productos

export default function Home() {
  return (
    <>
      <Header />
      <ProductsMenu /> {/* Aquí se muestra el menú debajo del header */}
      <Footer />
    </>
  );
}