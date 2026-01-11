// src/pages/configuracion/ConfiguracionNegocio.jsx
import React, { useState, useEffect } from 'react';
import { BuildingOfficeIcon, DevicePhoneMobileIcon, EnvelopeIcon, IdentificationIcon, MapPinIcon, PercentBadgeIcon } from '@heroicons/react/24/outline';
import { getConfig, updateConfig } from 'services/configService';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import jwtUtils from 'utilities/Token/jwtUtils';
import { useNavigate } from 'react-router-dom';

const ConfiguracionNegocio = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombre_negocio: '',
        ruc: '',
        direccion: '',
        telefono: '',
        email: '',
        igv_porcentaje: 18.00
    });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const response = await getConfig();
            
            const configData = response.data ? response.data : response;

            if (configData && configData.nombre_negocio !== undefined) {
                setFormData({
                    nombre_negocio: configData.nombre_negocio || '',
                    ruc: configData.ruc || '',
                    direccion: configData.direccion || '',
                    telefono: configData.telefono || '',
                    email: configData.email || '',
                    igv_porcentaje: configData.igv_porcentaje || ''
                });
            } else {
                console.warn("La respuesta no tiene el formato esperado:", response);
            }
        } catch (error) {
            console.error("Error al cargar configuración:", error);
            setAlert({ type: 'error', message: 'No se pudo cargar la configuración.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        
        try {
            const response = await updateConfig(formData);

            const tokenRecibido = response.data?.access_token;

            if (response.type === 'success' && tokenRecibido) {
                // Seteo del token
                jwtUtils.setAccessTokenInCookie(tokenRecibido);

                setAlert({ type: 'success', message: response.message });

                // Redirección
                setTimeout(() => {
                    window.location.href = '/admin';
                }, 1000);

            } else {
                console.error("Error: El backend no devolvió el token dentro de data.");
            }
        } catch (error) {
            console.error("Error crítico:", error);
            setAlert({ type: 'error', message: 'Error al procesar la respuesta.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Cargando configuración...</div>;

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Configuración del Negocio</h1>
                <p className="text-slate-500">Administra la información que aparecerá en tus comprobantes de pago.</p>
            </header>

            <AlertMessage 
                type={alert?.type} 
                message={alert?.message} 
                details={alert?.details} 
                onClose={() => setAlert(null)} 
            />

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                            <BuildingOfficeIcon className="w-5 h-5 text-slate-400" />
                            Datos Generales
                        </h2>
                    </div>
                    
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nombre del Negocio */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Comercial / Razón Social</label>
                            <input
                                type="text" name="nombre_negocio" value={formData.nombre_negocio} onChange={handleChange}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:outline-none"
                                required
                            />
                        </div>

                        {/* RUC */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                                <IdentificationIcon className="w-4 h-4" /> RUC
                            </label>
                            <input
                                type="text" name="ruc" value={formData.ruc} onChange={handleChange} maxLength="11"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:outline-none"
                                required
                            />
                        </div>

                        {/* IGV */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                                <PercentBadgeIcon className="w-4 h-4" /> Porcentaje IGV (%)
                            </label>
                            <input
                                type="number" name="igv_porcentaje" value={formData.igv_porcentaje} onChange={handleChange} step="0.01"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:outline-none bg-amber-50 font-bold"
                                required
                            />
                        </div>

                        {/* Dirección */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                                <MapPinIcon className="w-4 h-4" /> Dirección Fiscal
                            </label>
                            <input
                                type="text" name="direccion" value={formData.direccion} onChange={handleChange}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:outline-none"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                            <DevicePhoneMobileIcon className="w-5 h-5 text-slate-400" />
                            Contacto de Facturación
                        </h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                            <input
                                type="text" name="telefono" value={formData.telefono} onChange={handleChange}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                                <EnvelopeIcon className="w-4 h-4" /> Email de contacto
                            </label>
                            <input
                                type="email" name="email" value={formData.email} onChange={handleChange}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="px-8 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg shadow-slate-200 flex items-center gap-2"
                    >
                        {isSaving ? 'Guardando...' : 'Actualizar Configuración'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ConfiguracionNegocio;