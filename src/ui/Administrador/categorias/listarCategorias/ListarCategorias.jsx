import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getCategorias, toggleCategoriaEstado } from 'services/categoriaService'; 
import LoadingScreen from 'components/Shared/LoadingScreen';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import Table from 'components/Shared/Tables/Table';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

const ListarCategorias = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [alert, setAlert] = useState(null);
    
    // Estado para el modal de confirmación
    const [itemToToggle, setItemToToggle] = useState(null);
    
    // Datos de la tabla
    const [categorias, setCategorias] = useState([]);
    
    // Paginación
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
    const [currentPage, setCurrentPage] = useState(1);

    const [searchTerm, setSearchTerm] = useState('');

    // --- COLUMNAS ---
    const columns = useMemo(() => [
        {
            header: 'Nombre',
            render: (row) => <span className="font-semibold text-gray-700">{row.nombre}</span>
        },
        {
            header: 'Descripción',
            render: (row) => row.descripcion || <span className="text-gray-400 italic">Sin descripción</span>
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
                    to={`/admin/editar-categoria/${row.id}`} 
                    className="w-fit flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium text-sm bg-indigo-50 px-2 py-1 rounded transition-colors"
                    title="Editar Categoría"
                >
                    <PencilSquareIcon className="w-4 h-4" /> Editar
                </Link>
            )
        }
    ], []);

    // --- CARGAR DATOS  ---
    const fetchCategorias = useCallback(async (page, search = '') => {
        setLoading(true);
        setError(null);
        try {
            const response = await getCategorias(page, search);

            setCategorias(response.data || []); 

            setPaginationInfo({
                currentPage: response.current_page,
                totalPages: response.last_page,
                totalItems: response.total,
            });

        } catch (err) {
            setError('Error al cargar categorías.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

   // Carga inicial
    useEffect(() => {
        fetchCategorias(1, '');
    }, [fetchCategorias]);

    const handleSearchTable = (term) => {
        setSearchTerm(term); 
        fetchCategorias(1, term);
    };
    const handlePageChange = (page) => {
        fetchCategorias(page, searchTerm);
    };

    // --- MANEJAR CAMBIO DE ESTADO ---
    const executeToggle = async () => {
        if (!itemToToggle) return;
        
        const nuevoEstado = !itemToToggle.estado; 
        
        setLoading(true);
        setItemToToggle(null); 

        try {
            const res = await toggleCategoriaEstado(itemToToggle.id, nuevoEstado);
            setAlert({ type: 'success', message: res.message });
            await fetchCategorias(currentPage); 
        } catch (err) {
            setAlert(err);
            setLoading(false);
        }
    };


    if (loading && categorias.length === 0) return <LoadingScreen />;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-6">

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Categorías</h1>
                <Link to="/admin/agregar-categoria" className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
                    + Nueva Categoría
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
                    message={`¿Estás seguro de ${itemToToggle.estado ? 'desactivar' : 'activar'} esta categoría?`}
                    onConfirm={executeToggle}
                    onCancel={() => setItemToToggle(null)}
                />
            )}

            <Table 
                columns={columns}
                data={categorias}
                loading={loading}
                pagination={{
                    currentPage: paginationInfo.currentPage,
                    totalPages: paginationInfo.totalPages,
                    onPageChange: handlePageChange
                }}
                onSearch={handleSearchTable} 
                searchPlaceholder="Buscar por nombre..."
            />
        </div>
    );
};

export default ListarCategorias;