import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getComprobantePdf, getComprobantes, updateSunatStatus } from 'services/comprobanteService';
import Table from 'components/Shared/Tables/Table';
import PdfModal from 'components/Shared/Modals/PdfModal';
import { PrinterIcon, MagnifyingGlassIcon, ArrowPathIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import Swal from 'sweetalert2';

const ListarComprobantes = () => {
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(null);
    const [comprobantes, setComprobantes] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1 });
    
    // --- ESTADO DE FILTROS ---
    const [filters, setFilters] = useState({
        search: '',
        fechaInicio: '',
        fechaFin: '',
        tipoDoc: '',     // '' | 'F' | 'B'
        estadoSunat: ''  // '' | '0' | '1' | '2'
    });

    const [isPdfOpen, setIsPdfOpen] = useState(false);
    const [pdfConfig, setPdfConfig] = useState({ url: '', title: '' });
    const [alert, setAlert] = useState(null);

    const showAlert = useCallback((type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 3000);
    }, []);

    // --- FUNCIÓN DE CARGA ---
    const fetchComprobantes = useCallback(async (page = 1, filtersOverrides = null) => {
        setLoading(true);
        try {
            const filtersToSend = filtersOverrides || filters;
            const response = await getComprobantes(page, filtersToSend);
            setComprobantes(response.data || []);
            setPaginationInfo({
                currentPage: response.current_page,
                totalPages: response.last_page,
            });
        } catch (err) {
            showAlert('error', 'Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    }, [filters, showAlert]); // Depende de 'filters' actual

    // --- EFECTO INICIAL ---
    useEffect(() => { 
        fetchComprobantes(1); 
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- HANDLERS FILTROS ---
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchComprobantes(1);
    };

    const clearFilters = () => {
        const emptyFilters = { search: '', fechaInicio: '', fechaFin: '', tipoDoc: '', estadoSunat: '' };
        setFilters(emptyFilters);
        fetchComprobantes(1, emptyFilters);
    };

    // --- UPDATE STATUS ---
    const handleUpdateStatus = useCallback(async (id, newStatus) => {
        setIsUpdating(id);
        try {
            await updateSunatStatus(id, newStatus);
            setComprobantes(prev => 
                prev.map(c => c.id === id ? { ...c, sunat: parseInt(newStatus) } : c)
            );
            showAlert('success', 'Estado SUNAT actualizado');
        } catch (e) {
            showAlert('error', 'Error al actualizar estado');
        } finally {
            setIsUpdating(null);
        }
    }, [showAlert]);

    // --- PDF LOGIC ---
    const openPdf = async (row) => {
        Swal.fire({
            title: 'Generando PDF...',
            text: 'Preparando documento electrónico',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        try {
            const blobUrl = await getComprobantePdf(row.venta_id);
            setPdfConfig({
                url: blobUrl,
                title: `${row.tipo_documento === 'F' ? 'Factura' : 'Boleta'} ${row.serie_asignada}-${row.correlativo_asignado}`
            });
            setIsPdfOpen(true);
            Swal.close();
        } catch (e) {
            Swal.fire('Error', 'No se pudo generar el PDF', 'error');
        }
    };

    const handleClosePdf = () => {
        if (pdfConfig.url.startsWith('blob:')) URL.revokeObjectURL(pdfConfig.url);
        setIsPdfOpen(false);
    };

    // --- COLUMNAS ---
    const columns = useMemo(() => [
        { 
            header: 'Documento', 
            render: (row) => (
                <div className={`font-mono font-bold transition-opacity ${isUpdating === row.id ? 'opacity-40' : 'text-slate-700'}`}>
                    <span className={row.tipo_documento === 'F' ? 'text-orange-600' : 'text-blue-600'}>
                        {row.tipo_documento === 'F' ? 'FAC' : 'BOL'} 
                    </span> {row.serie_asignada}-{row.correlativo_asignado}
                </div>
            )
        },
        { 
            header: 'Venta', 
            render: (row) => <span className="text-xs text-gray-400 font-medium">#{String(row.venta_id).padStart(6, '0')}</span> 
        },
        {
            header: 'Cliente',
            render: (row) => {
                const datos = row.venta?.cliente?.datos;
                return (
                    <div className={`flex flex-col text-xs uppercase transition-opacity ${isUpdating === row.id ? 'opacity-40' : ''}`}>
                        <span className="font-semibold text-slate-700">{datos?.nombre || 'Público General'}</span>
                        <span className="text-[10px] text-slate-400">{datos?.ruc || datos?.dni || '---'}</span>
                    </div>
                );
            }
        },
        {
            header: 'Estado SUNAT',
            render: (row) => {
                const estilos = {
                    0: 'bg-yellow-50 text-yellow-700 border-yellow-200',
                    1: 'bg-green-50 text-green-700 border-green-200',
                    2: 'bg-red-50 text-red-700 border-red-200'
                };
                
                return (
                    <div className="flex items-center gap-2">
                        <select 
                            disabled={isUpdating === row.id}
                            value={row.sunat}
                            onChange={(e) => handleUpdateStatus(row.id, e.target.value)}
                            className={`text-[10px] font-bold py-1 px-2 rounded border focus:ring-0 cursor-pointer outline-none transition-all ${estilos[row.sunat]} ${isUpdating === row.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <option value="0">PENDIENTE</option>
                            <option value="1">ENVIADO (SUNAT)</option>
                            <option value="2">ANULADO</option>
                        </select>
                        {isUpdating === row.id && (
                            <ArrowPathIcon className="w-4 h-4 text-slate-400 animate-spin" />
                        )}
                    </div>
                );
            }
        },
        {
            header: 'Acciones',
            render: (row) => (
                <button 
                    disabled={isUpdating === row.id}
                    onClick={() => openPdf(row)}
                    className="flex items-center gap-1.5 bg-slate-900 text-white hover:bg-black px-3 py-1.5 rounded-lg transition-all text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                >
                    <PrinterIcon className="w-4 h-4" /> PDF
                </button>
            )
        }
    ], [isUpdating, handleUpdateStatus]);

    return (
        <div className="container mx-auto p-4 md:p-6 min-h-screen">
            {alert && (
                <div className="fixed top-5 right-5 z-[100] w-80">
                    <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
                </div>
            )}

            <div className="flex flex-col gap-6 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Comprobantes</h1>
                    <p className="text-slate-500 text-sm">Gestión de Facturación Electrónica</p>
                </div>
                
                {/* --- BARRA DE FILTROS --- */}
                <form onSubmit={handleSearchSubmit} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    
                    {/* Búsqueda Texto */}
                    <div className="md:col-span-4">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Buscar (Serie, Cliente, RUC)</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                name="search"
                                placeholder="F001-23, Cliente..."
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none"
                                value={filters.search}
                                onChange={handleFilterChange}
                            />
                            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                        </div>
                    </div>

                    {/* Fechas */}
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Desde</label>
                        <input type="date" name="fechaInicio" className="w-full px-2 py-2 border rounded-lg text-sm" value={filters.fechaInicio} onChange={handleFilterChange} />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Hasta</label>
                        <input type="date" name="fechaFin" className="w-full px-2 py-2 border rounded-lg text-sm" value={filters.fechaFin} onChange={handleFilterChange} />
                    </div>

                    {/* Tipo Doc */}
                    <div className="md:col-span-1">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Tipo</label>
                        <select name="tipoDoc" className="w-full px-2 py-2 border rounded-lg text-sm bg-white" value={filters.tipoDoc} onChange={handleFilterChange}>
                            <option value="">Todos</option>
                            <option value="B">Boleta</option>
                            <option value="F">Factura</option>
                        </select>
                    </div>

                    {/* Estado SUNAT */}
                    <div className="md:col-span-1">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Estado</label>
                        <select name="estadoSunat" className="w-full px-2 py-2 border rounded-lg text-sm bg-white" value={filters.estadoSunat} onChange={handleFilterChange}>
                            <option value="">Todos</option>
                            <option value="0">Pendiente</option>
                            <option value="1">Enviado</option>
                            <option value="2">Anulado</option>
                        </select>
                    </div>

                    {/* Botones */}
                    <div className="md:col-span-2 flex gap-2">
                        <button type="submit" className="flex-1 bg-slate-900 text-white py-2 rounded-lg text-sm font-semibold hover:bg-black transition flex justify-center gap-1">
                            <FunnelIcon className="w-4 h-4" /> Filtrar
                        </button>
                        <button type="button" onClick={clearFilters} className="px-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 border border-gray-200">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>

            <div className="overflow-hidden rounded-xl">
                <Table 
                    columns={columns} 
                    data={comprobantes} 
                    loading={loading}
                    pagination={{
                        currentPage: paginationInfo.currentPage,
                        totalPages: paginationInfo.totalPages,
                        onPageChange: (page) => fetchComprobantes(page)
                    }}
                />
            </div>

            <PdfModal 
                isOpen={isPdfOpen} 
                onClose={handleClosePdf}
                title={pdfConfig.title}
                pdfUrl={pdfConfig.url}
            />
        </div>
    );
};
 
export default ListarComprobantes;