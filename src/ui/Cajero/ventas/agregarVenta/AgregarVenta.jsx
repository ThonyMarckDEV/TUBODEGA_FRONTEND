import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeftOnRectangleIcon, InboxIcon, BanknotesIcon } from '@heroicons/react/24/outline';

// Servicios
import { storeVenta } from 'services/ventaService';
import { getComprobantePdf } from 'services/comprobanteService'; 
import { verificarSesionActiva, cerrarCaja } from 'services/cajaService'; 

// Componentes Compartidos
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import PdfModal from 'components/Shared/Modals/PdfModal';
import ClienteSearchSelect from 'components/Shared/Comboboxes/ClienteSearchSelect';

// Componentes Específicos de Ventas
import VentaCarrito from '../components/VentaCarrito';
import VentaCatalogo from '../components/VentaCatalogo';
import AperturaCajaModal from '../components/AperturaCajaModal';

// Estado inicial fuera del componente para estabilidad
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
    // --- ESTADOS GLOBALES ---
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);
    
    // --- ESTADOS DE SESIÓN (CAJA) ---
    const [sesionActiva, setSesionActiva] = useState(null);
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    
    // --- ESTADOS DE CIERRE DE CAJA ---
    const [showCierreModal, setShowCierreModal] = useState(false);
    const [montoCierre, setMontoCierre] = useState('');

    // --- ESTADOS DE PDF ---
    const [showPdf, setShowPdf] = useState(false);
    const [pdfUrl, setPdfUrl] = useState('');
    const [pdfTitle, setPdfTitle] = useState('');

    // --- ESTADOS DEL FORMULARIO DE VENTA ---
    const [ventaData, setVentaData] = useState(initialVentaData);
    
    // [NUEVO] ESTADO PARA EL MONTO RECIBIDO (Para calcular vuelto)
    const [montoRecibido, setMontoRecibido] = useState('');

    // [NUEVO] CÁLCULOS EN TIEMPO REAL
    const totalVenta = ventaData.detalles.reduce((acc, item) => acc + (item.cantidad * item.precio_venta), 0);
    const vuelto = montoRecibido ? (parseFloat(montoRecibido) - totalVenta) : 0;

    // ----------------------------------------------------------------------
    // 1. VERIFICAR SI EL CAJERO YA TIENE TURNO ABIERTO AL CARGAR
    // ----------------------------------------------------------------------
    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await verificarSesionActiva();
                if (response && response.data && response.data.id) {
                    setSesionActiva(response.data);
                } else {
                    setSesionActiva(null);
                }
            } catch (error) {
                console.error("No se pudo verificar la sesión:", error);
                setSesionActiva(null);
            } finally {
                setIsCheckingSession(false);
            }
        };
        checkSession();
    }, []);

    // ----------------------------------------------------------------------
    // 2. LÓGICA DE CIERRE DE CAJA
    // ----------------------------------------------------------------------
    const handleConfirmarCierre = async () => {
        setLoading(true);
        try {
            const montoFinal = montoCierre === '' ? 0 : parseFloat(montoCierre);
            await cerrarCaja({ monto_final_fisico: montoFinal });
            
            setShowCierreModal(false);
            setMontoCierre(''); 
            setSesionActiva(null); 
            setAlert({ type: 'success', message: 'Turno finalizado correctamente.' });
        } catch (error) {
            setAlert({ type: 'error', message: error.message || 'Error al cerrar caja.' });
        } finally {
            setLoading(false);
        }
    };

    // ----------------------------------------------------------------------
    // 3. LÓGICA DE PROCESAR VENTA
    // ----------------------------------------------------------------------
    const resetForm = useCallback(() => {
        setVentaData(initialVentaData);
        setMontoRecibido(''); // [NUEVO] Limpiar input de pago
    }, []);

    const handleShowComprobante = useCallback(async (ventaId) => {
        try {
            const url = await getComprobantePdf(ventaId);
            setPdfUrl(url);
            setPdfTitle(`Comprobante Venta #${ventaId}`);
            setShowPdf(true);
        } catch (error) {
            console.error("Error PDF:", error);
            setAlert({ type: 'error', message: 'Venta guardada, pero falló la generación del PDF.' });
        }
    }, []);

    const handleSubmit = useCallback(async (e) => {
        if (e) e.preventDefault();
        
        if (ventaData.detalles.length === 0) {
            setAlert({ type: 'error', message: 'Agregue al menos un producto al carrito.' });
            return;
        }

        if (!sesionActiva) {
            setAlert({ type: 'error', message: 'No hay una caja abierta. No se puede vender.' });
            return;
        }

        // [NUEVO] VALIDACIÓN DE PAGO EN EFECTIVO
        let montoPagadoFinal = totalVenta;
        if (ventaData.metodo_pago === 'efectivo') {
            const recibido = parseFloat(montoRecibido) || 0;
            // Permitimos margen de error de 0.01 por decimales
            if (recibido < (totalVenta - 0.01)) {
                setAlert({ type: 'error', message: `Monto insuficiente. Faltan S/ ${(totalVenta - recibido).toFixed(2)}` });
                return;
            }
            montoPagadoFinal = recibido;
        }

        setLoading(true);
        try {
            const payload = {
                caja_sesion_id: sesionActiva.id,
                cliente_id: ventaData.id_Cliente, 
                tipo_venta: ventaData.tipo_venta,
                metodo_pago: ventaData.metodo_pago,
                monto_pagado: montoPagadoFinal, // [NUEVO] Enviamos lo que pagó
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
            const errorMessage = error.details?.[0] || error.message || 'Error al procesar la venta.';
            setAlert({ type: 'error', message: errorMessage });
        } finally {
            setLoading(false);
        }
    }, [ventaData, sesionActiva, handleShowComprobante, resetForm, montoRecibido, totalVenta]);

    // Listener de Teclado (F8 para cobrar)
    useEffect(() => {
        const handleKeyDown = (e) => { if (e.key === 'F8') handleSubmit(); };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        };
    }, [handleSubmit, pdfUrl]);

    // ----------------------------------------------------------------------
    // RENDERIZADO
    // ----------------------------------------------------------------------

    if (isCheckingSession) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <svg className="animate-spin h-10 w-10 text-black mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-slate-500 font-medium">Verificando sesión de caja...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-[1600px] relative">
            
            {/* 1. MODAL BLOQUEANTE DE APERTURA */}
            {!sesionActiva && (
                <AperturaCajaModal onSuccess={(data) => setSesionActiva(data)} />
            )}

            {/* 2. MODAL REUSABLE PARA CIERRE DE CAJA */}
            {showCierreModal && (
                <ConfirmModal
                    title="¿Cerrar Turno?"
                    message="Ingresa el monto total en efectivo que has contado en caja."
                    confirmText="Finalizar Turno"
                    onConfirm={handleConfirmarCierre}
                    onCancel={() => setShowCierreModal(false)}
                    disabled={loading}
                >
                    <div className="relative mt-4">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 font-bold sm:text-sm">S/</span>
                        </div>
                        <input
                            type="number" min="0" step="0.10" autoFocus
                            className="w-full pl-8 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-center font-mono text-xl font-bold text-gray-800"
                            placeholder="0.00"
                            value={montoCierre}
                            onChange={(e) => setMontoCierre(e.target.value)}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <BanknotesIcon className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                </ConfirmModal>
            )}

            {/* 3. VISOR PDF */}
            <PdfModal isOpen={showPdf} onClose={() => setShowPdf(false)} title={pdfTitle} pdfUrl={pdfUrl} />

            {/* 4. HEADER DEL POS */}
            <header className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="bg-black text-white p-3 rounded-lg shadow-md">
                        <h1 className="text-xl font-black leading-none tracking-tighter">POS</h1>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Punto de Venta</h2>
                        {sesionActiva ? (
                            <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 w-fit">
                                <InboxIcon className="w-4 h-4" />
                                <span>{sesionActiva.caja?.nombre || 'Caja'} (Abierta)</span>
                            </div>
                        ) : (
                            <span className="text-sm text-red-500 font-medium">Caja Cerrada</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-xs font-black uppercase border border-blue-100 tracking-wide">
                        Modo: {ventaData.tipo_venta}
                    </span>
                    
                    {sesionActiva && (
                        <button 
                            onClick={() => { setMontoCierre(''); setShowCierreModal(true); }}
                            className="flex items-center gap-2 bg-white text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 hover:border-red-200 transition-all text-sm font-bold border border-slate-200 shadow-sm"
                            title="Finalizar Turno"
                        >
                            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                            Cerrar Caja
                        </button>
                    )}
                </div>
            </header>

            <AlertMessage {...alert} onClose={() => setAlert(null)} />

            {/* 5. INTERFAZ PRINCIPAL */}
            <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 transition-all duration-500 ${!sesionActiva ? 'opacity-30 pointer-events-none blur-[2px]' : 'opacity-100'}`}>
                
                {/* IZQUIERDA: CATÁLOGO */}
                <div className="lg:col-span-7 space-y-4">
                    <VentaCatalogo 
                        tipoVenta={ventaData.tipo_venta}
                        onAdd={(prod) => {

                            const stockMaximo = prod.stock_bodega || 0;
                            
                            setVentaData(prev => {
                                const existe = prev.detalles.find(d => d.id === prod.id);
                                if (existe) {
                                    if (existe.cantidad >= stockMaximo) {
                                        setAlert({ type: 'error', message: 'Stock máximo alcanzado' });
                                        return prev;
                                    }
                                    return { 
                                        ...prev, 
                                        detalles: prev.detalles.map(d => d.id === prod.id ? { ...d, cantidad: d.cantidad + 1 } : d) 
                                    };
                                }

                                if (stockMaximo < 1) {
                                    // setAlert(...)
                                    return prev;
                                }

                                return { ...prev, detalles: [...prev.detalles, { ...prod, cantidad: 1 }] };
                            });
                        }} 
                    />
                </div>

                {/* DERECHA: CARRITO Y PAGO */}
                <div className="lg:col-span-5">
                    <form onSubmit={handleSubmit} className="bg-white border rounded-xl shadow-sm flex flex-col h-[calc(100vh-220px)] sticky top-4">
                        <div className="p-4 border-b bg-slate-50/50 space-y-4">
                            <ClienteSearchSelect form={ventaData} setForm={setVentaData} allowGeneric={true} />
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Método Pago</label>
                                    <select 
                                        value={ventaData.metodo_pago}
                                        onChange={(e) => {
                                            setVentaData({...ventaData, metodo_pago: e.target.value});
                                            setMontoRecibido(''); // [NUEVO] Limpiamos al cambiar
                                        }}
                                        className="w-full border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none"
                                    >
                                        <option value="efectivo">Efectivo</option>
                                        <option value="transferencia"> Transferencia\ Yape - Plin</option>
                                        <option value="tarjeta">Tarjeta</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Tipo Venta</label>
                                    <select 
                                        value={ventaData.tipo_venta}
                                        onChange={(e) => setVentaData({...ventaData, tipo_venta: e.target.value, detalles: []})}
                                        className="w-full border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none"
                                    >
                                        <option value="bodega">Bodega</option>
                                        <option value="mayorista">Mayorista</option>
                                    </select>
                                </div>
                            </div>

                            {/* [NUEVO] INPUT DE PAGO EFECTIVO Y CÁLCULO DE VUELTO */}
                            {ventaData.metodo_pago === 'efectivo' && (
                                <div className={`p-3 rounded-lg border transition-all animate-fade-in-down ${vuelto < 0 ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-xs font-bold text-slate-600 uppercase">Monto Recibido</label>
                                        <span className={`text-xs font-black ${vuelto < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                            Vuelto: S/ {vuelto > 0 ? vuelto.toFixed(2) : '0.00'}
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-slate-400 font-bold">S/</span>
                                        <input 
                                            type="number" min="0" step="0.10" autoFocus
                                            value={montoRecibido}
                                            onChange={(e) => setMontoRecibido(e.target.value)}
                                            className={`w-full pl-8 py-1.5 rounded border font-bold text-lg outline-none focus:ring-2 
                                                ${vuelto < 0 ? 'border-red-300 focus:ring-red-200 text-red-600' : 'border-blue-300 focus:ring-blue-200 text-slate-800'}`}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* LISTA DE PRODUCTOS */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <VentaCarrito 
                                items={ventaData.detalles} 
                                setItems={(newItems) => setVentaData({...ventaData, detalles: newItems})} 
                            />
                        </div>

                        {/* FOOTER TOTALES */}
                        <div className="p-6 bg-slate-900 text-white rounded-b-xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">Total a Cobrar</span>
                                <span className="text-4xl font-black tracking-tight">
                                    S/ {ventaData.detalles.reduce((acc, item) => acc + (item.cantidad * item.precio_venta), 0).toFixed(2)}
                                </span>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || ventaData.detalles.length === 0}
                                className="w-full py-4 bg-blue-600 text-white rounded-lg font-black text-lg shadow-lg shadow-blue-900/30 hover:bg-blue-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        PROCESANDO...
                                    </>
                                ) : 'FINALIZAR VENTA (F8)'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AgregarVenta;