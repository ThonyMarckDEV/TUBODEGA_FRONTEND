import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
// Asegúrate de que la ruta sea correcta
import { getProductos, toggleProductoEstado } from 'services/productoService'; 
import LoadingScreen from 'components/Shared/LoadingScreen';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import Table from 'components/Shared/Tables/Table';
import { PencilSquareIcon } from '@heroicons/react/24/solid';

const ListarProductos = () => {
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [itemToToggle, setItemToToggle] = useState(null);
    
    const [productos, setProductos] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });

    // --- ESTADO DE FILTROS ---
    const [filters, setFilters] = useState({
        search: '',
        estado: ''
    });

    // --- REFERENCIA DE FILTROS  ---
    const filtersRef = useRef(filters);
    useEffect(() => {
        filtersRef.current = filters;
    }, [filters]);

    // --- CONFIGURACIÓN VISUAL DE FILTROS ---
    const filterConfig = useMemo(() => [
        {
            name: 'search',
            type: 'text',
            label: 'Buscador',
            placeholder: 'Nombre del producto o categoría...',
            colSpan: 'md:col-span-4'
        },
        {
            name: 'estado',
            type: 'select',
            label: 'Estado',
            options: [
                { value: '', label: 'Todos' },
                { value: '1', label: 'Activos' },
                { value: '0', label: 'Inactivos' }
            ],
            colSpan: 'md:col-span-4'
        }
    ], []);

    // --- 4. FETCH DATA ---
    const fetchProductos = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            // Leemos los filtros desde la referencia para no reiniciar la función
            const currentFilters = filtersRef.current;
            
            // Llamamos al servicio con los parámetros separados
            const response = await getProductos(
                page, 
                currentFilters.search, 
                currentFilters.estado
            );
            
            setProductos(response.data || []); 
            setPaginationInfo({
                currentPage: response.current_page || 1,
                totalPages: response.last_page || 1,
                totalItems: response.total || 0,
            });
        } catch (err) {
            setAlert({ type: 'error', message: 'Error al cargar productos.' });
        } finally {
            setLoading(false);
        }
    }, []); 

    // Carga inicial (Solo una vez)
    useEffect(() => {
        fetchProductos(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- HANDLERS ---
    const handleFilterChange = useCallback((name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleFilterSubmit = useCallback(() => {
        fetchProductos(1);
    }, [fetchProductos]);

    const handleFilterClear = useCallback(() => {
        const cleanFilters = { search: '', estado: '' };
        setFilters(cleanFilters);
        filtersRef.current = cleanFilters; // Actualizamos ref inmediatamente
        fetchProductos(1);
    }, [fetchProductos]);

    // --- ACCIONES ---
    const executeToggle = async () => {
        if (!itemToToggle) return;
        const nuevoEstado = !itemToToggle.estado; 
        
        setItemToToggle(null); 
        setLoading(true);

        try {
            const res = await toggleProductoEstado(itemToToggle.id, nuevoEstado);
            setAlert({ type: 'success', message: res.message });
            await fetchProductos(paginationInfo.currentPage); 
        } catch (err) {
            setAlert({ type: 'error', message: err.message || 'Error al cambiar estado' });
            setLoading(false);
        }
    };

    // --- COLUMNAS ---
    const columns = useMemo(() => [
        {
            header: 'Producto',
            render: (row) => (
                <div>
                    <div className="font-bold text-gray-800">{row.nombre}</div>
                    <div className="text-xs text-gray-500">{row.categoria?.nombre || 'Sin categoría'}</div>
                </div>
            )
        },
        {
            header: 'Unidad',
            render: (row) => (
                <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200 uppercase">
                    {row.unidad}
                </span>
            )
        },
        {
            header: 'Precios (S/.)',
            render: (row) => (
                <div className="flex flex-col text-xs">
                    <span className="text-slate-500">Normal: <b className="text-slate-800">S/. {parseFloat(row.precio_venta).toFixed(2)}</b></span>
                    <span className="text-indigo-500 font-medium">Mayorista: <b className="text-indigo-700">S/. {parseFloat(row.precio_venta_mayorista).toFixed(2)}</b></span>
                </div>
            )
        },
        {
            header: 'Stock Bodega',
            render: (row) => (
                <div className="flex flex-col">
                    <span className={`font-bold ${row.stock_bodega <= row.stock_minimo ? 'text-red-600' : 'text-emerald-600'}`}>
                        {row.stock_bodega}
                    </span>
                    {row.stock_bodega <= row.stock_minimo && (
                        <span className="text-[10px] uppercase font-bold text-red-500 bg-red-50 px-1 rounded w-fit">
                            Bajo Stock
                        </span>
                    )}
                </div>
            )
        },
        {
            header: 'Stock Almacén',
            render: (row) => (
                <span className="font-semibold text-blue-700">
                    {row.stock_almacen}
                </span>
            )
        },
        {
            header: 'Estado',
            render: (row) => (
                <button 
                    onClick={() => setItemToToggle({ id: row.id, estado: row.estado })}
                    className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${
                        row.estado 
                            ? 'text-green-700 bg-green-100 hover:bg-red-100 hover:text-red-700' 
                            : 'text-red-700 bg-red-100 hover:bg-green-100 hover:text-green-700'
                    }`}
                >
                    {row.estado ? 'ACTIVO' : 'INACTIVO'}
                </button>
            )
        },
        {
            header: 'Acciones',
            render: (row) => (
                <Link 
                    to={`/admin/editar-producto/${row.id}`} 
                    className="w-fit flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium text-sm bg-indigo-50 px-2 py-1 rounded transition-colors"
                    title="Editar Producto"
                >
                    <PencilSquareIcon className="w-4 h-4" /> Editar
                </Link>
            )
        }
    ], []);

    if (loading && productos.length === 0) return <LoadingScreen />;

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Productos</h1>
                <Link to="/admin/agregar-producto" className="btn-primary-shadow">
                    + Nuevo Producto
                </Link>
            </div>

            <AlertMessage 
                type={alert?.type} 
                message={alert?.message} 
                onClose={() => setAlert(null)} 
            />

            {itemToToggle && (
                <ConfirmModal
                    message={`¿Estás seguro de ${itemToToggle.estado ? 'desactivar' : 'activar'} este producto?`}
                    onConfirm={executeToggle}
                    onCancel={() => setItemToToggle(null)}
                />
            )}

            <Table 
                columns={columns}
                data={productos}
                loading={loading}
                
                // Configuración de Filtros
                filterConfig={filterConfig}
                filters={filters}
                onFilterChange={handleFilterChange}
                onFilterSubmit={handleFilterSubmit}
                onFilterClear={handleFilterClear}

                pagination={{
                    currentPage: paginationInfo.currentPage,
                    totalPages: paginationInfo.totalPages,
                    onPageChange: (page) => fetchProductos(page)
                }}
            />
        </div>
    );
};

export default ListarProductos;