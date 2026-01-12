import React from 'react';
import { Navigate } from 'react-router-dom';
import jwtUtils from 'utilities/Token/jwtUtils';

const ProtectedRoute = ({ element }) => {
  const refresh_token = jwtUtils.getRefreshTokenFromCookie();

  if (!refresh_token) {
      return <Navigate to="/401" />;
  }

  return element;
};

export default ProtectedRoute;
