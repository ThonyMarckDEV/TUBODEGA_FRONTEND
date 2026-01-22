// src/components/ProtectedRoute.jsx

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from 'services/authService';
import LoadingScreen from 'components/Shared/LoadingScreen';

const ProtectedRoute = ({ element, allowedRoles }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const response = await authService.verifySession();
        
        const userData = response.data || response;

        const roleName = userData.rol?.nombre || userData.rol;
        if (allowedRoles && !allowedRoles.includes(roleName)) {
          console.warn(`Acceso denegado. Rol: ${roleName}. Requerido: ${allowedRoles}`);
          setIsAuthorized(false);
        } else {
          setIsAuthorized(true);
        }

      } catch (error) {
        console.error("Error validando sesión:", error);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyUser();
  }, [allowedRoles]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 z-50">
        <LoadingScreen />
        <p className="mt-4 text-sm text-gray-500 animate-pulse">Verificando acceso...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return element;
};

export default ProtectedRoute;