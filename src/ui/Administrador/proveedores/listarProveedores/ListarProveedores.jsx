import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getProveedores, toggleProveedorEstado } from 'services/proveedorService'; 
import LoadingScreen from 'components/Shared/LoadingScreen';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import Table from 'components/Shared/Tables/Table';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

const ListarProveedores = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [alert, setAlert] = useState(null);
    
    // Estado para el modal de confirmación
    const [itemToToggle, setItemToToggle] = useState(null);
    
    // Datos
    const [proveedores, setProveedores] = useState([]);
    
    // Paginación y Búsqueda
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    // --- COLUMNAS ---
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

    // --- CARGAR DATOS ---
    const fetchProveedores = useCallback(async (page, search = '') => {
        setLoading(true);
        setError(null);
        try {
            const response = await getProveedores(page, search);
            
            // Laravel Paginación: data = array de items, resto = metadatos
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

    // Carga inicial
    useEffect(() => {
        fetchProveedores(1, '');
    }, [fetchProveedores]);

    // Lógica del Buscador
    const handleSearchTable = (term) => {
        setSearchTerm(term); 
        fetchProveedores(1, term);
    };

    // Lógica de Paginación
    const handlePageChange = (page) => {
        fetchProveedores(page, searchTerm);
    };

    // --- MANEJAR CAMBIO DE ESTADO ---
    const executeToggle = async () => {
        if (!itemToToggle) return;
        
        const nuevoEstado = !itemToToggle.estado; 
        setLoading(true);
        setItemToToggle(null); 

        try {
            const res = await toggleProveedorEstado(itemToToggle.id, nuevoEstado);
            setAlert({ type: 'success', message: res.message });
            await fetchProveedores(currentPage, searchTerm); 
        } catch (err) {
            setAlert(err);
            setLoading(false);
        }
    };

    if (loading && proveedores.length === 0) return <LoadingScreen />;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-6">

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Proveedores</h1>
                <Link to="/admin/agregar-proveedor" className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
                    + Nuevo Proveedor
                </Link>
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