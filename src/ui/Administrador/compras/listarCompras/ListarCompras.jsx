import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getCompras, showCompra } from 'services/compraService';
import LoadingScreen from 'components/Shared/LoadingScreen';
import Table from 'components/Shared/Tables/Table';
import ViewModal from 'components/Shared/Modals/ViewModal';
import { EyeIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

const ListarCompras = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [compras, setCompras] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCompra, setSelectedCompra] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const handleViewDetails = async (id) => {
        setIsModalOpen(true);
        setDetailsLoading(true);
        setSelectedCompra(null);

        try {
            const response = await showCompra(id);
            setSelectedCompra(response.data);
        } catch (error) {
            console.error("Error al cargar detalles", error);
        } finally {
            setDetailsLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedCompra(null), 300);
    };

    const columns = useMemo(() => [
        {
            header: 'ID',
            accessor: 'id'
        },
        {
            header: 'Fecha',
            render: (row) => new Date(row.created_at).toLocaleDateString() + ' ' + new Date(row.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        },
        {
            header: 'Proveedor',
            render: (row) => (
                <div>
                    <div className="font-semibold text-gray-800">{row.proveedor?.razon_social || 'Desconocido'}</div>
                    <div className="text-xs text-gray-500">{row.proveedor?.ruc}</div>
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
                    {/* BOTÓN VER (Abre Modal) */}
                    <button
                        onClick={() => handleViewDetails(row.id)}
                        className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-medium text-sm bg-emerald-50 px-2 py-1 rounded transition-colors"
                        title="Ver Detalles"
                    >
                        <EyeIcon className="w-4 h-4" /> Ver
                    </button>

                    {/* BOTÓN EDITAR (Link) */}
                    <Link 
                        to={`/admin/editar-compra/${row.id}`} 
                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium text-sm bg-indigo-50 px-2 py-1 rounded transition-colors"
                        title="Editar Compra"
                    >
                        <PencilSquareIcon className="w-4 h-4" /> Editar
                    </Link>
                </div>
            )
        }
    ], []);

    const fetchCompras = useCallback(async (page, search = '') => {
        setLoading(true);
        setError(null);
        try {
            const response = await getCompras(page, search);
            setCompras(response.data || []); 
            setPaginationInfo({
                currentPage: response.current_page,
                totalPages: response.last_page,
                totalItems: response.total,
            });
        } catch (err) {
            setError('Error al cargar compras.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCompras(1, '');
    }, [fetchCompras]);

    const handleSearchTable = (term) => {
        setSearchTerm(term); 
        fetchCompras(1, term);
    };

    const handlePageChange = (page) => {
        fetchCompras(page, searchTerm);
    };

    if (loading && compras.length === 0) return <LoadingScreen />;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Registro de Compras</h1>
                <Link to="/admin/agregar-compra" className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
                    + Nueva Compra
                </Link>
            </div>

            <Table 
                columns={columns}
                data={compras}
                loading={loading}
                pagination={{
                    currentPage: paginationInfo.currentPage,
                    totalPages: paginationInfo.totalPages,
                    onPageChange: handlePageChange
                }}
                onSearch={handleSearchTable} 
                searchPlaceholder="Buscar por proveedor..."
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
                        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded border">
                            <div>
                                <p className="text-sm text-gray-500 uppercase tracking-wide">Proveedor</p>
                                <p className="font-bold text-lg text-gray-800">{selectedCompra.proveedor?.razon_social}</p>
                                <p className="text-sm text-gray-600">RUC: {selectedCompra.proveedor?.ruc}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500 uppercase tracking-wide">Fecha de Registro</p>
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
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Cant.</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
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
                                <span className="text-gray-500 text-sm uppercase mr-4">Total Pagado:</span>
                                <span className="text-2xl font-bold text-black">
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