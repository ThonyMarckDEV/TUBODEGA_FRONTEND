import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getComprobantePdf, getComprobantes, updateSunatStatus } from 'services/comprobanteService';
import Table from 'components/Shared/Tables/Table';
import PdfModal from 'components/Shared/Modals/PdfModal';
import { PrinterIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import Swal from 'sweetalert2';

const ListarComprobantes = () => {
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(null);
    const [comprobantes, setComprobantes] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1 });
    
    // Estado de los filtros
    const [filters, setFilters] = useState({
        search: '',
        fechaInicio: '',
        fechaFin: '',
        tipoDoc: '', 
        estadoSunat: ''
    });

    const [isPdfOpen, setIsPdfOpen] = useState(false);
    const [pdfConfig, setPdfConfig] = useState({ url: '', title: '' });
    const [alert, setAlert] = useState(null);

    const showAlert = useCallback((type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 3000);
    }, []);

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
    }, [filters, showAlert]);

    useEffect(() => { 
        fetchComprobantes(1); 
    }, [fetchComprobantes]);

    // ---------------------------------------------------------
    // MANEJADORES DE LA TABLA (FILTROS)
    // ---------------------------------------------------------

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearchSubmit = () => {
        fetchComprobantes(1);
    };

    const clearFilters = () => {
        const emptyFilters = { search: '', fechaInicio: '', fechaFin: '', tipoDoc: '', estadoSunat: '' };
        setFilters(emptyFilters);
        fetchComprobantes(1, emptyFilters);
    };

    // ---------------------------------------------------------
    // CONFIGURACIÓN DE COLUMNAS Y FILTROS
    // ---------------------------------------------------------

    // Configuración JSON de los filtros para pasárselo a la Tabla
    const filterConfig = useMemo(() => [
        {
            type: 'text',
            name: 'search',
            label: 'Buscar (Serie, Cliente, RUC)',
            placeholder: 'Ej: F001-23, Juan Perez...',
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
            name: 'tipoDoc',
            label: 'Tipo Doc.',
            colSpan: 'md:col-span-1',
            options: [
                { value: '', label: 'Todos' },
                { value: 'B', label: 'Boleta' },
                { value: 'F', label: 'Factura' }
            ]
        },
        {
            type: 'select',
            name: 'estadoSunat',
            label: 'Estado SUNAT',
            colSpan: 'md:col-span-1',
            options: [
                { value: '', label: 'Todos' },
                { value: '0', label: 'Pendiente' },
                { value: '1', label: 'Enviado' },
                { value: '2', label: 'Anulado' }
            ]
        }
    ], []);

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
                
                {/* LA TABLA AHORA SE ENCARGA DE RENDERIZAR LOS FILTROS */}
                <Table 
                    columns={columns} 
                    data={comprobantes} 
                    loading={loading}
                    
                    // Paginación
                    pagination={{
                        currentPage: paginationInfo.currentPage,
                        totalPages: paginationInfo.totalPages,
                        onPageChange: (page) => fetchComprobantes(page)
                    }}

                    // Configuración de Filtros
                    filterConfig={filterConfig}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onFilterSubmit={handleSearchSubmit}
                    onFilterClear={clearFilters}
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