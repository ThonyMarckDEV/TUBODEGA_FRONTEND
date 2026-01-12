import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getProductos, toggleProductoEstado } from 'services/productoService'; 
import LoadingScreen from 'components/Shared/LoadingScreen';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import Table from 'components/Shared/Tables/Table';
import { PencilSquareIcon, FunnelIcon } from '@heroicons/react/24/solid';

const ListarProductos = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [alert, setAlert] = useState(null);
    const [itemToToggle, setItemToToggle] = useState(null);
    
    const [productos, setProductos] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('');

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

    const fetchProductos = useCallback(async (page, search = '', estado = '') => {
        setLoading(true);
        setError(null);
        try {
            const response = await getProductos(page, search, estado);
            setProductos(response.data || []); 
            setPaginationInfo({
                currentPage: response.current_page,
                totalPages: response.last_page,
                totalItems: response.total,
            });
        } catch (err) {
            setError('Error al cargar productos.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProductos(1, searchTerm, filterEstado);
    }, [fetchProductos, filterEstado , searchTerm]);

    const handleSearchTable = (term) => {
        setSearchTerm(term); 
        fetchProductos(1, term, filterEstado);
    };

    const handlePageChange = (page) => {
        fetchProductos(page, searchTerm, filterEstado);
    };

    const handleFilterEstadoChange = (e) => {
        setFilterEstado(e.target.value);
    };

    const executeToggle = async () => {
        if (!itemToToggle) return;
        const nuevoEstado = !itemToToggle.estado; 
        setLoading(true);
        setItemToToggle(null); 

        try {
            const res = await toggleProductoEstado(itemToToggle.id, nuevoEstado);
            setAlert({ type: 'success', message: res.message });
            await fetchProductos(paginationInfo.currentPage, searchTerm, filterEstado); 
        } catch (err) {
            setAlert(err);
            setLoading(false);
        }
    };

    if (loading && productos.length === 0) return <LoadingScreen />;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-slate-800">Productos</h1>
                
                <div className="flex items-center gap-3">
                    {/* FILTRO DE ESTADO */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FunnelIcon className="h-4 w-4 text-gray-400" />
                        </div>
                        <select
                            value={filterEstado}
                            onChange={handleFilterEstadoChange}
                            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-black focus:border-black appearance-none cursor-pointer hover:border-gray-400 transition-colors"
                        >
                            <option value="">Todos los estados</option>
                            <option value="1">Activos</option>
                            <option value="0">Inactivos</option>
                        </select>
                    </div>

                    <Link to="/admin/agregar-producto" className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm font-medium">
                        + Nuevo Producto
                    </Link>
                </div>
            </div>

            <AlertMessage 
                type={alert?.type} 
                message={alert?.message} 
                details={alert?.details} 
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
                pagination={{
                    currentPage: paginationInfo.currentPage,
                    totalPages: paginationInfo.totalPages,
                    onPageChange: handlePageChange
                }}
                onSearch={handleSearchTable} 
                searchPlaceholder="Buscar por nombre o categoría..."
            />
        </div>
    );
};

export default ListarProductos;