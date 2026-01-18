import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getVentas, showVenta } from 'services/ventaService'; 
import Table from 'components/Shared/Tables/Table';
import ViewModal from 'components/Shared/Modals/ViewModal';
import { EyeIcon, MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import jwtUtils from 'utilities/Token/jwtUtils';

const ListarVentas = () => {
    const [loading, setLoading] = useState(true);
    const [ventas, setVentas] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1 });
    
    const [filters, setFilters] = useState({
        search: '',
        fechaInicio: '',
        fechaFin: '',
        metodoPago: ''
    });
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVenta, setSelectedVenta] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const fetchVentas = useCallback(async (page = 1, filtrosOverrides = null) => {
        setLoading(true);
        try {
            const filtrosParaEnviar = filtrosOverrides || filters;
            const response = await getVentas(page, filtrosParaEnviar);
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
    }, [filters]);

    useEffect(() => {
        fetchVentas(1);
    }, [fetchVentas]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchVentas(1);
    };

    const clearFilters = () => {
        const emptyFilters = { search: '', fechaInicio: '', fechaFin: '', metodoPago: '' };
        setFilters(emptyFilters);
        fetchVentas(1, emptyFilters);
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
            header: 'VENTA N°', 
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
            render: (row) => {
                if (!row.cliente) return <span className="text-gray-400 italic">Público General</span>;
                
                const { datos } = row.cliente;
                const esEmpresa = !!datos?.ruc;
                const documento = esEmpresa ? datos.ruc : datos?.dni;
                const nombreFull = esEmpresa 
                    ? datos.nombre 
                    : `${datos?.nombre} ${datos?.apellidoPaterno}`;

                return (
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-800 uppercase text-xs">{nombreFull}</span>
                        <span className="text-[10px] text-gray-500 font-mono">
                            {esEmpresa ? 'RUC: ' : 'DNI: '}{documento || 'N/A'}
                        </span>
                    </div>
                );
            }
        },
        {
            header: 'Tipo/Pago',
            render: (row) => (
                <div className="text-[10px] uppercase font-bold">
                    <span className="block text-blue-600 mb-0.5">{row.tipo_venta}</span>
                    <span className="inline-block bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                        {row.metodo_pago}
                    </span>
                </div>
            )
        },
        {
            header: 'Total',
            render: (row) => (
                <div>
                    <p className="font-black text-slate-900 text-sm">S/ {parseFloat(row.total).toFixed(2)}</p>
                    {/* [NUEVO] Mostrar detalles de pago en efectivo si existen */}
                    {row.metodo_pago === 'efectivo' && row.monto_pagado && (
                        <div className="text-[10px] text-gray-500 mt-0.5">
                            <span className="block">Pagó: {parseFloat(row.monto_pagado).toFixed(2)}</span>
                            {parseFloat(row.vuelto) > 0 && (
                                <span className="block text-emerald-600 font-bold">Vuelto: {parseFloat(row.vuelto).toFixed(2)}</span>
                            )}
                        </div>
                    )}
                </div>
            )
        },
        {
            header: 'Acciones',
            render: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleViewDetails(row.id)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-xs bg-blue-50 hover:bg-blue-100 px-2 py-1.5 rounded transition-colors"
                    >
                        <EyeIcon className="w-3.5 h-3.5" /> Ver Detalles
                    </button>
                </div>
            )
        }
    ], []);

    const refresh_token = jwtUtils.getRefreshTokenFromCookie();
    const rol = jwtUtils.getUserRole(refresh_token);

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col gap-6 mb-6">

               <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Historial de Ventas</h1>
                    
                    {rol !== 'admin' && (
                        <Link 
                            to="/cajero/agregar-venta" 
                            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors whitespace-nowrap shadow-md text-sm font-bold"
                        >
                            + Nueva Venta
                        </Link>
                    )}
                </div>
                
                <form onSubmit={handleSearchSubmit} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    
                    <div className="md:col-span-4">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Buscar Cliente / ID</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                name="search"
                                placeholder="Nombre, DNI, RUC o ID..."
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-shadow"
                                value={filters.search}
                                onChange={handleFilterChange}
                            />
                            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Desde</label>
                        <input 
                            type="date" 
                            name="fechaInicio"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none"
                            value={filters.fechaInicio}
                            onChange={handleFilterChange}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Hasta</label>
                        <input 
                            type="date" 
                            name="fechaFin"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none"
                            value={filters.fechaFin}
                            onChange={handleFilterChange}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Método Pago</label>
                        <select 
                            name="metodoPago" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none bg-white"
                            value={filters.metodoPago}
                            onChange={handleFilterChange}
                        >
                            <option value="">Todos</option>
                            <option value="efectivo">Efectivo</option>
                            <option value="yape">Yape</option>
                            <option value="plin">Plin</option>
                            <option value="tarjeta">Tarjeta</option>
                        </select>
                    </div>

                    <div className="md:col-span-2 flex gap-2">
                        <button type="submit" className="flex-1 bg-slate-800 text-white py-2 rounded-lg text-sm font-semibold hover:bg-slate-900 transition flex items-center justify-center gap-1 shadow-sm">
                            <FunnelIcon className="w-4 h-4" /> Filtrar
                        </button>
                        <button type="button" onClick={clearFilters} className="px-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 border border-gray-200 transition-colors" title="Limpiar filtros">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>

                </form>
            </div>

            <Table 
                columns={columns}
                data={ventas}
                loading={loading}
                pagination={{
                    currentPage: paginationInfo.currentPage,
                    totalPages: paginationInfo.totalPages,
                    onPageChange: (page) => fetchVentas(page)
                }}
            />

            <ViewModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={`Venta #${String(selectedVenta?.id || '').padStart(6, '0')}`}
                isLoading={detailsLoading}
            >
                {selectedVenta && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <div>
                                <p className="text-gray-500 uppercase text-[10px] font-bold mb-1">Información del Cliente</p>
                                {selectedVenta.cliente ? (
                                    <>
                                        <p className="font-bold text-indigo-900 uppercase leading-tight">
                                            {selectedVenta.cliente.datos?.nombre} 
                                            {!selectedVenta.cliente.datos?.ruc && ` ${selectedVenta.cliente.datos?.apellidoPaterno || ''}`}
                                        </p>
                                        <p className="text-xs text-slate-600 mt-1">
                                            <span className="font-semibold">
                                                {selectedVenta.cliente.datos?.ruc ? 'RUC: ' : 'DNI: '}
                                            </span>
                                            {selectedVenta.cliente.datos?.ruc || selectedVenta.cliente.datos?.dni || 'No registrado'}
                                        </p>
                                    </>
                                ) : (
                                    <p className="font-medium text-gray-400 italic">Público General</p>
                                )}
                            </div>
                            
                            <div className="text-right border-l pl-4 border-slate-200">
                                <p className="text-gray-500 uppercase text-[10px] font-bold mb-1">Detalles del Pago</p>
                                <div className="space-y-1">
                                    <p className="font-medium text-slate-700 text-xs">
                                        Tipo: <span className="uppercase text-blue-600 font-bold">{selectedVenta.tipo}</span>
                                    </p>
                                    <p className="font-medium text-slate-700 uppercase text-xs">
                                        Método: {selectedVenta.metodo_pago}
                                    </p>
                                    
                                    {/* [NUEVO] Sección de Monto y Vuelto en el Modal */}
                                    {selectedVenta.metodo_pago === 'efectivo' && selectedVenta.monto_pagado && (
                                        <div className="mt-2 pt-2 border-t border-slate-200">
                                            <div className="flex justify-end gap-4 text-xs">
                                                <span className="text-slate-500">Pagado:</span>
                                                <span className="font-mono font-medium">S/ {parseFloat(selectedVenta.monto_pagado).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-end gap-4 text-xs">
                                                <span className="text-emerald-600 font-bold">Vuelto:</span>
                                                <span className="font-mono font-bold text-emerald-600">S/ {parseFloat(selectedVenta.vuelto).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-sm mb-3 border-b pb-1 text-slate-700">Productos Vendidos</h4>
                            <div className="overflow-x-auto border rounded-lg">
                                <table className="min-w-full text-sm divide-y divide-gray-100">
                                    <thead className="bg-gray-50">
                                        <tr className="text-left text-gray-500 text-xs uppercase tracking-wider">
                                            <th className="py-2 px-3 font-semibold text-center">Cant.</th>
                                            <th className="py-2 px-3 font-semibold">Producto</th>
                                            <th className="py-2 px-3 font-semibold text-right">P. Unit.</th>
                                            <th className="py-2 px-3 font-semibold text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 bg-white">
                                        {selectedVenta.detalles?.map(det => (
                                            <tr key={det.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="py-2.5 px-3 text-center text-slate-600 font-medium">{det.cantidad}</td>
                                                <td className="py-2.5 px-3 text-slate-800">{det.producto?.nombre}</td>
                                                <td className="py-2.5 px-3 text-right text-slate-600 font-mono text-xs">S/ {parseFloat(det.precio).toFixed(2)}</td>
                                                <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono text-xs">S/ {(det.cantidad * det.precio).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-slate-50 border-t border-slate-200">
                                        <tr>
                                            <td colSpan="3" className="py-3 px-4 font-bold text-right text-slate-600 text-sm">TOTAL A PAGAR:</td>
                                            <td className="py-3 px-4 font-black text-right text-indigo-700 text-lg font-mono">
                                                S/ {parseFloat(selectedVenta.total).toFixed(2)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </ViewModal>

        </div>
    );
};

export default ListarVentas;