import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import ProductManager from './components/ProductManager';
import InvoiceManager from './components/InvoiceManager';
import PrivateRoute from './components/PrivateRoute';
import UserManager from './components/UserManager';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/InvoiceManager"
          element={
            <PrivateRoute>
              <InvoiceManager />
            </PrivateRoute>
          }
        />
        <Route
          path="/productos"
          element={
            <PrivateRoute>
              <ProductManager />
            </PrivateRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <PrivateRoute>
              <UserManager />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;