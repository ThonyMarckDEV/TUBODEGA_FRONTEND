import React from 'react';
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import jwtUtils from 'utilities/Token/jwtUtils';

const SedeFloatingBadge = () => {
    const refresh_token = jwtUtils.getRefreshTokenFromCookie();
    const nombreSede = refresh_token ? jwtUtils.getNombreSede(refresh_token) : null;
    const rol = refresh_token ? jwtUtils.getUserRole(refresh_token) : null;

    if (!nombreSede) return null;

    const colorClass = rol === 'admin' 
        ? 'bg-slate-900 text-white border-slate-700' 
        : 'bg-indigo-600 text-white border-indigo-500';

    return (
        <div className={`
            fixed bottom-4 right-4 z-50 
            flex items-center gap-3 
            px-4 py-2.5 
            rounded-full shadow-2xl 
            backdrop-blur-md bg-opacity-95
            border border-opacity-20
            transition-all duration-300 hover:scale-105
            animate-fade-in-up
            ${colorClass}
        `}>
            <div className="p-1.5 bg-white/20 rounded-full">
                <BuildingStorefrontIcon className="w-4 h-4 text-white" />
            </div>

            <div className="flex flex-col">
                <span className="text-[9px] font-bold opacity-70 uppercase tracking-wider leading-none mb-0.5">
                    Ubicación Actual
                </span>
                <span className="text-xs font-bold truncate max-w-[150px] md:max-w-[200px]">
                    {nombreSede}
                </span>
            </div>
        </div>
    );
};

export default SedeFloatingBadge;