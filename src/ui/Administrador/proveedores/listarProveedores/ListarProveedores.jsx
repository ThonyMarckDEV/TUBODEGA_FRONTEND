import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
// Asegúrate de que la ruta sea correcta
import { getProveedores, toggleProveedorEstado } from 'services/proveedorService'; 
import LoadingScreen from 'components/Shared/LoadingScreen';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import Table from 'components/Shared/Tables/Table';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

const ListarProveedores = () => {
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [itemToToggle, setItemToToggle] = useState(null);
    
    const [proveedores, setProveedores] = useState([]);
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
            placeholder: 'Razón Social o RUC...',
            colSpan: 'md:col-span-7'
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

    // --- 4. FETCH DATA  ---
    const fetchProveedores = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const currentFilters = filtersRef.current;

            const response = await getProveedores(
                page, 
                currentFilters.search, 
                currentFilters.estado
            );
            
            setProveedores(response.data || []); 
            setPaginationInfo({
                currentPage: response.current_page || 1,
                totalPages: response.last_page || 1,
                totalItems: response.total || 0,
            });

        } catch (err) {
            setAlert({ type: 'error', message: 'Error al cargar proveedores.' });
        } finally {
            setLoading(false);
        }
    }, []);

    // Carga inicial (Solo una vez)
    useEffect(() => {
        fetchProveedores(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- HANDLERS ---
    const handleFilterChange = useCallback((name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleFilterSubmit = useCallback(() => {
        fetchProveedores(1);
    }, [fetchProveedores]);

    const handleFilterClear = useCallback(() => {
        const cleanFilters = { search: '', estado: '' };
        setFilters(cleanFilters);
        filtersRef.current = cleanFilters; // Actualizamos ref inmediatamente
        fetchProveedores(1);
    }, [fetchProveedores]);

    // --- ACCIONES ---
    const executeToggle = async () => {
        if (!itemToToggle) return;
        
        const nuevoEstado = !itemToToggle.estado;
        
        setItemToToggle(null); 
        setLoading(true);

        try {
            const res = await toggleProveedorEstado(itemToToggle.id, nuevoEstado);
            setAlert({ type: 'success', message: res.message });
            await fetchProveedores(paginationInfo.currentPage); 
        } catch (err) {
            setAlert({ type: 'error', message: err.message || 'Error al cambiar estado' });
            setLoading(false);
        }
    };

    // --- COLUMNAS ---
    const columns = useMemo(() => [
        {
            header: 'Razón Social',
            render: (row) => <span className="font-semibold text-gray-800">{row.razon_social}</span>
        },
        {
            header: 'RUC',
            render: (row) => row.ruc || <span className="text-gray-400 font-mono text-xs">N/A</span>
        },
        {
            header: 'Teléfono',
            render: (row) => row.telefono || <span className="text-gray-400 italic text-xs">Sin teléfono</span>
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

    return (
        <div className="container mx-auto p-6">

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Proveedores</h1>
                <Link to="/admin/agregar-proveedor" className="btn-primary-shadow">
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
                
                // Configuración de Filtros
                filterConfig={filterConfig}
                filters={filters}
                onFilterChange={handleFilterChange}
                onFilterSubmit={handleFilterSubmit}
                onFilterClear={handleFilterClear}

                pagination={{
                    currentPage: paginationInfo.currentPage,
                    totalPages: paginationInfo.totalPages,
                    onPageChange: (page) => fetchProveedores(page)
                }}
            />
        </div>
    );
};

export default ListarProveedores;