import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
  // Aquí puedes usar también contexto/auth si tienes uno, o verificar el token/JWT
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" replace />;
}

export default PrivateRoute;