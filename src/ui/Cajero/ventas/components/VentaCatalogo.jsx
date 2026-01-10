import React, { useState, useEffect, useCallback } from 'react';
import { getProductos } from 'services/productoService';
import CategoriaSearchSelect from 'components/Shared/Comboboxes/CategoriaSearchSelect';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/solid';

const VentaCatalogo = ({ onAdd, tipoVenta }) => {
    const [productos, setProductos] = useState([]);
    const [search, setSearch] = useState('');
    const [cat, setCat] = useState({ id_Categoria: null, categoriaNombre: '' });
    const [loading, setLoading] = useState(false);

    const loadProds = useCallback(async (terminoManual) => {
        setLoading(true);
        try {
            // Si no se pasa término manual, usa el estado 'search'
            const valorABuscar = terminoManual !== undefined ? terminoManual : search;
            const resp = await getProductos(1, valorABuscar);
            const data = resp.data?.data || resp.data || [];
            setProductos(data);
        } catch (error) {
            console.error("Error al cargar productos:", error);
        } finally {
            setLoading(false);
        }
    }, [search]);

    // 1. Carga inicial
    useEffect(() => {
        loadProds();
    }, []);

    // 2. EFECTO: Recargar cuando el buscador se limpia manualmente
    useEffect(() => {
        if (search === '' && !cat.categoriaNombre) {
            loadProds('');
        }
    }, [search, cat.categoriaNombre, loadProds]);

    // 3. EFECTO: Cuando cambia la categoría en el select
    useEffect(() => {
        if (cat.categoriaNombre) {
            setSearch(cat.categoriaNombre);
            loadProds(cat.categoriaNombre);
        } else if (cat.id_Categoria === null) {
            setSearch('');
            loadProds('');
        }
    }, [cat.categoriaNombre, cat.id_Categoria]);

    return (
       <div className="bg-white p-4 border rounded-xl shadow-sm h-full flex flex-col">
            {/* Contenedor con items-end para alinear las cajas por la base */}
            <div className="flex flex-row items-end gap-4 mb-6"> 
                
                {/* 1. Buscador de Categoría */}
                <div className="flex-1">
                    {/* El label está dentro de este componente */}
                    <CategoriaSearchSelect form={cat} setForm={setCat} />
                </div>

                {/* 2. Buscador de Nombre de Producto */}
                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Nombre del Producto
                    </label>
                    <div className="relative">
                        <input 
                            type="text" 
                            // h-[38px] suele ser la altura exacta de los inputs de Tailwind Forms / Flowbite
                            // Agregamos py-0 para que el padding interno no empuje la altura
                            className="w-full h-[38px] py-0 border-gray-300 rounded-md shadow-sm pl-10 pr-4 border focus:ring-1 focus:ring-black focus:border-black text-sm transition-all" 
                            placeholder="Ej: Coca Cola..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && loadProds()}
                        />
                        {/* Icono centrado con top-1/2 y -translate-y-1/2 */}
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Catálogo de Productos */}
            <div className="flex-1 overflow-y-auto pr-2 min-h-0 custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col justify-center items-center h-48 opacity-50">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black mb-2"></div>
                        <p className="text-xs font-medium">Cargando catálogo...</p>
                    </div>
                ) : productos.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                        {productos.map(p => (
                            <button
                                key={p.id}
                                onClick={() => onAdd(p)}
                                disabled={p.stock_bodega <= 0}
                                className="p-3 border rounded-xl hover:border-black hover:shadow-md transition-all text-left flex flex-col justify-between h-36 group relative bg-white border-slate-100"
                            >
                                <div className="leading-tight">
                                    <p className="font-bold text-[13px] line-clamp-2 uppercase text-slate-800 group-hover:text-black">
                                        {p.nombre}
                                    </p>
                                    <p className="text-[10px] mt-1 text-slate-400 font-medium">
                                        {p.categoria?.nombre || 'General'}
                                    </p>
                                </div>

                                <div className="flex justify-between items-end mt-2">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">Precio</span>
                                        <span className="font-black text-black text-lg">
                                            S/ {parseFloat(tipoVenta === 'mayorista' ? p.precio_mayorista : p.precio_venta).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className={`text-[10px] px-2 py-1 rounded-lg font-bold shadow-sm ${
                                        p.stock_bodega > 5 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                    }`}>
                                        Stk: {p.stock_bodega}
                                    </div>
                                </div>

                                {/* Overlay de hover mejorado */}
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                                    <div className="bg-black text-white p-2 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                                        <PlusIcon className="w-6 h-6" />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-3xl">
                        <MagnifyingGlassIcon className="w-12 h-12 text-slate-200 mb-2" />
                        <p className="text-slate-400 text-sm font-medium">No hay resultados para tu búsqueda</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VentaCatalogo;