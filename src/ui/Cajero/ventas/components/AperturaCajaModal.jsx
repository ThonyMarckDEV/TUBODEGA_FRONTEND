import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Importar useNavigate
import { getCajasDisponibles, abrirCaja } from 'services/cajaService';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { BanknotesIcon, InboxIcon } from '@heroicons/react/24/outline';

const AperturaCajaModal = ({ onSuccess }) => {
    const navigate = useNavigate(); // 2. Inicializar el hook de navegación
    const [cajas, setCajas] = useState([]);
    const [formData, setFormData] = useState({ caja_id: '', monto_inicial: '' });
    
    // Estados de Carga
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [loadingCajas, setLoadingCajas] = useState(true); 
    
    const [error, setError] = useState(null);

    // Cargar cajas al montar
    useEffect(() => {
        const loadCajas = async () => {
            setLoadingCajas(true);
            try {
                const response = await getCajasDisponibles();
                setCajas(response.data || []);
            } catch (err) {
                setError("No se pudieron cargar las cajas disponibles.");
            } finally {
                setLoadingCajas(false);
            }
        };
        loadCajas();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.caja_id || formData.monto_inicial === '') {
            setError("Debe seleccionar una caja e ingresar el monto inicial.");
            return;
        }

        setLoadingSubmit(true);
        setError(null);

        try {
            const response = await abrirCaja(formData);
            if (response.type === 'success') {
                onSuccess(response.data); 
            }
        } catch (err) {
            setError(err.message || "Error al abrir la caja.");
        } finally {
            setLoadingSubmit(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4">
            <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl border border-gray-100 relative overflow-hidden">
                
                {/* Barra decorativa superior */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

                <div className="text-center mb-8">
                    <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
                        <InboxIcon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">APERTURA DE CAJA</h2>
                    <p className="text-slate-500 mt-1 text-sm">Debes iniciar turno para acceder al sistema.</p>
                </div>

                <AlertMessage type="error" message={error} onClose={() => setError(null)} />

                <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                    
                    {/* SELECTOR DE CAJA MEJORADO */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                            Seleccionar Punto de Venta
                        </label>
                        <div className="relative">
                            <select
                                className={`w-full p-3.5 border rounded-xl outline-none appearance-none font-medium transition-all ${
                                    loadingCajas 
                                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-wait' 
                                        : 'bg-slate-50 text-slate-700 border-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-500'
                                }`}
                                value={formData.caja_id}
                                onChange={(e) => setFormData({...formData, caja_id: e.target.value})}
                                disabled={loadingCajas || cajas.length === 0}
                            >
                                {loadingCajas ? (
                                    <option>Cargando cajas disponibles...</option>
                                ) : cajas.length === 0 ? (
                                    <option>No hay cajas habilitadas</option>
                                ) : (
                                    <>
                                        <option value="">-- Elige una caja --</option>
                                        {cajas.map(caja => (
                                            <option key={caja.id} value={caja.id}>{caja.nombre}</option>
                                        ))}
                                    </>
                                )}
                            </select>
                            
                            <div className="absolute right-4 top-4 pointer-events-none text-slate-400">
                                {loadingCajas ? (
                                    <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* INPUT MONTO */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                            Dinero en Caja (Sencillo Inicial)
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                <BanknotesIcon className="w-6 h-6" />
                            </div>
                            <span className="absolute left-12 top-3.5 text-slate-400 font-bold text-lg">S/</span>
                            <input
                                type="number"
                                min="0"
                                step="0.10"
                                className="w-full pl-20 p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono font-bold text-xl text-slate-800 placeholder-slate-300 transition-all disabled:bg-gray-50 disabled:text-gray-400"
                                placeholder="0.00"
                                value={formData.monto_inicial}
                                onChange={(e) => setFormData({...formData, monto_inicial: e.target.value})}
                                disabled={loadingSubmit}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            type="submit"
                            disabled={loadingSubmit || loadingCajas || cajas.length === 0}
                            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-black transition-all shadow-lg shadow-slate-900/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {loadingSubmit ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    ABRIENDO...
                                </>
                            ) : 'INICIAR TURNO'}
                        </button>

                        {/* 3. BOTÓN CANCELAR */}
                        <button
                            type="button"
                            onClick={() => navigate('/cajero')}
                            className="w-full py-3 text-slate-500 font-bold hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-colors"
                        >
                            Cancelar / Volver al Menú
                        </button>
                    </div>
                    
                </form>
            </div>
        </div>
    );
};

export default AperturaCajaModal;