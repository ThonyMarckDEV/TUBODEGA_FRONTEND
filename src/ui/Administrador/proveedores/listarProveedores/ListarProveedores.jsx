import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getProveedores, toggleProveedorEstado } from 'services/proveedorService'; 
import LoadingScreen from 'components/Shared/LoadingScreen';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import Table from 'components/Shared/Tables/Table';
import { PencilSquareIcon, FunnelIcon } from '@heroicons/react/24/outline';

const ListarProveedores = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [alert, setAlert] = useState(null);
    
    const [itemToToggle, setItemToToggle] = useState(null);
    const [proveedores, setProveedores] = useState([]);
    
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('');

    const fetchProveedores = useCallback(async (page, search = '', estado = '') => {
        setLoading(true);
        setError(null);
        try {
            const response = await getProveedores(page, search, estado);
            
            setProveedores(response.data || []); 
            setPaginationInfo({
                currentPage: response.current_page,
                totalPages: response.last_page,
                totalItems: response.total,
            });

        } catch (err) {
            setError('Error al cargar proveedores.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProveedores(1, searchTerm, filterEstado);
    }, [fetchProveedores, filterEstado, searchTerm]);


    const handleSearchTable = (term) => {
        setSearchTerm(term); 
    };

    const handlePageChange = (page) => {
        fetchProveedores(page, searchTerm, filterEstado);
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
            const res = await toggleProveedorEstado(itemToToggle.id, nuevoEstado);
            setAlert({ type: 'success', message: res.message });
            await fetchProveedores(paginationInfo.currentPage, searchTerm, filterEstado); 
        } catch (err) {
            setAlert(err);
            setLoading(false);
        }
    };

    const columns = useMemo(() => [
        {
            header: 'Razón Social',
            render: (row) => <span className="font-semibold text-gray-800">{row.razon_social}</span>
        },
        {
            header: 'RUC',
            render: (row) => row.ruc || <span className="text-gray-400">N/A</span>
        },
        {
            header: 'Teléfono',
            render: (row) => row.telefono || <span className="text-gray-400">N/A</span>
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
                    to={`/admin/editar-proveedor/${row.id}`} 
                    className="w-fit flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium text-sm bg-indigo-50 px-2 py-1 rounded transition-colors"
                    title="Editar Proveedor"
                >
                    <PencilSquareIcon className="w-4 h-4" /> Editar
                </Link>
            )
        }
    ], []);

    if (loading && proveedores.length === 0) return <LoadingScreen />;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-6">

            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-slate-800">Proveedores</h1>
                
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

                    <Link to="/admin/agregar-proveedor" className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm font-medium">
                        + Nuevo Proveedor
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
                    message={`¿Estás seguro de ${itemToToggle.estado ? 'desactivar' : 'activar'} a este proveedor?`}
                    onConfirm={executeToggle}
                    onCancel={() => setItemToToggle(null)}
                />
            )}

            <Table 
                columns={columns}
                data={proveedores}
                loading={loading}
                pagination={{
                    currentPage: paginationInfo.currentPage,
                    totalPages: paginationInfo.totalPages,
                    onPageChange: handlePageChange
                }}
                onSearch={handleSearchTable} 
                searchPlaceholder="Buscar por Razón Social o RUC..."
            />
        </div>
    );
};

export default ListarProveedores;