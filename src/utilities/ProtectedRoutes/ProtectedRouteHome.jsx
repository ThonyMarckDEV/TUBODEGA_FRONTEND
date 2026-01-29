import React from 'react';
import { Navigate } from 'react-router-dom';
import jwtUtils from 'utilities/Token/jwtUtils';

const ProtectedRoute = ({ element }) => {
  const access_token = jwtUtils.getAccessTokenFromCookie();
  
  if (access_token) {
    const rol = jwtUtils.getUserRole(access_token);

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
