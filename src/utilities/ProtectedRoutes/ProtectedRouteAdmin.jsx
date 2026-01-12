import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import jwtUtils from 'utilities/Token/jwtUtils';

const ProtectedRouteAdmin = ({ element }) => {
    const access_token = jwtUtils.getAccessTokenFromCookie();
    const refresh_token = jwtUtils.getRefreshTokenFromCookie();
    const location = useLocation();

    if (!access_token) {
        return <Navigate to="/401" />;
    }

    const trialDays = jwtUtils.getTrialDays(refresh_token);
    
    if (trialDays !== undefined && trialDays !== null && trialDays <= 0) {
        return <Navigate to="/licencia-expirada" replace />;
    }

    const rol = jwtUtils.getUserRole(access_token);
    const claims = jwtUtils.getClaims(access_token);
    const configurado = claims?.configurado; 

    if (rol !== 'admin') {
        return <Navigate to="/401" />;
    }

    const isConfigPage = location.pathname.includes("configuracion-negocio");
    
    if (configurado === 0 && !isConfigPage) {
        console.log("Sistema no configurado. Redirigiendo...");
        return <Navigate to="/admin/configuracion-negocio" replace state={{ 
            alerta: "⚠️ Configuración pendiente: Debe completar los datos de su empresa para activar el sistema." 
        }} />;
    }

    return element;
};

export default ProtectedRouteAdmin;