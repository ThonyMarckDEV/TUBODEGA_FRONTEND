import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import jwtUtils from 'utilities/Token/jwtUtils';

const ProtectedRouteAdmin = ({ element }) => {
    const access_token = jwtUtils.getAccessTokenFromCookie();
    const location = useLocation();

    // 1. Si no hay token, al 401
    if (!access_token) {
        return <Navigate to="/401" />;
    }

    const rol = jwtUtils.getUserRole(access_token);
    // Extraemos el claim 'configurado' directamente
    const claims = jwtUtils.getClaims(access_token);
    const configurado = claims?.configurado; 

    // 2. Verificar rol de admin
    if (rol !== 'admin') {
        return <Navigate to="/401" />;
    }

    // 3. VALIDACIÓN DE CONFIGURACIÓN
    // Comprobamos si es exactamente 0. 
    // Usamos .includes para evitar problemas con la barra diagonal final
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