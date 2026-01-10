import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getVentas, showVenta } from 'services/ventaService'; 
import Table from 'components/Shared/Tables/Table';
import ViewModal from 'components/Shared/Modals/ViewModal';
import { EyeIcon, MagnifyingGlassIcon, PrinterIcon } from '@heroicons/react/24/outline';

const ListarVentas = () => {
    const [loading, setLoading] = useState(true);
    const [ventas, setVentas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1 });
    
    // Estados Modal Detalle
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVenta, setSelectedVenta] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const fetchVentas = async (page = 1, search = '') => {
        setLoading(true);
        try {
            const response = await getVentas(page, search);
            setVentas(response.data || []); 
            setPaginationInfo({
                currentPage: response.current_page,
                totalPages: response.last_page,
            });
        } catch (err) {
            console.error("Error al cargar ventas:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVentas(1);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchVentas(1, searchTerm);
    };

    const handleViewDetails = async (id) => {
        setIsModalOpen(true);
        setDetailsLoading(true);
        try {
            const response = await showVenta(id);
            setSelectedVenta(response.data);
        } catch(e) { 
            console.error(e);
        } finally { 
            setDetailsLoading(false); 
        }
    };

    const columns = useMemo(() => [
        { 
            header: 'Correlativo', 
            render: (row) => <span className="font-bold"># {String(row.id).padStart(6, '0')}</span>
        },
        { 
            header: 'Fecha', 
            render: (row) => (
                <div className="text-xs">
                    <p className="font-medium text-gray-900">{new Date(row.created_at).toLocaleDateString()}</p>
                    <p className="text-gray-400">{new Date(row.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
            )
        },
        {
            header: 'Cliente',
            render: (row) => row.cliente ? row.cliente.nombre : <span className="text-gray-400">Público General</span>
        },
        {
            header: 'Tipo/Pago',
            render: (row) => (
                <div className="text-[10px] uppercase font-bold">
                    <span className="block text-blue-600">{row.tipo_venta}</span>
                    <span className="block text-gray-500">{row.metodo_pago}</span>
                </div>
            )
        },
        {
            header: 'Total',
            render: (row) => <span className="font-black text-slate-900">S/ {parseFloat(row.total).toFixed(2)}</span>
        },
        {
            header: 'Acciones',
            render: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleViewDetails(row.id)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm bg-blue-50 px-2 py-1 rounded"
                    >
                        <EyeIcon className="w-4 h-4" /> Ver
                    </button>
                    <button className="text-gray-500 hover:text-black bg-gray-100 px-2 py-1 rounded">
                        <PrinterIcon className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ], []);

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Historial de Ventas</h1>
                
                <form onSubmit={handleSearch} className="flex w-full md:w-auto gap-2">
                    <div className="relative flex-1 md:w-80">
                        <input 
                            type="text" 
                            placeholder="Buscar por cliente o ID..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                    </div>
                    <Link to="/admin/agregar-venta" className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors whitespace-nowrap">
                        + Nueva Venta
                    </Link>
                </form>
            </div>

            <Table 
                columns={columns}
                data={ventas}
                loading={loading}
                pagination={{
                    currentPage: paginationInfo.currentPage,
                    totalPages: paginationInfo.totalPages,
                    onPageChange: (page) => fetchVentas(page, searchTerm)
                }}
            />

            {/* MODAL DETALLE DE VENTA */}
            <ViewModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={`Venta #${String(selectedVenta?.id || '').padStart(6, '0')}`}
                isLoading={detailsLoading}
            >
                {selectedVenta && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg">
                            <div>
                                <p className="text-gray-500 uppercase text-[10px] font-bold">Cliente</p>
                                <p className="font-medium">{selectedVenta.cliente?.nombre || 'Público General'}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-500 uppercase text-[10px] font-bold">Método Pago</p>
                                <p className="font-medium uppercase">{selectedVenta.metodo_pago}</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-sm mb-3 border-b pb-1">Productos</h4>
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="text-left text-gray-400 border-b">
                                        <th className="py-2">Cant.</th>
                                        <th className="py-2">Producto</th>
                                        <th className="py-2 text-right">Unit.</th>
                                        <th className="py-2 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedVenta.detalles?.map(det => (
                                        <tr key={det.id} className="border-b last:border-0">
                                            <td className="py-3">{det.cantidad}</td>
                                            <td className="py-3">{det.producto?.nombre}</td>
                                            <td className="py-3 text-right">S/ {parseFloat(det.precio).toFixed(2)}</td>
                                            <td className="py-3 text-right font-bold">S/ {(det.cantidad * det.precio).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="text-lg">
                                        <td colSpan="3" className="py-4 font-bold text-right">TOTAL:</td>
                                        <td className="py-4 font-black text-right text-indigo-600">S/ {parseFloat(selectedVenta.total).toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}
            </ViewModal>
        </div>
    );
};

export default ListarVentas;