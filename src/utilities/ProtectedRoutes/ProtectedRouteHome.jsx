import React from 'react';
import { Navigate } from 'react-router-dom';
import jwtUtils from 'utilities/Token/jwtUtils';

const ProtectedRoute = ({ element }) => {
  const refresh_token = jwtUtils.getRefreshTokenFromCookie();
  
  if (refresh_token) {
    const rol = jwtUtils.getUserRole(refresh_token);

     switch (rol) {
      case 'admin':
        return <Navigate to="/admin" />;
      case 'cajero':
        return <Navigate to="/cajero" />;
      default:
        return element;
    }
  }

  return element;
};

export default ProtectedRoute;
