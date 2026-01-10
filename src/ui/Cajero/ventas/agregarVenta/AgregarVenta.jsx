import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { storeVenta } from 'services/ventaService';
// Componentes que crearemos
import VentaCarrito from '../components/VentaCarrito';
import VentaCatalogo from '../components/VentaCatalogo';
import ClienteSearchSelect from 'components/Shared/Comboboxes/ClienteSearchSelect';

const AgregarVenta = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);
    
    const initialVentaData = {
        cliente_id: null, // Se usará para el envío
        id_Cliente: null, // El que usa tu SearchSelect
        clienteNombre: 'Público General',
        clienteData: {},  // Datos para el comprobante (RUC/DNI)
        metodo_pago: 'efectivo',
        tipo_venta: 'bodega',
        detalles: []
    };

    const [ventaData, setVentaData] = useState(initialVentaData);

   const resetForm = () => {
        setVentaData(initialVentaData);
        setAlert({ type: 'success', message: 'Venta procesada correctamente.' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (ventaData.detalles.length === 0) {
            setAlert({ type: 'error', message: 'Agregue al menos un producto.' });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                cliente_id: ventaData.id_Cliente, 
                cliente: ventaData.clienteData,
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
                resetForm();
            } else {
                setAlert(response);
            }
        } catch (error) {
            setAlert({ type: 'error', message: 'Error de conexión.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-[1600px]">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Punto de Venta</h1>
                <div className="flex gap-4">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold uppercase">
                        Modo: {ventaData.tipo_venta}
                    </span>
                </div>
            </header>

            <AlertMessage {...alert} onClose={() => setAlert(null)} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* COLUMNA IZQUIERDA: BUSCADOR Y CATÁLOGO */}
                <div className="lg:col-span-7 space-y-4">
                    <VentaCatalogo 
                        tipoVenta={ventaData.tipo_venta}
                        onAdd={(prod) => {
                            setVentaData(prev => {
                                const existe = prev.detalles.find(d => d.id === prod.id);
                                if (existe) return prev; // O aumentar cantidad
                                return { ...prev, detalles: [...prev.detalles, { ...prod, cantidad: 1 }] };
                            });
                        }} 
                    />
                </div>

                {/* COLUMNA DERECHA: CARRITO Y CLIENTE */}
                <div className="lg:col-span-5">
                    <form onSubmit={handleSubmit} className="bg-white border rounded-xl shadow-sm flex flex-col h-[calc(100vh-200px)]">
                        <div className="p-4 border-b space-y-4">
                            {/* Selector de Cliente */}
                            <ClienteSearchSelect 
                                form={ventaData} 
                                setForm={setVentaData}
                                allowGeneric={true}
                            />
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Método Pago</label>
                                    <select 
                                        value={ventaData.metodo_pago}
                                        onChange={(e) => setVentaData({...ventaData, metodo_pago: e.target.value})}
                                        className="w-full border-gray-300 rounded-md text-sm"
                                    >
                                        <option value="efectivo">Efectivo</option>
                                        <option value="transferencia">Transferencia / Yape</option>
                                        <option value="credito">Crédito</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Tipo Precio</label>
                                    <select 
                                        value={ventaData.tipo_venta}
                                        onChange={(e) => setVentaData({...ventaData, tipo_venta: e.target.value, detalles: []})}
                                        className="w-full border-gray-300 rounded-md text-sm"
                                    >
                                        <option value="bodega">Bodega (Menudeo)</option>
                                        <option value="mayorista">Mayorista</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* LISTA DE PRODUCTOS SELECCIONADOS */}
                        <VentaCarrito 
                            items={ventaData.detalles} 
                            setItems={(newItems) => setVentaData({...ventaData, detalles: newItems})} 
                        />

                        {/* TOTAL Y BOTÓN */}
                        <div className="p-6 bg-slate-50 border-t rounded-b-xl">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-gray-600 font-medium">Total a Pagar:</span>
                                <span className="text-3xl font-black text-slate-900">
                                    S/ {ventaData.detalles.reduce((acc, item) => acc + (item.cantidad * item.precio_venta), 0).toFixed(2)}
                                </span>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || ventaData.detalles.length === 0}
                                className="w-full py-4 bg-black text-white rounded-lg font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Procesando...' : 'COMPLETAR VENTA (F8)'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AgregarVenta;