import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getCategorias, toggleCategoriaEstado } from 'services/categoriaService'; 
import LoadingScreen from 'components/Shared/LoadingScreen';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import Table from 'components/Shared/Tables/Table';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
};

const ListarCategorias = () => {
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [itemToToggle, setItemToToggle] = useState(null);
    
    const [categorias, setCategorias] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });

    const [filters, setFilters] = useState({
        search: '',
        estado: ''
    });

    const filtersRef = useRef(filters);
    
    const filterConfig = useMemo(() => [
        {
            name: 'search',
            type: 'text',
            label: 'Buscador',
            placeholder: 'Nombre de la categoría...',
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

    const fetchCategorias = useCallback(async (page = 1, filtersOverride = null) => {
        setLoading(true);
        try {
            const currentFilters = filtersOverride || filtersRef.current;
            
            const response = await getCategorias(
                page, 
                currentFilters.search, 
                currentFilters.estado
            );

            setCategorias(response.data || []); 
            setPaginationInfo({
                currentPage: response.current_page || 1,
                totalPages: response.last_page || 1,
                totalItems: response.total || 0,
            });

        } catch (err) {
            setAlert({ type: 'error', message: 'Error al cargar categorías.' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategorias(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const debouncedFetch = useMemo(() => 
        debounce((newFilters) => {
            filtersRef.current = newFilters; 
            fetchCategorias(1, newFilters); 
        }, 600), 
    [fetchCategorias]);

    const handleFilterChange = useCallback((name, value) => {
        setFilters(prev => {
            const newFilters = { ...prev, [name]: value };
            
            if (name === 'search') {
                debouncedFetch(newFilters);
            } else {
                filtersRef.current = newFilters;
                fetchCategorias(1, newFilters);
            }
            return newFilters;
        });
    }, [debouncedFetch, fetchCategorias]);

    const handleFilterSubmit = useCallback(() => {
        filtersRef.current = filters;
        fetchCategorias(1, filters);
    }, [fetchCategorias, filters]);

    const handleFilterClear = useCallback(() => {
        const cleanFilters = { search: '', estado: '' };
        setFilters(cleanFilters);
        filtersRef.current = cleanFilters;
        fetchCategorias(1, cleanFilters);
    }, [fetchCategorias]);

    const executeToggle = async () => {
        if (!itemToToggle) return;
        const nuevoEstado = !itemToToggle.estado; 
        setItemToToggle(null); 
        setLoading(true);

        try {
            const res = await toggleCategoriaEstado(itemToToggle.id, nuevoEstado);
            setAlert({ type: 'success', message: res.message });
            await fetchCategorias(paginationInfo.currentPage); 
        } catch (err) {
            setAlert({ type: 'error', message: err.message || 'Error al cambiar estado.' });
            setLoading(false);
        }
    };

    // --- COLUMNAS ---
    const columns = useMemo(() => [
        {
            header: 'Nombre',
            render: (row) => <span className="font-semibold text-gray-700">{row.nombre}</span>
        },
        {
            header: 'Descripción',
            render: (row) => (
                <span className={`text-sm ${!row.descripcion ? 'text-gray-400 italic' : 'text-gray-600'}`}>
                    {row.descripcion || 'Sin descripción'}
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
                    to={`/admin/editar-categoria/${row.id}`} 
                    className="w-fit flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium text-sm bg-indigo-50 px-2 py-1 rounded transition-colors hover:bg-indigo-100"
                >
                    <PencilSquareIcon className="w-4 h-4" /> Editar
                </Link>
            )
        }
    ], []);

    if (loading && categorias.length === 0) return <LoadingScreen />;

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Categorías</h1>
                <Link to="/admin/agregar-categoria" className="btn-primary-shadow">
                    + Nueva Categoría
                </Link>
            </div>

            <AlertMessage type={alert?.type} message={alert?.message} onClose={() => setAlert(null)} />

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
                
                // Configuración
                filterConfig={filterConfig}
                filters={filters}
                onFilterChange={handleFilterChange} // Ahora usa debounce interno
                onFilterSubmit={handleFilterSubmit}
                onFilterClear={handleFilterClear}

                pagination={{
                    currentPage: paginationInfo.currentPage,
                    totalPages: paginationInfo.totalPages,
                    onPageChange: (page) => fetchCategorias(page) // fetchCategorias usa la ref interna
                }}
            />
        </div>
    );
};

export default ListarCategorias;