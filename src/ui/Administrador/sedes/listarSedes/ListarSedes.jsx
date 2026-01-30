import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getSedes, toggleSedeEstado } from 'services/sedeService'; 
import LoadingScreen from 'components/Shared/LoadingScreen';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import Table from 'components/Shared/Tables/Table';
import { PencilSquareIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';

const ListarSedes = () => {
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [sedeToToggle, setSedeToToggle] = useState(null);
    
    const [sedes, setSedes] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });

    const [filters, setFilters] = useState({
        search: '',
        estado: ''
    });

    const filtersRef = useRef(filters);
    useEffect(() => {
        filtersRef.current = filters;
    }, [filters]);

    const filterConfig = useMemo(() => [
        {
            name: 'search',
            type: 'text',
            label: 'Buscador',
            placeholder: 'Nombre, Dirección o Código SUNAT...',
            colSpan: 'md:col-span-5'
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

    const fetchSedes = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const currentFilters = filtersRef.current;
            
            const response = await getSedes(
                page, 
                currentFilters.search, 
                currentFilters.estado
            );
            
            setSedes(response.data || []);
            setPaginationInfo({
                currentPage: response.current_page || 1,
                totalPages: response.last_page || 1,
                totalItems: response.total || 0,
            });
        } catch (err) {
            setAlert({ type: 'error', message: 'Error al cargar las sedes.' });
        } finally {
            setLoading(false);
        }
    }, []); 

    useEffect(() => { 
        fetchSedes(1); 
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFilterChange = useCallback((name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleFilterSubmit = useCallback(() => {
        fetchSedes(1);
    }, [fetchSedes]);

    const handleFilterClear = useCallback(() => {
        const cleanFilters = { search: '', estado: '' };
        setFilters(cleanFilters);
        filtersRef.current = cleanFilters; 
        fetchSedes(1);
    }, [fetchSedes]);

    // --- ACTIONS ---
    const executeToggleEstado = async () => {
        if (!sedeToToggle) return;
        
        if(sedeToToggle.esPrincipal) {
            setAlert({ type: 'warning', message: 'No se puede desactivar la Sede Principal.' });
            setSedeToToggle(null);
            return;
        }

        const nuevoEstado = sedeToToggle.estado === 1 ? 0 : 1;
        setSedeToToggle(null);
        setLoading(true);
        
        try {
            const response = await toggleSedeEstado(sedeToToggle.id, nuevoEstado);
            setAlert({ type: 'success', message: response.message });
            await fetchSedes(paginationInfo.currentPage);
        } catch (err) {
            setAlert({ type: 'error', message: err.message || 'Error al cambiar estado' });
            setLoading(false);
        }
    };

    // --- COLUMNS ---
    const columns = useMemo(() => [
        {
            header: 'Nombre',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <BuildingStorefrontIcon className="w-5 h-5"/>
                    </div>
                    <div>
                        <span className="font-bold text-gray-800 block">{row.nombre}</span>
                        {row.id === 1 && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">PRINCIPAL</span>}
                    </div>
                </div>
            )
        },
        {
            header: 'Código SUNAT',
            render: (row) => row.codigo_sunat ? <span className="font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded">{row.codigo_sunat}</span> : <span className="text-gray-400 italic">N/A</span>
        },
        {
            header: 'Dirección',
            render: (row) => <span className="text-sm text-gray-600 truncate max-w-xs block" title={row.direccion}>{row.direccion || 'Sin dirección'}</span>
        },
        {
            header: 'Estado',
            render: (row) => (
                <button 
                    onClick={() => setSedeToToggle({ id: row.id, estado: row.estado, esPrincipal: row.id === 1 })}
                    disabled={row.id === 1} 
                    className={`px-3 py-1 font-bold text-xs rounded-full transition-colors duration-150 ${
                        row.estado === 1
                            ? 'text-green-700 bg-green-100 hover:bg-red-100 hover:text-red-700'
                            : 'text-red-700 bg-red-100 hover:bg-green-100 hover:text-green-700'
                    } ${row.id === 1 ? 'opacity-50 cursor-not-allowed hover:bg-green-100 hover:text-green-700' : ''}`}
                    title={row.id === 1 ? "La sede principal no se puede desactivar" : "Cambiar estado"}
                >
                    {row.estado === 1 ? 'ACTIVO' : 'INACTIVO'}
                </button>
            )
        },
        {
            header: 'Acciones',
            render: (row) => (
                <Link 
                    to={`/admin/editar-sede/${row.id}`} 
                    className="flex items-center gap-1 w-fit bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100 transition-colors"
                >
                    <PencilSquareIcon className="w-4 h-4" /> Editar
                </Link>
            )
        }
    ], []);

    if (loading && sedes.length === 0) return <LoadingScreen />;

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Gestión de Sedes</h1>
                <Link to="/admin/agregar-sede" className="btn-primary-shadow">
                    + Nueva Sede
                </Link>
            </div>

            <AlertMessage type={alert?.type} message={alert?.message} onClose={() => setAlert(null)} />

            {sedeToToggle && (
                <ConfirmModal
                    message={`¿Cambiar estado a ${sedeToToggle.estado === 1 ? 'INACTIVO' : 'ACTIVO'}? Esta acción afectará el acceso de los cajeros asignados.`}
                    onConfirm={executeToggleEstado}
                    onCancel={() => setSedeToToggle(null)}
                />
            )}
            
            <Table 
                columns={columns}
                data={sedes}
                loading={loading}
                
                // Filter Configuration
                filterConfig={filterConfig}
                filters={filters}
                onFilterChange={handleFilterChange}
                onFilterSubmit={handleFilterSubmit}
                onFilterClear={handleFilterClear}

                pagination={{
                    currentPage: paginationInfo.currentPage,
                    totalPages: paginationInfo.totalPages,
                    onPageChange: (page) => fetchSedes(page)
                }}
            />
        </div>
    );
};

export default ListarSedes;