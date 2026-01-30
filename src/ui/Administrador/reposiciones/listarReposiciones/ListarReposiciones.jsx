import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getReposiciones, showReposicion } from 'services/reposicionService'; 
import Table from 'components/Shared/Tables/Table';
import ViewModal from 'components/Shared/Modals/ViewModal';
import { EyeIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import AlertMessage from 'components/Shared/Errors/AlertMessage';

const ListarReposiciones = () => {
    const [loading, setLoading] = useState(true);
    const [reposiciones, setReposiciones] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1 });
    const [alert, setAlert] = useState(null);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRepo, setSelectedRepo] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const [filters, setFilters] = useState({
        fecha_inicio: '',
        fecha_fin: ''
    });

    const filtersRef = useRef(filters);
    useEffect(() => {
        filtersRef.current = filters;
    }, [filters]);

    const filterConfig = useMemo(() => [
        {
            name: 'fecha_inicio',
            type: 'date',
            label: 'Desde',
            colSpan: 'md:col-span-4'
        },
        {
            name: 'fecha_fin',
            type: 'date',
            label: 'Hasta',
            colSpan: 'md:col-span-4'
        }
    ], []);

    const fetchReposiciones = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const currentFilters = filtersRef.current;
            
            const response = await getReposiciones(page, currentFilters);
            
            setReposiciones(response.data || []); 
            setPaginationInfo({
                currentPage: response.current_page,
                totalPages: response.last_page,
            });
        } catch (err) {
            setAlert({ type: 'error', message: 'Error al cargar reposiciones.' });
        } finally {
            setLoading(false);
        }
    }, []); 

    useEffect(() => {
        fetchReposiciones(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFilterChange = useCallback((name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleFilterSubmit = useCallback(() => {
        fetchReposiciones(1);
    }, [fetchReposiciones]);

    const handleFilterClear = useCallback(() => {
        const cleanFilters = { fecha_inicio: '', fecha_fin: '' };
        setFilters(cleanFilters);
        filtersRef.current = cleanFilters; 
        fetchReposiciones(1);
    }, [fetchReposiciones]);

    const handleViewDetails = async (id) => {
        setIsModalOpen(true);
        setDetailsLoading(true);
        setSelectedRepo(null);
        try {
            const response = await showReposicion(id);
            setSelectedRepo(response.data);
        } catch(e) { 
            setAlert({ type: 'error', message: 'No se pudo cargar el detalle.' });
        } finally { 
            setDetailsLoading(false); 
        }
    };

    // --- COLUMNS ---
    const columns = useMemo(() => [
        { 
            header: 'ID', 
            accessor: 'id',
            render: (row) => <span className="font-mono text-gray-500">#{row.id}</span>
        },
        { 
            header: 'Fecha de Traslado', 
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-800">
                        {new Date(row.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-gray-500">
                        {new Date(row.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                </div>
            )
        },
        {
            header: 'Items',
            render: (row) => (
                <span className="font-semibold bg-slate-100 px-2 py-1 rounded text-slate-700 text-xs uppercase">
                    {row.detalles ? row.detalles.length : 0} productos
                </span>
            )
        },
        {
            header: 'Acciones',
            render: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleViewDetails(row.id)}
                        className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-medium text-sm bg-emerald-50 px-2 py-1 rounded transition-colors"
                    >
                        <EyeIcon className="w-4 h-4" /> Ver
                    </button>
                    <Link 
                        to={`/admin/editar-reposicion/${row.id}`} 
                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium text-sm bg-indigo-50 px-2 py-1 rounded transition-colors"
                    >
                        <PencilSquareIcon className="w-4 h-4" /> Editar
                    </Link>
                </div>
            )
        }
    ], []);

    if (loading && reposiciones.length === 0) return (
        <div className="container mx-auto p-6"><Table loading={true} columns={columns} data={[]} /></div>
    );

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Reposiciones de Stock</h1>
                <Link to="/admin/agregar-reposicion" className="btn-primary-shadow">
                    + Nueva Reposición
                </Link>
            </div>

            <AlertMessage type={alert?.type} message={alert?.message} onClose={() => setAlert(null)} />

            <Table 
                columns={columns}
                data={reposiciones}
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
                    onPageChange: (page) => fetchReposiciones(page)
                }}
            />

            {/* MODAL DETALLE */}
            <ViewModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={`Detalle Reposición #${selectedRepo?.id || ''}`}
                isLoading={detailsLoading}
            >
                {selectedRepo && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 border border-gray-200">
                            <strong>Fecha de Registro:</strong> {new Date(selectedRepo.created_at).toLocaleString()}
                        </div>
                        
                        <div>
                            <h4 className="font-bold border-b pb-2 mb-2 text-gray-800">Productos Trasladados</h4>
                            <div className="overflow-x-auto border rounded-lg">
                                <table className="min-w-full text-sm divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr className="text-left text-gray-500 uppercase text-xs font-bold">
                                            <th className="py-2 px-3">Producto</th>
                                            <th className="py-2 px-3 text-right">Cantidad Movida</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {selectedRepo.detalles?.map(det => (
                                            <tr key={det.id}>
                                                <td className="py-2 px-3 text-gray-800">{det.producto?.nombre}</td>
                                                <td className="py-2 px-3 text-right font-bold text-indigo-600">{det.cantidad}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </ViewModal>
        </div>
    );
};

export default ListarReposiciones;