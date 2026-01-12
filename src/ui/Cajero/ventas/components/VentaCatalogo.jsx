import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getProductos } from 'services/productoService';
import CategoriaSearchSelect from 'components/Shared/Comboboxes/CategoriaSearchSelect';
import Pagination from './Pagination';
import { MagnifyingGlassIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/solid';

const VentaCatalogo = ({ onAdd, tipoVenta }) => {
    const [productos, setProductos] = useState([]);
    const [search, setSearch] = useState(''); 
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [cat, setCat] = useState({ id_Categoria: null, categoriaNombre: '' });

    const searchRef = useRef('');
    useEffect(() => { searchRef.current = search; }, [search]);

    const loadProds = useCallback(async (page = 1, terminoManual) => {
        setLoading(true);
        try {
            const valorABuscar = terminoManual !== undefined ? terminoManual : searchRef.current;
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
    }, []);

    useEffect(() => {
        loadProds(1, '');
    }, [loadProds]);

    useEffect(() => {
        if (cat.id_Categoria !== null) {
            setSearch(cat.categoriaNombre);
            loadProds(1, cat.categoriaNombre);
        } else {
            setSearch('');
            loadProds(1, '');
        }
    }, [cat.id_Categoria, cat.categoriaNombre, loadProds]);

    const handleClearSearch = () => {
        setSearch('');
        loadProds(1, ''); 
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            loadProds(1);
        }
    };

    const handleAddToCarrito = (producto) => {
        const precioAplicado = tipoVenta === 'mayorista' 
            ? producto.precio_venta_mayorista 
            : producto.precio_venta;

        onAdd({ 
            ...producto, 
            precio_venta: precioAplicado 
        });
    };

    return (
        <div className="bg-white p-4 border rounded-xl shadow-sm h-full flex flex-col min-h-[500px]">
            <div className="flex flex-row items-start gap-4 mb-6"> 
                <div className="flex-1">
                    <CategoriaSearchSelect form={cat} setForm={setCat} />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Producto</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            className="w-full h-[38px] border-gray-300 rounded-md shadow-sm pl-10 pr-10 border focus:ring-black focus:border-black text-sm" 
                            placeholder="Buscar y presionar Enter..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleKeyDown} 
                        />
                        <button type="button" onClick={() => loadProds(1)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <MagnifyingGlassIcon className="w-5 h-5" />
                        </button>
                        {search && (
                            <button type="button" onClick={handleClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                    <div className="flex justify-center items-center h-48 animate-pulse text-sm font-medium">Cargando...</div>
                ) : productos.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {productos.map(p => (
                            <button
                                key={p.id}
                                onClick={() => handleAddToCarrito(p)}
                                disabled={p.stock_bodega <= 0}
                                className={`p-3 border rounded-xl hover:shadow-md transition-all text-left flex flex-col justify-between h-40 group relative bg-white disabled:opacity-50 ${tipoVenta === 'mayorista' ? 'hover:border-indigo-500' : 'hover:border-black'}`}
                            >
                                <div className="leading-tight">
                                    <p className="font-bold text-[13px] line-clamp-2 uppercase text-slate-800">{p.nombre}</p>
                                    <span className="text-[10px] text-slate-400 font-medium uppercase mt-1 inline-block">
                                        {p.categoria?.nombre || 'General'}
                                    </span>
                                </div>

                                <div className="flex justify-between items-end mt-2">
                                    <div className="flex flex-col">
                                        {/* Texto dinámico según el tipo de venta */}
                                        <span className={`text-[9px] font-bold uppercase ${tipoVenta === 'mayorista' ? 'text-indigo-600' : 'text-slate-400'}`}>
                                            {tipoVenta === 'mayorista' ? 'P. Mayorista' : 'P. Público'}
                                        </span>
                                        <span className={`font-black text-lg leading-none ${tipoVenta === 'mayorista' ? 'text-indigo-700' : 'text-black'}`}>
                                            S/ {parseFloat(tipoVenta === 'mayorista' ? p.precio_venta_mayorista : p.precio_venta).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md uppercase">
                                            {p.unidad || 'und'}
                                        </span>
                                        <div className={`text-[10px] px-2 py-0.5 rounded font-bold ${p.stock_bodega > p.stock_minimo ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                                            Stk: {p.stock_bodega}
                                        </div>
                                    </div>
                                </div>

                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl ${tipoVenta === 'mayorista' ? 'bg-indigo-500/5' : 'bg-black/5'}`}>
                                    <div className={`${tipoVenta === 'mayorista' ? 'bg-indigo-600' : 'bg-black'} text-white p-2 rounded-full shadow-lg`}>
                                        <PlusIcon className="w-6 h-6" />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-3xl text-slate-400 text-sm">
                        No hay resultados.
                    </div>
                )}
            </div>

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