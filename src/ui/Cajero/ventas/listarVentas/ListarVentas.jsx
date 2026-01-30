import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getVentas, showVenta } from 'services/ventaService'; 
import Table from 'components/Shared/Tables/Table';
import ViewModal from 'components/Shared/Modals/ViewModal';
import { EyeIcon } from '@heroicons/react/24/outline';
import jwtUtils from 'utilities/Token/jwtUtils';

const ListarVentas = () => {
    const [loading, setLoading] = useState(true);
    const [ventas, setVentas] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1 });
    
    // Estado de filtros
    const [filters, setFilters] = useState({
        search: '',
        fechaInicio: '',
        fechaFin: '',
        metodoPago: ''
    });
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVenta, setSelectedVenta] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // Obtener Rol para mostrar botón de crear
    const access_token = jwtUtils.getAccessTokenFromCookie();
    const rol = jwtUtils.getUserRole(access_token);

    // ---------------------------------------------------------
    // LOGICA DE DATOS
    // ---------------------------------------------------------

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

    // ---------------------------------------------------------
    // MANEJADORES DE FILTROS (Adaptados para la nueva Tabla)
    // ---------------------------------------------------------

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearchSubmit = () => {
        fetchVentas(1);
    };

    const clearFilters = () => {
        const emptyFilters = { search: '', fechaInicio: '', fechaFin: '', metodoPago: '' };
        setFilters(emptyFilters);
        fetchVentas(1, emptyFilters);
    };

    // ---------------------------------------------------------
    // CONFIGURACIÓN DE FILTROS (JSON)
    // ---------------------------------------------------------

    const filterConfig = useMemo(() => [
        {
            type: 'text',
            name: 'search',
            label: 'Buscar Cliente / ID',
            placeholder: 'Nombre, DNI, RUC o ID...',
            colSpan: 'md:col-span-4'
        },
        {
            type: 'date',
            name: 'fechaInicio',
            label: 'Desde',
            colSpan: 'md:col-span-2'
        },
        {
            type: 'date',
            name: 'fechaFin',
            label: 'Hasta',
            colSpan: 'md:col-span-2'
        },
        {
            type: 'select',
            name: 'metodoPago',
            label: 'Método Pago',
            colSpan: 'md:col-span-2',
            options: [
                { value: '', label: 'Todos' },
                { value: 'efectivo', label: 'Efectivo' },
                { value: 'yape', label: 'Yape' },
                { value: 'plin', label: 'Plin' },
                { value: 'tarjeta', label: 'Tarjeta' }
            ]
        }
    ], []);

    // ---------------------------------------------------------
    // LOGICA MODAL Y COLUMNAS
    // ---------------------------------------------------------

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
            render: (row) => <span className="font-bold text-slate-700"># {String(row.id).padStart(6, '0')}</span>
        },
        { 
            header: 'Fecha', 
            render: (row) => (
                <div className="text-xs">
                    <p className="font-medium text-slate-900">{new Date(row.created_at).toLocaleDateString()}</p>
                    <p className="text-slate-400">{new Date(row.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
            )
        },
        {
            header: 'Cliente',
            render: (row) => {
                if (!row.cliente) return <span className="text-gray-400 italic text-xs">Público General</span>;
                
                const { datos } = row.cliente;
                const esEmpresa = !!datos?.ruc;
                const documento = esEmpresa ? datos.ruc : datos?.dni;
                const nombreFull = esEmpresa 
                    ? datos.nombre 
                    : `${datos?.nombre} ${datos?.apellidoPaterno}`;

                return (
                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-700 uppercase text-xs">{nombreFull}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
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
                    <span className="block text-blue-600 mb-1">{row.tipo_venta}</span>
                    <span className="inline-block bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
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
                    {row.metodo_pago === 'efectivo' && row.monto_pagado && (
                        <div className="text-[10px] text-gray-500 mt-0.5 flex flex-col">
                            <span>Pagó: {parseFloat(row.monto_pagado).toFixed(2)}</span>
                            {parseFloat(row.vuelto) > 0 && (
                                <span className="text-emerald-600 font-bold">Vuelto: {parseFloat(row.vuelto).toFixed(2)}</span>
                            )}
                        </div>
                    )}
                </div>
            )
        },
        {
            header: 'Acciones',
            render: (row) => (
                <button
                    onClick={() => handleViewDetails(row.id)}
                    className="flex items-center gap-1 text-slate-700 hover:text-black hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold border border-slate-200 shadow-sm"
                >
                    <EyeIcon className="w-4 h-4" /> Ver
                </button>
            )
        }
    ], []);

    return (
        <div className="container mx-auto p-4 md:p-6 min-h-screen">
            <div className="flex flex-col gap-6 mb-6">

               <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Historial de Ventas</h1>
                        <p className="text-slate-500 text-sm">Registro detallado de transacciones</p>
                    </div>
                    
                    {rol !== 'admin' && (
                        <Link 
                            to="/cajero/agregar-venta" 
                            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shadow-md text-sm font-bold flex items-center gap-2"
                        >
                            <span>+ Nueva Venta</span>
                        </Link>
                    )}
                </div>
                
                <Table 
                    columns={columns}
                    data={ventas}
                    loading={loading}
                    
                    // Paginación
                    pagination={{
                        currentPage: paginationInfo.currentPage,
                        totalPages: paginationInfo.totalPages,
                        onPageChange: (page) => fetchVentas(page)
                    }}

                    // Filtros Dinámicos
                    filterConfig={filterConfig}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onFilterSubmit={handleSearchSubmit}
                    onFilterClear={clearFilters}
                />
            </div>

            <ViewModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={`Venta #${String(selectedVenta?.id || '').padStart(6, '0')}`}
                isLoading={detailsLoading}
            >
                {selectedVenta && (
                    <div className="space-y-6">
                        {/* Cabecera del Recibo */}
                        <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div>
                                <p className="text-slate-400 uppercase text-[10px] font-bold mb-1">Cliente</p>
                                {selectedVenta.cliente ? (
                                    <>
                                        <p className="font-bold text-slate-900 uppercase leading-tight">
                                            {selectedVenta.cliente.datos?.nombre} 
                                            {!selectedVenta.cliente.datos?.ruc && ` ${selectedVenta.cliente.datos?.apellidoPaterno || ''}`}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1 font-mono">
                                            {selectedVenta.cliente.datos?.ruc ? 'RUC: ' : 'DNI: '}
                                            {selectedVenta.cliente.datos?.ruc || selectedVenta.cliente.datos?.dni || '---'}
                                        </p>
                                    </>
                                ) : (
                                    <p className="font-medium text-slate-400 italic">Público General</p>
                                )}
                            </div>
                            
                            <div className="text-right border-l pl-4 border-slate-200">
                                <p className="text-slate-400 uppercase text-[10px] font-bold mb-1">Pago</p>
                                <div className="space-y-1">
                                    <p className="text-xs">
                                        <span className="text-slate-500">Tipo:</span> <span className="uppercase font-bold text-slate-800">{selectedVenta.tipo_venta}</span>
                                    </p>
                                    <p className="text-xs">
                                        <span className="text-slate-500">Método:</span> <span className="uppercase font-bold text-slate-800">{selectedVenta.metodo_pago}</span>
                                    </p>
                                    
                                    {selectedVenta.metodo_pago === 'efectivo' && selectedVenta.monto_pagado && (
                                        <div className="mt-2 pt-2 border-t border-slate-200 flex flex-col gap-0.5">
                                            <div className="flex justify-end gap-2 text-xs">
                                                <span className="text-slate-500">Pagó:</span>
                                                <span className="font-mono font-medium">S/ {parseFloat(selectedVenta.monto_pagado).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-end gap-2 text-xs">
                                                <span className="text-emerald-600 font-bold">Vuelto:</span>
                                                <span className="font-mono font-bold text-emerald-600">S/ {parseFloat(selectedVenta.vuelto).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Tabla de Productos */}
                        <div>
                            <h4 className="font-bold text-sm mb-3 text-slate-800 flex items-center gap-2">
                                <span>Productos</span>
                                <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full">{selectedVenta.detalles?.length || 0}</span>
                            </h4>
                            <div className="overflow-hidden border border-slate-200 rounded-lg">
                                <table className="min-w-full text-sm divide-y divide-slate-100">
                                    <thead className="bg-slate-50">
                                        <tr className="text-left text-slate-500 text-xs uppercase tracking-wider">
                                            <th className="py-2 px-4 font-semibold text-center w-16">Cant.</th>
                                            <th className="py-2 px-4 font-semibold">Producto</th>
                                            <th className="py-2 px-4 font-semibold text-right">P. Unit.</th>
                                            <th className="py-2 px-4 font-semibold text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 bg-white">
                                        {selectedVenta.detalles?.map(det => (
                                            <tr key={det.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="py-3 px-4 text-center text-slate-600 font-bold">{det.cantidad}</td>
                                                <td className="py-3 px-4 text-slate-800 font-medium">{det.producto?.nombre}</td>
                                                <td className="py-3 px-4 text-right text-slate-500 font-mono text-xs">S/ {parseFloat(det.precio).toFixed(2)}</td>
                                                <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono text-xs">S/ {(det.cantidad * det.precio).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-slate-50 border-t border-slate-200">
                                        <tr>
                                            <td colSpan="3" className="py-3 px-4 font-bold text-right text-slate-600 text-sm">TOTAL</td>
                                            <td className="py-3 px-4 font-black text-right text-slate-900 text-lg font-mono">
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