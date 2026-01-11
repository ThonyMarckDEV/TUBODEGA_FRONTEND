import React from 'react';
import { Navigate } from 'react-router-dom';
import jwtUtils from 'utilities/Token/jwtUtils';

const ProtectedRouteCajero = ({ element }) => {
  // Obtener el JWT desde cookie
  const refresh_token = jwtUtils.getRefreshTokenFromCookie();

  if (!refresh_token) {
    return <Navigate to="/404" />; // O 401, lo que prefieras
  }

  // --- NUEVO: VALIDACIÓN LICENCIA DEMO ---
  const trialDays = jwtUtils.getTrialDays(refresh_token);

  // Si trialDays existe y es 0 o menor, bloqueamos.
  if (trialDays !== undefined && trialDays !== null && parseInt(trialDays) <= 0) {
      return <Navigate to="/licencia-expirada" replace />;
  }
  // ---------------------------------------

  const rol = jwtUtils.getUserRole(refresh_token);

  if (rol !== 'cajero') {
    return <Navigate to="/404" />;
  }

  // Si todo está bien, se muestra el elemento original
  return element;
};

export default ProtectedRouteCajero;