import React, { useState, useEffect, useCallback } from 'react';
import { getProductos } from 'services/productoService';
import CategoriaSearchSelect from 'components/Shared/Comboboxes/CategoriaSearchSelect';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/solid';

const VentaCatalogo = ({ onAdd, tipoVenta }) => {
    const [productos, setProductos] = useState([]);
    const [search, setSearch] = useState('');
    const [cat, setCat] = useState({ id_Categoria: null });
    const [loading, setLoading] = useState(false);

    // 1. Usamos useCallback para que la función sea estable
    const loadProds = useCallback(async () => {
        setLoading(true);
        try {
            // Pasamos página 1, el texto de búsqueda y el ID de categoría
            const resp = await getProductos(1, search, cat.id_Categoria);
            setProductos(resp.data || resp.data?.data || []);
        } catch (error) {
            console.error("Error cargando productos:", error);
        } finally {
            setLoading(false);
        }
    }, [search, cat.id_Categoria]);

    // 2. Efecto inicial y cuando cambia la categoría
    useEffect(() => {
        loadProds();
    }, [loadProds]);

    return (
        <div className="bg-white p-4 border rounded-xl shadow-sm h-[calc(100vh-120px)] flex flex-col">
            <div className="flex gap-2 mb-4">
                <div className="flex-1">
                   <CategoriaSearchSelect form={cat} setForm={setCat} />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            className="w-full border-gray-300 rounded-md pl-10 focus:ring-black focus:border-black" 
                            placeholder="Presiona Enter para buscar..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && loadProds()}
                        />
                        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Listado de Productos */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                    </div>
                ) : productos.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {productos.map(p => {
                            // Determinamos qué precio mostrar según el modo del carrito
                            const precioAMostrar = tipoVenta === 'mayorista' ? p.precio_mayorista : p.precio_venta;
                            const stockDisponible = p.stock_bodega;

                            return (
                                <button
                                    key={p.id}
                                    onClick={() => onAdd(p)}
                                    disabled={stockDisponible <= 0}
                                    className="p-3 border rounded-lg hover:border-black hover:shadow-md transition-all text-left flex flex-col justify-between h-36 group relative bg-white"
                                >
                                    <div>
                                        <p className="font-bold text-sm leading-tight mb-1 line-clamp-2">{p.nombre}</p>
                                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                                            {p.categoria?.nombre || 'Sin Categoria'}
                                        </p>
                                    </div>
                                    
                                    <div className="mt-auto">
                                        <div className="flex justify-between items-end">
                                            <span className="font-black text-lg text-slate-900">S/ {parseFloat(precioAMostrar).toFixed(2)}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${stockDisponible > 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                Stock: {stockDisponible}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Overlay al hacer hover */}
                                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                                        <div className="bg-black text-white p-2 rounded-full shadow-lg">
                                            <PlusIcon className="w-6 h-6" />
                                        </div>
                                    </div>

                                    {stockDisponible <= 0 && (
                                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-lg">
                                            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">AGOTADO</span>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-400">
                        No se encontraron productos.
                    </div>
                )}
            </div>
        </div>
    );
};

export default VentaCatalogo;