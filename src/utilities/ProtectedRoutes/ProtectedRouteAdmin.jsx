import React from 'react';
import { Navigate } from 'react-router-dom';
import jwtUtils from 'utilities/Token/jwtUtils';

const ProtectedRouteManager = ({ element }) => {
  // Obtener el JWT desde localStorage
  const refresh_token = jwtUtils.getRefreshTokenFromCookie();


  if (!refresh_token) {
    return <Navigate to="/404" />;
  }

  const rol = jwtUtils.getUserRole(refresh_token);

  if (rol !== 'admin') {
    return <Navigate to="/404" />;
  }

  // Si hay token, se muestra el elemento original
  return element;

};

export default ProtectedRouteManager;
