import React from 'react';
import { Navigate } from 'react-router-dom';
import jwtUtils from 'utilities/Token/jwtUtils';

const ProtectedRouteCajero = ({ element }) => {
  const refresh_token = jwtUtils.getRefreshTokenFromCookie();

  if (!refresh_token) {
    return <Navigate to="/404" />;
  }

  const rol = jwtUtils.getUserRole(refresh_token);

  if (rol !== 'cajero') {
    return <Navigate to="/404" />;
  }

  return element;
};

export default ProtectedRouteCajero;