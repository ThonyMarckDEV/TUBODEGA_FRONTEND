import React, { useState, useEffect, useCallback } from 'react';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { storeVenta } from 'services/ventaService';
import { getComprobantePdf } from 'services/comprobanteService'; 

import VentaCarrito from '../components/VentaCarrito';
import VentaCatalogo from '../components/VentaCatalogo';
import ClienteSearchSelect from 'components/Shared/Comboboxes/ClienteSearchSelect';
import PdfModal from 'components/Shared/Modals/PdfModal';

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
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);
    const [showPdf, setShowPdf] = useState(false);
    const [pdfUrl, setPdfUrl] = useState('');
    const [pdfTitle, setPdfTitle] = useState('');


    const [ventaData, setVentaData] = useState(initialVentaData);

    const resetForm = useCallback(() => {
        setVentaData(initialVentaData);
    }, []);

    // 1. Usamos el servicio que ya devuelve el URL.createObjectURL(blob)
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

        setLoading(true);
        try {
            const payload = {
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
                
                // Ahora resetForm es estable y no dará problemas aquí
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
    }, [ventaData, handleShowComprobante, resetForm]);

    // Listener F8 y limpieza de memoria
    useEffect(() => {
        const handleKeyDown = (e) => { if (e.key === 'F8') handleSubmit(); };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (pdfUrl) URL.revokeObjectURL(pdfUrl); // Evita fugas de memoria
        };
    }, [handleSubmit, pdfUrl]);

    return (
        <div className="container mx-auto p-4 max-w-[1600px]">
            <PdfModal 
                isOpen={showPdf} 
                onClose={() => setShowPdf(false)} 
                title={pdfTitle}
                pdfUrl={pdfUrl}
            />

            <header className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Punto de Venta</h1>
                <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase">
                    Modo: {ventaData.tipo_venta}
                </span>
            </header>

            <AlertMessage {...alert} onClose={() => setAlert(null)} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 space-y-4">
                    <VentaCatalogo 
                        tipoVenta={ventaData.tipo_venta}
                        onAdd={(prod) => {
                            setVentaData(prev => {
                                const existe = prev.detalles.find(d => d.id === prod.id);
                                if (existe) {
                                    return {
                                        ...prev,
                                        detalles: prev.detalles.map(d => 
                                            d.id === prod.id ? { ...d, cantidad: d.cantidad + 1 } : d
                                        )
                                    };
                                }
                                return { ...prev, detalles: [...prev.detalles, { ...prod, cantidad: 1 }] };
                            });
                        }} 
                    />
                </div>

                <div className="lg:col-span-5">
                    <form onSubmit={handleSubmit} className="bg-white border rounded-xl shadow-sm flex flex-col h-[calc(100vh-180px)]">
                        <div className="p-4 border-b bg-slate-50/50 space-y-4">
                            <ClienteSearchSelect form={ventaData} setForm={setVentaData} allowGeneric={true} />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase">Método Pago</label>
                                    <select 
                                        value={ventaData.metodo_pago}
                                        onChange={(e) => setVentaData({...ventaData, metodo_pago: e.target.value})}
                                        className="w-full border-slate-300 rounded-lg text-sm"
                                    >
                                        <option value="efectivo">Efectivo</option>
                                        <option value="transferencia">Transferencia/Yape-Plin</option>
                                        <option value="tarjeta">Tarjeta</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase">Tipo Venta</label>
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
                                <span className="text-slate-400 font-bold uppercase text-xs">Total</span>
                                <span className="text-4xl font-black">
                                    S/ {ventaData.detalles.reduce((acc, item) => acc + (item.cantidad * item.precio_venta), 0).toFixed(2)}
                                </span>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || ventaData.detalles.length === 0}
                                className="w-full py-4 bg-blue-600 text-white rounded-lg font-black text-lg hover:bg-blue-500 disabled:opacity-50"
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