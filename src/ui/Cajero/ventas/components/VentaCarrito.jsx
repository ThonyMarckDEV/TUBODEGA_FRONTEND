import React from 'react';
import { TrashIcon, PlusIcon, MinusIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

const VentaCarrito = ({ items, setItems }) => {

    // 1. Lógica para botones (+ / -)
    const updateCantidad = (id, delta) => {
        const newItems = items.map(item => {
            if (item.id === id) {
                const stockMaximo = item.stock_bodega || 0; // Usamos el dato del JSON
                let nuevaCant = item.cantidad + delta;

                // Validaciones
                if (nuevaCant < 1) nuevaCant = 1;
                if (nuevaCant > stockMaximo) nuevaCant = stockMaximo;

                return { ...item, cantidad: nuevaCant };
            }
            return item;
        });
        setItems(newItems);
    };

    // 2. Lógica para escritura manual (Input)
    const handleManualInput = (id, valorString) => {
        const newItems = items.map(item => {
            if (item.id === id) {
                const stockMaximo = item.stock_bodega || 0;
                
                // Si el usuario borra todo, dejamos vacío temporalmente o ponemos 1
                if (valorString === '') return { ...item, cantidad: '' };

                let valorNumerico = parseInt(valorString, 10);
                
                if (isNaN(valorNumerico) || valorNumerico < 1) valorNumerico = 1;

                // Si se pasa del stock, lo seteamos al máximo automáticamente
                if (valorNumerico > stockMaximo) {
                    valorNumerico = stockMaximo; 
                }

                return { ...item, cantidad: valorNumerico };
            }
            return item;
        });
        setItems(newItems);
    };

    // 3. Al perder el foco (onBlur), si dejó vacío, poner 1
    const handleBlur = (id, valor) => {
        if (valor === '' || valor === 0) {
             const newItems = items.map(item => 
                item.id === id ? { ...item, cantidad: 1 } : item
             );
             setItems(newItems);
        }
    };

    const removeItem = (id) => {
        setItems(items.filter(item => item.id !== id));
    };

    return (
        <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                    <ShoppingCartIcon className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-sm font-medium">El carrito está vacío</p>
                    <p className="text-xs">Selecciona productos del catálogo para comenzar</p>
                </div>
            ) : (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-2 text-left text-[10px] font-bold text-gray-500 uppercase">Prod</th>
                            <th className="px-4 py-2 text-center text-[10px] font-bold text-gray-500 uppercase">Cant</th>
                            <th className="px-4 py-2 text-right text-[10px] font-bold text-gray-500 uppercase">Subtotal</th>
                            <th className="px-4 py-2"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {items.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="text-sm font-medium text-slate-900 leading-tight">
                                        {item.nombre}
                                    </div>
                                    <div className="text-xs text-gray-500 flex gap-2 mt-1">
                                        <span className="uppercase font-medium text-slate-400">
                                            {item.unidad || 'UND'}:
                                        </span> 
                                        <span>S/ {parseFloat(item.precio_venta).toFixed(2)}</span>
                                        {/* Mostramos el Stock disponible visualmente */}
                                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1 rounded">
                                            Stock: {item.stock_bodega}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => updateCantidad(item.id, -1)}
                                            className="p-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 active:bg-gray-300"
                                        >
                                            <MinusIcon className="w-3 h-3" />
                                        </button>
                                        
                                        {/* INPUT PARA ESCRIBIR MANUALMENTE */}
                                        <input 
                                            type="number"
                                            className="w-12 text-center text-sm font-bold border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none p-1 no-spinners"
                                            value={item.cantidad}
                                            onChange={(e) => handleManualInput(item.id, e.target.value)}
                                            onBlur={() => handleBlur(item.id, item.cantidad)}
                                            min="1"
                                            max={item.stock_bodega}
                                        />

                                        <button
                                            type="button"
                                            onClick={() => updateCantidad(item.id, 1)}
                                            // Deshabilitamos si ya llegó al tope
                                            disabled={item.cantidad >= item.stock_bodega}
                                            className={`p-1 rounded-md text-gray-600 ${item.cantidad >= item.stock_bodega ? 'bg-gray-50 opacity-50 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 active:bg-gray-300'}`}
                                        >
                                            <PlusIcon className="w-3 h-3" />
                                        </button>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className="text-sm font-bold text-slate-900">
                                        S/ {((item.cantidad === '' ? 0 : item.cantidad) * item.precio_venta).toFixed(2)}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        type="button"
                                        onClick={() => removeItem(item.id)}
                                        className="text-red-400 hover:text-red-600 transition-colors"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default VentaCarrito;