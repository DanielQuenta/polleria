import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, useParams } from 'react-router-dom';
import InvoiceManager from './InvoiceManager';
import Orders from './orders';
import Order_items from './order_items';
import Notification from './Notification';
import logo from '../assets/logo.png'; // Asegúrate que la ruta del logo sea correcta

const mainTheme = {
  GRADIENT: "linear-gradient(90deg, #E63946 0%, #FFB347 60%, #FFD166 100%)",
  CARD_BG: "rgba(255,255,255,0.93)",
  BTN_BG: "linear-gradient(90deg, #FFD166 0%, #FFB347 60%, #E63946 100%)",
  BTN_TEXT: "#b35012",
  BTN_BORDER: "#FFD166",
  SHADOW: "0 8px 40px 0 #FFD16680",
  BORDER: "#FFD166",
  TITLE: "#b35012",
  SUBTITLE: "#b35012",
  SIDEBAR_BG: "#FFFBE8",
  SIDEBAR_HEADER: "#FFB347",
  SIDEBAR_TEXT: "#b35012",
  LOGOUT_BG: "#f4f4f4",
  LOGOUT_TEXT: "#E63946",
};
const pastelTheme = {
  SOFT_YELLOW: "#fffbe8",
  SOFT_ORANGE: "#ffe4ba",
  SOFT_GREEN: "#d7f9e5",
  SOFT_BROWN: "#b37d53",
  SOFT_GRAY: "#f4f4f4",
  SOFT_RED: "#ffd8d8",
  TEXT_DANGER: "#c94a4a"
};

function Dashboard() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'main');
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleToggleTheme = () => setTheme(theme === 'main' ? 'pastel' : 'main');
  const colors = theme === 'main' ? mainTheme : pastelTheme;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleGoToProducts = () => {
    navigate('/productos');
  };

  const handleGoToInvoices = () => {
    navigate('/InvoiceManager');
  };

  // CAMBIO: Navegar a /orders fuera del dashboard
  const handleGoToOrders = () => {
    navigate('/orders');
  };

  const handleGoToUsers = () => {
    window.location.href = "http://localhost:3000/usuarios";
  };

  // Notificación y redirección al crear pedido
  const handleOrderCreated = (orderId) => {
    if (orderId) {
      setNotification({ message: "¡Pedido agregado exitosamente!", type: "success" });
      setTimeout(() => {
        setNotification(null);
        navigate(`/dashboard/order-items/${orderId}`);
      }, 1600);
    }
  };

  // Notificación y redirección al crear factura (debes pasar este handler a InvoiceManager)
  const handleInvoiceCreated = () => {
    setNotification({ message: "¡Factura agregada exitosamente!", type: "success" });
    setTimeout(() => {
      setNotification(null);
      navigate('/dashboard');
    }, 1600);
  };

  // Wrapper para obtener orderId de params y pasar colores/navegador/notificación
  function OrderItemsWrapper() {
    const { orderId } = useParams();
    return (
      <Order_items
        orderId={orderId}
        colors={colors}
        setNotification={setNotification}
        navigate={navigate}
      />
    );
  }

  return (
    <div
      className="container-fluid"
      style={{
        background: theme === 'main' ? mainTheme.GRADIENT : pastelTheme.SOFT_YELLOW,
        minHeight: "100vh",
        transition: 'background 0.5s'
      }}
    >
      {/* Header */}
      <div
        className="d-flex justify-content-between align-items-center mt-3 mb-4 p-3 rounded shadow-sm"
        style={{
          background: theme === 'main' ? mainTheme.CARD_BG : pastelTheme.SOFT_ORANGE,
          border: `2px solid ${theme === 'main' ? mainTheme.BORDER : pastelTheme.SOFT_GREEN}`,
          color: theme === 'main' ? mainTheme.TITLE : pastelTheme.SOFT_BROWN,
          borderRadius: 20,
          transition: 'all 0.4s'
        }}
      >
        <button
          className="btn fw-bold"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#sidebarCanvas"
          style={{
            borderColor: theme === 'main' ? mainTheme.BORDER : pastelTheme.SOFT_BROWN,
            color: theme === 'main' ? mainTheme.TITLE : pastelTheme.SOFT_BROWN,
            background: theme === 'main' ? mainTheme.BTN_BG : pastelTheme.SOFT_GREEN,
            borderWidth: 2
          }}
        >
          ☰ Menú
        </button>
        <div className="d-flex align-items-center gap-3" style={{ flex: 1, justifyContent: "center" }}>
          <h2 className="fw-semibold mb-0" style={{ color: theme === 'main' ? mainTheme.TITLE : pastelTheme.SOFT_BROWN }}>
            Sistema de Gestión - Pollería
          </h2>
          <img
            src={logo}
            alt="Logo"
            style={{
              width: 48,
              height: 48,
              objectFit: "cover",
              borderRadius: "50%",
              border: "3px solid #FFD166",
              background: "#fff",
              boxShadow: "0 2px 8px #FFD16688",
              transition: "transform 0.3s",
              marginLeft: 16,
              cursor: "pointer"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.09)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            draggable={false}
          />
        </div>
      </div>

      {/* Sidebar izquierdo */}
      <div
        className="offcanvas offcanvas-start"
        tabIndex="-1"
        id="sidebarCanvas"
        aria-labelledby="sidebarLabel"
      >
        <div className="offcanvas-header" style={{ background: theme === 'main' ? mainTheme.SIDEBAR_HEADER : pastelTheme.SOFT_ORANGE }}>
          <h5 id="sidebarLabel" style={{ color: theme === 'main' ? mainTheme.SIDEBAR_TEXT : pastelTheme.SOFT_BROWN }}>Opciones del Sistema</h5>
          <button
            type="button"
            className="btn-close text-reset"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body d-flex flex-column justify-content-between" style={{ background: theme === 'main' ? mainTheme.SIDEBAR_BG : pastelTheme.SOFT_YELLOW }}>
          <div>
            <button
              className="btn w-100 mb-2"
              style={{
                background: theme === 'main' ? mainTheme.BTN_BG : pastelTheme.SOFT_GREEN,
                color: theme === 'main' ? mainTheme.BTN_TEXT : pastelTheme.SOFT_BROWN,
                fontWeight: "bold",
                border: `1.5px solid ${theme === 'main' ? mainTheme.BORDER : pastelTheme.SOFT_ORANGE}`,
                borderRadius: 8
              }}
              onClick={handleGoToInvoices}
            >
              Menú de Facturas
            </button>
            <button
              className="btn w-100 mb-2"
              style={{
                background: theme === 'main' ? mainTheme.BTN_BG : pastelTheme.SOFT_ORANGE,
                color: theme === 'main' ? mainTheme.BTN_TEXT : pastelTheme.SOFT_BROWN,
                fontWeight: "bold",
                border: `1.5px solid ${theme === 'main' ? mainTheme.BORDER : pastelTheme.SOFT_GREEN}`,
                borderRadius: 8
              }}
              onClick={handleGoToProducts}
            >
              Menú de Productos
            </button>
            {/* Botón de pedidos debajo de Menú de Productos */}
            <button
              className="btn w-100 mb-2"
              style={{
                background: theme === 'main' ? mainTheme.BTN_BG : pastelTheme.SOFT_GREEN,
                color: theme === 'main' ? mainTheme.BTN_TEXT : pastelTheme.SOFT_BROWN,
                fontWeight: "bold",
                border: `1.5px solid ${theme === 'main' ? mainTheme.BORDER : pastelTheme.SOFT_ORANGE}`,
                borderRadius: 8
              }}
              onClick={handleGoToOrders}
            >
              Pedidos
            </button>
            {/* Botón Cambiar tema */}
            <button
              className="btn w-100 mb-2 fw-bold"
              style={{
                background: theme === 'main' ? mainTheme.BTN_BG : pastelTheme.SOFT_GREEN,
                color: theme === 'main' ? mainTheme.BTN_TEXT : pastelTheme.SOFT_BROWN,
                border: `1.5px solid ${theme === 'main' ? mainTheme.BORDER : pastelTheme.SOFT_ORANGE}`,
                borderRadius: 8
              }}
              onClick={handleToggleTheme}
              title="Cambiar tema"
            >
              Cambiar tema
            </button>
            {/* Solo el admin puede ver el botón de agregar usuarios */}
            {user?.role === 'admin' && (
              <button
                className="btn w-100 mb-2 fw-bold"
                style={{
                  background: '#fffbe8',
                  color: '#b35012',
                  fontWeight: "bold",
                  border: "1.5px solid #FFD166",
                  borderRadius: 8
                }}
                onClick={handleGoToUsers}
              >
                Agregar Usuarios
              </button>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="btn mt-4"
            style={{
              background: theme === 'main' ? mainTheme.LOGOUT_BG : pastelTheme.SOFT_GRAY,
              color: theme === 'main' ? mainTheme.LOGOUT_TEXT : pastelTheme.TEXT_DANGER,
              fontWeight: "bold",
              border: `1.5px solid ${theme === 'main' ? mainTheme.BORDER : pastelTheme.SOFT_ORANGE}`,
              borderRadius: 8
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Notificación flotante */}
      {notification && <Notification message={notification.message} type={notification.type} />}

      {/* Contenido principal con rutas */}
      <div className="mt-4">
        <Routes>
          {/* MAIN: ahora la ruta principal es order-items SIN orderId */}
          <Route
            path="/"
            element={
              <div
                className="p-3 mb-4 rounded shadow-sm"
                style={{
                  background: theme === 'main' ? mainTheme.CARD_BG : pastelTheme.SOFT_GREEN,
                  border: `2px solid ${theme === 'main' ? mainTheme.BORDER : pastelTheme.SOFT_ORANGE}`,
                  borderRadius: 16,
                  boxShadow: theme === 'main' ? mainTheme.SHADOW : `0 2px 10px ${pastelTheme.SOFT_GREEN}`,
                  transition: 'all 0.4s'
                }}
              >
                <OrderItemsWrapper />
              </div>
            }
          />
          {/* Mantén la ruta para order-items con ID por si se navega directo */}
          <Route
            path="/order-items/:orderId"
            element={
              <div
                className="p-3 mb-4 rounded shadow-sm"
                style={{
                  background: theme === 'main' ? mainTheme.CARD_BG : pastelTheme.SOFT_GREEN,
                  border: `2px solid ${theme === 'main' ? mainTheme.BORDER : pastelTheme.SOFT_ORANGE}`,
                  borderRadius: 16,
                  boxShadow: theme === 'main' ? mainTheme.SHADOW : `0 2px 10px ${pastelTheme.SOFT_GREEN}`,
                  transition: 'all 0.4s'
                }}
              >
                <OrderItemsWrapper />
              </div>
            }
          />
          {/* (Ya NO incluir Orders como ruta hija aquí; estará fuera del dashboard) */}
        </Routes>
      </div>
    </div>
  );
}

export default Dashboard;