import React, { useState, useEffect, useCallback } from 'react';
import { getProductos } from 'services/productoService';
import CategoriaSearchSelect from 'components/Shared/Comboboxes/CategoriaSearchSelect';
import Pagination from './Pagination';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/solid';

const VentaCatalogo = ({ onAdd, tipoVenta }) => {
    const [productos, setProductos] = useState([]);
    const [search, setSearch] = useState('');
    const [cat, setCat] = useState({ id_Categoria: null, categoriaNombre: '' });
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

    const loadProds = useCallback(async (page = 1, terminoManual) => {
        setLoading(true);
        try {
            const valorABuscar = terminoManual !== undefined ? terminoManual : search;
            const resp = await getProductos(page, valorABuscar);
            
            if (resp && resp.data) {
                setProductos(resp.data);
                setPagination({
                    current_page: resp.current_page || 1,
                    last_page: resp.last_page || 1,
                    total: resp.total || 0
                });
            } else {
                setProductos([]);
            }
        } catch (error) {
            console.error("Error al cargar productos:", error);
            setProductos([]);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => { loadProds(1); }, [loadProds]);

    useEffect(() => {
        if (cat.categoriaNombre) {
            setSearch(cat.categoriaNombre);
            loadProds(1, cat.categoriaNombre);
        } else if (cat.id_Categoria === null) {
            setSearch('');
            loadProds(1, '');
        }
    }, [cat.categoriaNombre, cat.id_Categoria, loadProds]);

    return (
        <div className="bg-white p-4 border rounded-xl shadow-sm h-full flex flex-col min-h-[500px]">
            {/* Buscadores */}
            <div className="flex flex-row items-end gap-4 mb-6"> 
                <div className="flex-1">
                    <CategoriaSearchSelect form={cat} setForm={setCat} />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Producto</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            className="w-full h-[38px] border-gray-300 rounded-md shadow-sm pl-10 pr-4 border focus:ring-black focus:border-black text-sm" 
                            placeholder="Ej: Coca Cola..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && loadProds(1)}
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Listado */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col justify-center items-center h-48 opacity-50">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black mb-2"></div>
                        <p className="text-xs font-medium">Cargando...</p>
                    </div>
                ) : productos.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {productos.map(p => (
                            <button
                                key={p.id}
                                onClick={() => onAdd(p)}
                                disabled={p.stock_bodega <= 0}
                                className="p-3 border rounded-xl hover:border-black hover:shadow-md transition-all text-left flex flex-col justify-between h-36 group relative bg-white border-slate-100 disabled:opacity-50 disabled:hover:border-slate-100"
                            >
                                <div className="leading-tight">
                                    <p className="font-bold text-[13px] line-clamp-2 uppercase text-slate-800">{p.nombre}</p>
                                    <p className="text-[10px] mt-1 text-slate-400 font-medium">{p.categoria?.nombre || 'General'}</p>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">Precio</span>
                                        <span className="font-black text-black text-lg leading-none">
                                            S/ {parseFloat(tipoVenta === 'mayorista' ? p.precio_venta_mayorista : p.precio_venta).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className={`text-[10px] px-2 py-1 rounded-lg font-bold ${p.stock_bodega > 5 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                        Stk: {p.stock_bodega}
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                                    <div className="bg-black text-white p-2 rounded-full shadow-lg"><PlusIcon className="w-6 h-6" /></div>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-3xl">
                        <MagnifyingGlassIcon className="w-12 h-12 text-slate-200 mb-2" />
                        <p className="text-slate-400 text-sm font-medium">No se encontraron productos</p>
                    </div>
                )}
            </div>

            {/* Uso del nuevo componente de Paginación */}
            <Pagination 
                current={pagination.current_page}
                last={pagination.last_page}
                total={pagination.total}
                onPageChange={(page) => loadProds(page)}
                loading={loading}
            />
        </div>
    );
};

export default VentaCatalogo;