import React, { useState, useEffect, useCallback } from 'react';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { storeVenta } from 'services/ventaService';
import { getComprobantePdf } from 'services/comprobanteService'; 
import { verificarSesionActiva, cerrarCaja } from 'services/cajaService'; 
import AperturaCajaModal from '../components/AperturaCajaModal';

import VentaCarrito from '../components/VentaCarrito';
import VentaCatalogo from '../components/VentaCatalogo';
import ClienteSearchSelect from 'components/Shared/Comboboxes/ClienteSearchSelect';
import PdfModal from 'components/Shared/Modals/PdfModal';
import { ArrowLeftOnRectangleIcon, InboxIcon } from '@heroicons/react/24/outline';

const initialVentaData = {
    cliente_id: null,
    id_Cliente: null, 
    clienteNombre: 'Público General',
    clienteData: {},
    metodo_pago: 'efectivo',
    tipo_venta: 'bodega',
    detalles: []
};

const AgregarVenta = () => {
    const [sesionActiva, setSesionActiva] = useState(null);
    const [isCheckingSession, setIsCheckingSession] = useState(true);

    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);
    const [showPdf, setShowPdf] = useState(false);
    const [pdfUrl, setPdfUrl] = useState('');
    const [pdfTitle, setPdfTitle] = useState('');

    const [ventaData, setVentaData] = useState(initialVentaData);

   // 1. VERIFICAR SESION
    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await verificarSesionActiva();
                
                // VALIDACIÓN ESTRICTA: Solo si data existe y tiene ID
                if (response && response.data && response.data.id) {
                    setSesionActiva(response.data);
                } else {
                    setSesionActiva(null); // Aseguramos que sea null si no hay data válida
                }
            } catch (error) {
                console.log("Error verificando sesión:", error);
                setSesionActiva(null); // En caso de error, asumimos que no hay sesión
            } finally {
                setIsCheckingSession(false);
            }
        };
        checkSession();
    }, []);

    // 2. CERRAR CAJA
    const handleCerrarCaja = async () => {
        if(!window.confirm("¿Estás seguro de finalizar tu turno? Se cerrará la caja.")) return;

        setLoading(true);
        try {
            const montoFisico = prompt("Ingrese el monto final físico en caja (lo que contó):", "0");
            if (montoFisico === null) { setLoading(false); return; }

            await cerrarCaja({ monto_final_fisico: parseFloat(montoFisico) });
            
            setSesionActiva(null);
            setAlert({ type: 'success', message: 'Turno finalizado correctamente.' });
        } catch (error) {
            setAlert({ type: 'error', message: 'Error al cerrar caja.' });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = useCallback(() => {
        setVentaData(initialVentaData);
    }, []);

    const handleShowComprobante = useCallback(async (ventaId) => {
        try {
            const url = await getComprobantePdf(ventaId);
            setPdfUrl(url);
            setPdfTitle(`Comprobante Venta #${ventaId}`);
            setShowPdf(true);
        } catch (error) {
            console.error("Error al obtener PDF:", error);
            setAlert({ type: 'error', message: 'Venta guardada, pero hubo un error con el PDF.' });
        }
    }, []);

    const handleSubmit = useCallback(async (e) => {
        if (e) e.preventDefault();
        
        if (ventaData.detalles.length === 0) {
            setAlert({ type: 'error', message: 'Agregue al menos un producto.' });
            return;
        }

        if (!sesionActiva) {
            setAlert({ type: 'error', message: 'No hay una caja abierta. Recargue la página.' });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                caja_sesion_id: sesionActiva.id,
                cliente_id: ventaData.id_Cliente, 
                tipo_venta: ventaData.tipo_venta,
                metodo_pago: ventaData.metodo_pago,
                detalles: ventaData.detalles.map(d => ({
                    producto_id: d.id,
                    cantidad: d.cantidad,
                    precio: d.precio_venta
                }))
            };

            const response = await storeVenta(payload);
            
            if (response.type === 'success') {
                const ventaId = response.data.id;
                resetForm(); 
                setAlert({ type: 'success', message: response.message });
                await handleShowComprobante(ventaId);
            } 
        } catch (error) {
            const errorMessage = error.details?.[0] || error.message || 'Error inesperado';
            setAlert({ type: 'error', message: errorMessage });
        } finally {
            setLoading(false);
        }
    }, [ventaData, handleShowComprobante, resetForm, sesionActiva]);

    useEffect(() => {
        const handleKeyDown = (e) => { if (e.key === 'F8') handleSubmit(); };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (pdfUrl) URL.revokeObjectURL(pdfUrl); 
        };
    }, [handleSubmit, pdfUrl]);

    if (isCheckingSession) return <div className="p-10 text-center">Verificando sesión de caja...</div>;

    return (
        <div className="container mx-auto p-4 max-w-[1600px] relative">
            
            {!sesionActiva && (
                <AperturaCajaModal onSuccess={(data) => setSesionActiva(data)} />
            )}

            <PdfModal 
                isOpen={showPdf} 
                onClose={() => setShowPdf(false)} 
                title={pdfTitle}
                pdfUrl={pdfUrl}
            />

            {/* HEADER with Box Info and Logout */}
            <header className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="bg-black text-white p-3 rounded-lg">
                        <h1 className="text-xl font-bold leading-none">POS</h1>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Punto de Venta</h2>
                        {sesionActiva ? (
                            <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                                <InboxIcon className="w-4 h-4" />
                                <span>{sesionActiva.caja?.nombre} (Abierta)</span>
                            </div>
                        ) : (
                            <span className="text-sm text-red-500 font-medium">Caja Cerrada</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-xs font-black uppercase border border-blue-100">
                        Modo: {ventaData.tipo_venta}
                    </span>
                    
                    {/* CLOSE SHIFT BUTTON */}
                    {sesionActiva && (
                        <button 
                            onClick={handleCerrarCaja}
                            className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-bold border border-red-100"
                            title="Finalizar Turno"
                        >
                            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                            CERRAR CAJA
                        </button>
                    )}
                </div>
            </header>

            <AlertMessage {...alert} onClose={() => setAlert(null)} />

            <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 transition-opacity duration-300 ${!sesionActiva ? 'opacity-20 pointer-events-none filter blur-sm' : 'opacity-100'}`}>
                
                <div className="lg:col-span-7 space-y-4">
                    <VentaCatalogo 
                        tipoVenta={ventaData.tipo_venta}
                        onAdd={(prod) => {
                            setVentaData(prev => {
                                const existe = prev.detalles.find(d => d.id === prod.id);
                                if (existe) {
                                    return { ...prev, detalles: prev.detalles.map(d => d.id === prod.id ? { ...d, cantidad: d.cantidad + 1 } : d) };
                                }
                                return { ...prev, detalles: [...prev.detalles, { ...prod, cantidad: 1 }] };
                            });
                        }} 
                    />
                </div>

                <div className="lg:col-span-5">
                    <form onSubmit={handleSubmit} className="bg-white border rounded-xl shadow-sm flex flex-col h-[calc(100vh-220px)] sticky top-4">
                        <div className="p-4 border-b bg-slate-50/50 space-y-4">
                            <ClienteSearchSelect form={ventaData} setForm={setVentaData} allowGeneric={true} />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Método Pago</label>
                                    <select 
                                        value={ventaData.metodo_pago}
                                        onChange={(e) => setVentaData({...ventaData, metodo_pago: e.target.value})}
                                        className="w-full border-slate-300 rounded-lg text-sm"
                                    >
                                        <option value="efectivo">Efectivo</option>
                                        <option value="transferencia">Transferencia / Yape-Plin</option>
                                        <option value="tarjeta">Tarjeta</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Tipo Venta</label>
                                    <select 
                                        value={ventaData.tipo_venta}
                                        onChange={(e) => setVentaData({...ventaData, tipo_venta: e.target.value, detalles: []})}
                                        className="w-full border-slate-300 rounded-lg text-sm"
                                    >
                                        <option value="bodega">Menudeo</option>
                                        <option value="mayorista">Mayorista</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <VentaCarrito 
                                items={ventaData.detalles} 
                                setItems={(newItems) => setVentaData({...ventaData, detalles: newItems})} 
                            />
                        </div>

                        <div className="p-6 bg-slate-900 text-white rounded-b-xl">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">Total a Cobrar</span>
                                <span className="text-4xl font-black">
                                    S/ {ventaData.detalles.reduce((acc, item) => acc + (item.cantidad * item.precio_venta), 0).toFixed(2)}
                                </span>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || ventaData.detalles.length === 0}
                                className="w-full py-4 bg-blue-600 text-white rounded-lg font-black text-lg shadow-lg shadow-blue-900/20 hover:bg-blue-500 active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {loading ? 'PROCESANDO...' : 'FINALIZAR VENTA (F8)'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AgregarVenta;