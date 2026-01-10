import React from 'react';
import { TrashIcon, PlusIcon, MinusIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

const VentaCarrito = ({ items, setItems }) => {

    const updateCantidad = (id, delta) => {
        const newItems = items.map(item => {
            if (item.id === id) {
                const nuevaCant = item.cantidad + delta;
                // No permitir menos de 1, para borrar usar el bote de basura
                return { ...item, cantidad: nuevaCant > 0 ? nuevaCant : 1 };
            }
            return item;
        });
        setItems(newItems);
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
                                    <div className="text-xs text-gray-500">
                                        Unit: S/ {parseFloat(item.precio_venta).toFixed(2)}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => updateCantidad(item.id, -1)}
                                            className="p-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600"
                                        >
                                            <MinusIcon className="w-3 h-3" />
                                        </button>
                                        <span className="text-sm font-bold w-6 text-center">
                                            {item.cantidad}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => updateCantidad(item.id, 1)}
                                            className="p-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600"
                                        >
                                            <PlusIcon className="w-3 h-3" />
                                        </button>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className="text-sm font-bold text-slate-900">
                                        S/ {(item.cantidad * item.precio_venta).toFixed(2)}
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