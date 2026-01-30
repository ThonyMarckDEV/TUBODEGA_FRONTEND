import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
// Asegúrate de que la ruta a tu servicio sea correcta
import { getCompras, showCompra } from 'services/compraService';
import LoadingScreen from 'components/Shared/LoadingScreen';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import Table from 'components/Shared/Tables/Table';
import ViewModal from 'components/Shared/Modals/ViewModal';
import { EyeIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

const ListarCompras = () => {
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    
    const [compras, setCompras] = useState([]);
    
    // Estados para Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCompra, setSelectedCompra] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });

    // --- ESTADO DE FILTROS ---
    const [filters, setFilters] = useState({
        search: ''
    });

    // --- CONFIGURACIÓN VISUAL DE FILTROS ---
    const filterConfig = useMemo(() => [
        {
            name: 'search',
            type: 'text',
            label: 'Buscador',
            placeholder: 'Proveedor (Razón Social o RUC)...',
            colSpan: 'md:col-span-8' 
        }
    ], []);

    // --- HANDLERS DE FILTROS ---
    const handleFilterChange = useCallback((name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    }, []);

    // --- FETCH DATA ---
    const fetchCompras = useCallback(async (page = 1, currentFilters = filters) => {
        setLoading(true);
        try {
            const response = await getCompras(page, currentFilters.search);
            
            setCompras(response.data || []); 
            setPaginationInfo({
                currentPage: response.current_page || 1,
                totalPages: response.last_page || 1,
                totalItems: response.total || 0,
            });
        } catch (err) {
            setAlert({ type: 'error', message: 'Error al cargar compras.' });
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Carga Inicial
    useEffect(() => {
        fetchCompras(1, { search: '' });
    }, [fetchCompras]);

    // Submit Automático (Estable)
    const handleFilterSubmit = useCallback(() => {
        fetchCompras(1, filters);
    }, [fetchCompras, filters]);

    // Limpiar (Estable)
    const handleFilterClear = useCallback(() => {
        const cleanFilters = { search: '' };
        setFilters(cleanFilters);
        fetchCompras(1, cleanFilters);
    }, [fetchCompras]);

    // --- ACCIONES ---
    const handleViewDetails = async (id) => {
        setIsModalOpen(true);
        setDetailsLoading(true);
        setSelectedCompra(null);

        try {
            const response = await showCompra(id);
            setSelectedCompra(response.data);
        } catch (error) {
            setAlert({ type: 'error', message: "Error al cargar detalles de la compra." });
        } finally {
            setDetailsLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedCompra(null), 300);
    };

    // --- COLUMNAS ---
    const columns = useMemo(() => [
        {
            header: 'ID',
            accessor: 'id',
            render: (row) => <span className="font-mono text-xs text-gray-500">#{row.id}</span>
        },
        {
            header: 'Fecha',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-700">
                        {new Date(row.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-gray-400">
                        {new Date(row.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                </div>
            )
        },
        {
            header: 'Proveedor',
            render: (row) => (
                <div>
                    <div className="font-semibold text-gray-800 uppercase text-sm">
                        {row.proveedor?.razon_social || 'Desconocido'}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                        {row.proveedor?.ruc}
                    </div>
                </div>
            )
        },
        {
            header: 'Total',
            render: (row) => <span className="font-bold text-slate-800">S/. {parseFloat(row.total).toFixed(2)}</span>
        },
        {
            header: 'Acciones',
            render: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleViewDetails(row.id)}
                        className="btn-icon-view bg-emerald-50 text-emerald-600 px-2 py-1 rounded flex items-center gap-1 hover:bg-emerald-100 transition-colors"
                        title="Ver Detalles"
                    >
                        <EyeIcon className="w-4 h-4" /> Ver
                    </button>

                    <Link 
                        to={`/admin/editar-compra/${row.id}`} 
                        className="btn-icon-edit bg-indigo-50 text-indigo-600 px-2 py-1 rounded flex items-center gap-1 hover:bg-indigo-100 transition-colors"
                        title="Editar Compra"
                    >
                        <PencilSquareIcon className="w-4 h-4" /> Editar
                    </Link>
                </div>
            )
        }
    ], []);

    if (loading && compras.length === 0) return <LoadingScreen />;

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Registro de Compras</h1>
                <Link to="/admin/agregar-compra" className="btn-primary-shadow">
                    + Nueva Compra
                </Link>
            </div>

            <AlertMessage 
                type={alert?.type} 
                message={alert?.message} 
                onClose={() => setAlert(null)} 
            />

            <Table 
                columns={columns}
                data={compras}
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
                    onPageChange: (page) => fetchCompras(page, filters)
                }}
            />

            {/* --- MODAL DE DETALLE --- */}
            <ViewModal 
                isOpen={isModalOpen} 
                onClose={closeModal} 
                title={`Detalle de Compra #${selectedCompra?.id || ''}`}
                isLoading={detailsLoading}
            >
                {selectedCompra && (
                    <div className="space-y-6">
                        
                        {/* 1. Información de Cabecera */}
                        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded border border-gray-200">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1">Proveedor</p>
                                <p className="font-bold text-lg text-gray-800">{selectedCompra.proveedor?.razon_social}</p>
                                <p className="text-sm text-gray-600 font-mono">RUC: {selectedCompra.proveedor?.ruc}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1">Fecha de Registro</p>
                                <p className="font-medium text-gray-800">
                                    {new Date(selectedCompra.created_at).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {new Date(selectedCompra.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                            </div>
                        </div>

                        {/* 2. Tabla de Productos */}
                        <div>
                            <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Productos Adquiridos</h4>
                            <div className="overflow-x-auto border rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Producto</th>
                                            <th className="px-4 py-2 text-right text-xs font-bold text-gray-500 uppercase">Cant.</th>
                                            <th className="px-4 py-2 text-right text-xs font-bold text-gray-500 uppercase">P. Unit.</th>
                                            <th className="px-4 py-2 text-right text-xs font-bold text-gray-500 uppercase">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {selectedCompra.detalles?.map((detalle) => (
                                            <tr key={detalle.id}>
                                                <td className="px-4 py-2 text-sm text-gray-800">
                                                    {detalle.producto?.nombre}
                                                </td>
                                                <td className="px-4 py-2 text-sm text-right text-gray-600">
                                                    {detalle.cantidad}
                                                </td>
                                                <td className="px-4 py-2 text-sm text-right text-gray-600">
                                                    S/. {parseFloat(detalle.precio).toFixed(2)}
                                                </td>
                                                <td className="px-4 py-2 text-sm text-right font-medium text-gray-800">
                                                    S/. {(detalle.cantidad * detalle.precio).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* 3. Total Final */}
                        <div className="flex justify-end pt-4 border-t border-gray-200">
                            <div className="text-right">
                                <span className="text-gray-500 text-sm uppercase mr-4 font-bold">Total Pagado:</span>
                                <span className="text-2xl font-bold text-slate-900">
                                    S/. {parseFloat(selectedCompra.total).toFixed(2)}
                                </span>
                            </div>
                        </div>

                    </div>
                )}
            </ViewModal>
        </div>
    );
};

export default ListarCompras;