import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

// Utilidades para animación
const fadeInAnim = {
  animation: 'fadeInLogin 0.8s',
};
const shakeAnim = {
  animation: 'shakeLogin 0.45s',
};

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [cardAnim, setCardAnim] = useState(fadeInAnim);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setCardAnim(fadeInAnim);
    try {
      const res = await axios.post('http://localhost:4000/api/login', { username, password });

      // Guarda también usuario y rol en localStorage
      if (res.data.token && res.data.user) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/dashboard');
      } else {
        setErrorMsg('Usuario o contraseña incorrectos.');
        setCardAnim(shakeAnim);
      }
    } catch (err) {
      setErrorMsg('Error al iniciar sesión');
      setCardAnim(shakeAnim);
    }
    setLoading(false);
  };

  // Efecto: zoom leve y lento solo en la card, sombra más grande en hover
  const cardDefault = {
    minWidth: 350,
    borderRadius: 24,
    background: "rgba(255,255,255,0.91)",
    transition: "transform 0.7s cubic-bezier(.25,.8,.25,1), box-shadow 0.7s cubic-bezier(.25,.8,.25,1)",
    boxShadow: "0 8px 40px 0 #FFD16680",
    ...cardAnim,
  };
  const cardHover = {
    ...cardDefault,
    transform: "scale(1.016)",
    boxShadow: "0 16px 64px 0 #FFD166B0"
  };
  const [cardStyle, setCardStyle] = useState(cardDefault);

  // Para el borde en error
  const inputErrorStyle = errorMsg
    ? { border: '2px solid #E63946', boxShadow: '0 0 0 2px #E6394699' }
    : {};

  return (
    <>
      <style>
        {`
        @keyframes fadeInLogin {
          from { opacity: 0; transform: translateY(40px);}
          to { opacity: 1; transform: translateY(0);}
        }
        @keyframes shakeLogin {
          10%, 90% { transform: translateX(-2px); }
          20%, 80% { transform: translateX(4px); }
          30%, 50%, 70% { transform: translateX(-8px); }
          40%, 60% { transform: translateX(8px); }
        }
        `}
      </style>
      <div
        className="d-flex justify-content-center align-items-center min-vh-100"
        style={{
          background: "linear-gradient(90deg, #E63946 0%, #FFB347 60%, #FFD166 100%)",
          padding: 10,
        }}
      >
        <div
          className="card shadow-lg p-4 border-0"
          style={cardStyle}
          onMouseEnter={() => setCardStyle({ ...cardHover, ...cardAnim })}
          onMouseLeave={() => setCardStyle({ ...cardDefault, ...cardAnim })}
        >
          <div className="text-center mb-3">
            <img
              src={logo}
              alt="Pollos Pampeño"
              className="mb-2"
              style={{
                width: 80,
                height: 80,
                objectFit: 'contain',
                marginBottom: 12,
                borderRadius: "50%",
                background: "#fffbe0",
                border: "4px solid #FFD166",
                boxShadow: "0 2px 12px #FFB34755",
                transition: "transform 0.3s",
                filter: "drop-shadow(0 0 10px #FFD16688)",
                cursor: "pointer",
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.11)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              draggable={false}
            />
            <h2 className="fw-bold" style={{ color: '#b35012', letterSpacing: 1, fontFamily: 'cursive' }}>
              Pollos Pampeño
            </h2>
            <div className="fw-light" style={{ color: '#b35012', fontSize: 18, marginTop: -6 }}>
              ¡Bienvenido! Inicia sesión para continuar
            </div>
          </div>
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="mb-3 position-relative">
              {/* Accesibilidad: label oculto */}
              <label htmlFor="login-username" className="visually-hidden">Usuario</label>
              <input
                type="text"
                id="login-username"
                className="form-control form-control-lg"
                placeholder="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  borderRadius: 12,
                  border: '2px solid #FFD166',
                  background: "#FFFDE8",
                  boxShadow: "0 2px 8px #FFE08240",
                  transition: "box-shadow 0.3s, border 0.3s",
                  paddingLeft: 44,
                  ...inputErrorStyle
                }}
                aria-invalid={!!errorMsg}
                autoFocus
              />
              {/* Icono usuario */}
              <span
                style={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#FFB347",
                  fontSize: 21,
                  pointerEvents: "none"
                }}
              >
                <i className="bi bi-person"></i>
              </span>
            </div>
            <div className="mb-3 position-relative">
              {/* Accesibilidad: label oculto */}
              <label htmlFor="login-password" className="visually-hidden">Contraseña</label>
              <input
                type={showPassword ? "text" : "password"}
                id="login-password"
                className="form-control form-control-lg"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  borderRadius: 12,
                  border: '2px solid #FFD166',
                  background: "#FFFDE8",
                  boxShadow: "0 2px 8px #FFE08240",
                  transition: "box-shadow 0.3s, border 0.3s",
                  paddingLeft: 44,
                  paddingRight: 44,
                  ...inputErrorStyle
                }}
                aria-invalid={!!errorMsg}
              />
              {/* Icono candado */}
              <span
                style={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#FFB347",
                  fontSize: 20,
                  pointerEvents: "none"
                }}
              >
                <i className="bi bi-lock"></i>
              </span>
              {/* Icono ojo */}
              <button
                type="button"
                tabIndex={-1}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="btn btn-link p-0"
                style={{
                  position: "absolute",
                  right: 14,
                  top: "53%",
                  transform: "translateY(-50%)",
                  color: "#b35012",
                  background: "transparent",
                  fontSize: 21,
                  outline: "none",
                  border: "none"
                }}
                onClick={() => setShowPassword(v => !v)}
              >
                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
              </button>
            </div>
            {/* Mensaje de error accesible */}
            <div
              aria-live="polite"
              style={{
                minHeight: 24,
                marginBottom: 8,
                transition: 'opacity 0.2s'
              }}
            >
              {errorMsg && (
                <div className="alert alert-danger py-2 text-center fw-semibold animate__animated animate__fadeIn"
                  style={{ marginBottom: 0, fontSize: 15, padding: "6px 0" }}>
                  {errorMsg}
                </div>
              )}
            </div>
            <button
              type="submit"
              className="btn btn-lg w-100 fw-bold d-flex justify-content-center align-items-center"
              style={{
                borderRadius: 12,
                background: "linear-gradient(90deg, #FFD166 0%, #FFB347 60%, #E63946 100%)",
                color: "#b35012",
                fontSize: 18,
                boxShadow: "0 4px 18px 0 #FFD16660",
                border: "none",
                transition: "transform 0.25s, background 0.25s",
                minHeight: 48,
                gap: 10,
                cursor: loading ? "not-allowed" : "pointer"
              }}
              disabled={loading}
              onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                    style={{ color: "#b35012" }}
                  />
                  Ingresando...
                </>
              ) : (
                "Ingresar"
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default LoginForm;