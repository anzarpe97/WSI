import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, isLoading, getUserRole, getDashboardRoute } = useAuth();
  const location = useLocation();

  // Mostrar loader mientras verifica
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loader"></div>
          <p style={{ marginTop: '20px', color: '#333' }}>Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si requiere un rol específico y no lo tiene, redirigir a su dashboard
  const userRole = getUserRole();
  if (requiredRole !== null && userRole !== requiredRole) {
    return <Navigate to={getDashboardRoute()} replace />;
  }

  return children;
};

export default ProtectedRoute;
