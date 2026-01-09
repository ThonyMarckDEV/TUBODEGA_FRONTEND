import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getReposiciones, showReposicion } from 'services/reposicionService'; 
import Table from 'components/Shared/Tables/Table';
import ViewModal from 'components/Shared/Modals/ViewModal';
import { EyeIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

const ListarReposiciones = () => {
    const [loading, setLoading] = useState(true);
    const [reposiciones, setReposiciones] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1 });
    
    // Estados Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRepo, setSelectedRepo] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const fetchReposiciones = async (page = 1) => {
        setLoading(true);
        try {
            const response = await getReposiciones(page);
            setReposiciones(response.data || []); 
            setPaginationInfo({
                currentPage: response.current_page,
                totalPages: response.last_page,
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReposiciones(1);
    }, []);

    const handleViewDetails = async (id) => {
        setIsModalOpen(true);
        setDetailsLoading(true);
        setSelectedRepo(null);
        try {
            const response = await showReposicion(id);
            setSelectedRepo(response.data);
        } catch(e) { console.error(e) } 
        finally { setDetailsLoading(false); }
    };

    const columns = useMemo(() => [
        { header: 'ID', accessor: 'id' },
        { 
            header: 'Fecha de Traslado', 
            render: (row) => new Date(row.created_at).toLocaleDateString() + ' ' + new Date(row.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        },
        {
            header: 'Items',
            render: (row) => <span className="font-semibold">{row.detalles ? row.detalles.length : 0} productos</span>
        },
        {
            header: 'Acciones',
            render: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleViewDetails(row.id)}
                        className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-medium text-sm bg-emerald-50 px-2 py-1 rounded"
                    >
                        <EyeIcon className="w-4 h-4" /> Ver
                    </button>
                    <Link 
                        to={`/admin/editar-reposicion/${row.id}`} 
                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium text-sm bg-indigo-50 px-2 py-1 rounded"
                    >
                        <PencilSquareIcon className="w-4 h-4" /> Editar
                    </Link>
                </div>
            )
        }
    ], []);

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Reposiciones de Stock</h1>
                <Link to="/admin/agregar-reposicion" className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
                    + Nueva Reposición
                </Link>
            </div>

            <Table 
                columns={columns}
                data={reposiciones}
                loading={loading}
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
                        <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
                            <strong>Fecha:</strong> {new Date(selectedRepo.created_at).toLocaleString()}
                        </div>
                        <h4 className="font-bold border-b pb-2">Productos Trasladados</h4>
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 border-b">
                                    <th className="py-2">Producto</th>
                                    <th className="py-2 text-right">Cantidad Movida</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedRepo.detalles?.map(det => (
                                    <tr key={det.id} className="border-b last:border-0">
                                        <td className="py-2">{det.producto?.nombre}</td>
                                        <td className="py-2 text-right font-bold">{det.cantidad}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </ViewModal>
        </div>
    );
};

export default ListarReposiciones;