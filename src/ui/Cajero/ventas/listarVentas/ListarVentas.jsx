import React, { useState, useEffect, useMemo } from 'react';
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
    
    // ESTADO DE FILTROS
    const [filters, setFilters] = useState({
        search: '',
        fechaInicio: '',
        fechaFin: '',
        metodoPago: ''
    });
    
    // Estados Modal Detalle
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVenta, setSelectedVenta] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    /**
     * Función principal de carga.
     * Recibe 'filtrosOverrides' para forzar filtros vacíos al limpiar
     * sin esperar a que el estado de React se actualice.
     */
    const fetchVentas = async (page = 1, filtrosOverrides = null) => {
        setLoading(true);
        try {
            // Usamos los filtros que nos pasan O el estado actual
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
    };

    useEffect(() => {
        fetchVentas(1);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // --- HANDLERS ---

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchVentas(1); // Usa el estado actual de filters
    };

    const clearFilters = () => {
        const emptyFilters = { search: '', fechaInicio: '', fechaFin: '', metodoPago: '' };
        
        // 1. Limpiamos visualmente los inputs
        setFilters(emptyFilters);
        
        // 2. Forzamos la recarga inmediata pasando los filtros vacíos
        // (No esperamos a que el setFilters termine)
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

    // --- COLUMNAS ---
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
                if (!row.cliente) return <span className="text-gray-400">Público General</span>;
                
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
                    
                    {/* Solo mostramos el botón si NO es admin (es decir, es cajero) */}
                    {rol !== 'admin' && (
                        <Link 
                            to="/cajero/agregar-venta" 
                            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors whitespace-nowrap shadow-md"
                        >
                            + Nueva Venta
                        </Link>
                    )}
                </div>
                
                {/* --- BARRA DE FILTROS --- */}
                <form onSubmit={handleSearchSubmit} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    
                    {/* Buscador Texto */}
                    <div className="md:col-span-4">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Buscar Cliente / ID / Doc</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                name="search"
                                placeholder="Nombre, DNI, RUC o ID..."
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                                value={filters.search}
                                onChange={handleFilterChange}
                            />
                            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                        </div>
                    </div>

                    {/* Fecha Inicio */}
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

                    {/* Fecha Fin */}
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

                    {/* Método de Pago */}
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

                    {/* Botones Acción */}
                    <div className="md:col-span-2 flex gap-2">
                        <button type="submit" className="flex-1 bg-slate-800 text-white py-2 rounded-lg text-sm font-semibold hover:bg-slate-900 transition flex items-center justify-center gap-1">
                            <FunnelIcon className="w-4 h-4" /> Filtrar
                        </button>
                        <button type="button" onClick={clearFilters} className="px-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 border border-gray-200" title="Limpiar filtros">
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

            {/* --- MODAL DETALLE --- */}
            <ViewModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={`Venta #${String(selectedVenta?.id || '').padStart(6, '0')}`}
                isLoading={detailsLoading}
            >
                {selectedVenta && (
                    <div className="space-y-6">
                        {/* Cabecera del detalle */}
                        <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <div>
                                <p className="text-gray-500 uppercase text-[10px] font-bold mb-1">Información del Cliente</p>
                                {selectedVenta.cliente ? (
                                    <>
                                        <p className="font-bold text-indigo-900 uppercase">
                                            {selectedVenta.cliente.datos?.nombre} 
                                            {!selectedVenta.cliente.datos?.ruc && ` ${selectedVenta.cliente.datos?.apellidoPaterno || ''}`}
                                        </p>
                                        <p className="text-xs text-slate-600 mt-1">
                                            <span className="font-semibold">
                                                {selectedVenta.cliente.datos?.ruc ? 'RUC: ' : 'DNI: '}
                                            </span>
                                            {selectedVenta.cliente.datos?.ruc || selectedVenta.cliente.datos?.dni || 'No registrado'}
                                        </p>
                                        {selectedVenta.cliente.datos?.ruc && (
                                            <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded">
                                                EMPRESA
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    <p className="font-medium text-gray-400 italic">Público General</p>
                                )}
                            </div>
                            <div className="text-right border-l pl-4 border-slate-200">
                                <p className="text-gray-500 uppercase text-[10px] font-bold mb-1">Detalles del Pago</p>
                                <p className="font-medium text-slate-700">
                                    Tipo: <span className="uppercase text-blue-600 font-bold">{selectedVenta.tipo}</span>
                                </p>
                                <p className="font-medium text-slate-700 uppercase">
                                    {selectedVenta.metodo_pago}
                                </p>
                            </div>
                        </div>

                        {/* Tabla de Productos */}
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