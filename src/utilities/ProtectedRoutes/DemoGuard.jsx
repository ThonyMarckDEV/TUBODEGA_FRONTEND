import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import jwtUtils from 'utilities/Token/jwtUtils'; // Tu utilidad para decodificar

const DemoGuard = ({ children }) => {
    const location = useLocation();
    
    // Obtenemos los claims del token
    const refresh_token = jwtUtils.getRefreshTokenFromCookie();
    
    // Si no hay token, deja que las rutas protegidas normales (ProtectedRouteAdmin) manejen el login
    if (!refresh_token) {
        return children;
    }

    const trialDays = jwtUtils.getTrialDays(refresh_token);

    // LÓGICA DE BLOQUEO
    // Si trial_days existe y es negativo, se acabó el demo.
    if (trialDays !== undefined && trialDays !== null && parseInt(trialDays) < 0) {
        // Redirigir a una página de "Licencia Expirada"
        // (Debes crear esta ruta en App.js fuera de este Guard)
        return <Navigate to="/licencia-expirada" state={{ from: location }} replace />;
    }

    return (
        <>
            {/* BARRA DE AVISO (Opcional, si quedan pocos días) */}
            {trialDays !== undefined && trialDays !== null && trialDays >= 0 && trialDays <= 5 && (
                <div className="bg-orange-500 text-white text-xs font-bold text-center py-1 px-4 fixed top-0 w-full z-[9999]">
                    ⚠️ MODO DEMO: Te quedan {parseInt(trialDays)} días de prueba. ¡Adquiere tu licencia!
                </div>
            )}
            
            {/* Contenido Real */}
            {children}
        </>
    );
};

export default DemoGuard;