import React from 'react';
import ReactDOM from 'react-dom'; // Importamos ReactDOM
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const LowStockModal = ({ isOpen, onClose, products }) => {
    if (!isOpen) return null;

    // Usamos createPortal para renderizar fuera del flujo normal
    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            
            {/* OVERLAY (Fondo Oscuro) */}
            {/* Usamos inset-0 para asegurar cobertura total */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
                onClick={onClose} 
            />

            {/* CONTENEDOR DEL MODAL */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 animate-scale-up z-10">
                
                {/* Header */}
                <div className="bg-red-50 p-4 border-b border-red-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                            <ExclamationTriangleIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-red-900">Alerta de Inventario</h3>
                            <p className="text-sm text-red-700">Productos que requieren reposición inmediata</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-red-100 rounded-full text-red-500 transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Body - Lista con Scroll */}
                <div className="p-0 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                    {products.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            ¡Todo en orden! No hay productos con bajo stock.
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 font-bold sticky top-0 shadow-sm">
                                <tr>
                                    <th className="px-6 py-3">Producto</th>
                                    <th className="px-6 py-3 text-center">Stock Actual</th>
                                    <th className="px-6 py-3 text-center">Mínimo</th>
                                    <th className="px-6 py-3 text-center">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {products.map((prod) => (
                                    <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-3 font-medium text-slate-800">{prod.nombre}</td>
                                        <td className="px-6 py-3 text-center">
                                            <span className="font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                                                {prod.stock_bodega} {prod.unidad}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-center text-slate-500">{prod.stock_minimo} {prod.unidad}</td>
                                        <td className="px-6 py-3 text-center">
                                            {prod.stock_bodega === 0 ? (
                                                <span className="text-xs font-bold text-red-700 uppercase">Agotado</span>
                                            ) : (
                                                <span className="text-xs font-bold text-orange-600 uppercase">Crítico</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-black font-medium transition-all shadow-md hover:shadow-lg"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>,
        document.body // <--- AQUÍ ESTÁ EL TRUCO: Lo renderizamos directamente en el body
    );
};

export default LowStockModal;