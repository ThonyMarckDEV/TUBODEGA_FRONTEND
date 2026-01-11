import React from 'react';
import { logout } from 'js/logout'; // <--- Importa tu función aquí
import { LockClosedIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const LicenciaExpirada = () => {

    const handleLogout = async () => {
        // Ejecuta tu función de logout que muestra el LoadingScreen
        await logout();
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                
                {/* Encabezado Rojo */}
                <div className="bg-red-50 p-6 flex flex-col items-center text-center border-b border-red-100">
                    <div className="bg-red-100 p-4 rounded-full mb-4">
                        <LockClosedIcon className="w-12 h-12 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-red-700">
                        Periodo de Prueba Finalizado
                    </h1>
                    <p className="text-red-600/80 text-sm mt-1 font-medium">
                        Acceso al sistema restringido
                    </p>
                </div>

                {/* Contenido del Mensaje */}
                <div className="p-8 text-center space-y-6">
                    <div className="space-y-2">
                        <p className="text-slate-600">
                            Los <strong>7 días de demostración</strong> han concluido. Esperamos que el sistema haya sido de tu agrado.
                        </p>
                        <p className="text-slate-500 text-sm">
                            Para continuar disfrutando de todas las funcionalidades y recuperar el acceso a tus datos, por favor adquiere una licencia completa.
                        </p>
                    </div>

                    {/* Caja de Contacto (Opcional) */}
                    <div className="bg-slate-50 rounded-lg p-4 text-sm border border-slate-100">
                        <p className="font-semibold text-slate-700 mb-1">¿Deseas activar el sistema?</p>
                        <p className="text-slate-500">Contacta a soporte técnico:</p>
                        <p className="text-indigo-600 font-bold mt-1">+51 987 654 321</p>
                    </div>

                    {/* Botón de Logout */}
                    <div className="pt-2">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95"
                        >
                            <span className="text-sm">Cerrar Sesión</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                            </svg>
                        </button>
                        <p className="text-xs text-slate-400 mt-4">
                            ID de Sistema: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LicenciaExpirada;