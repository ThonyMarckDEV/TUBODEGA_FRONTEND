import React, { useState, useEffect, useMemo } from 'react';
import { getComprobantePdf, getComprobantes, updateSunatStatus } from 'services/comprobanteService';
import Table from 'components/Shared/Tables/Table';
import PdfModal from 'components/Shared/Modals/PdfModal';
import { PrinterIcon, MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import Swal from 'sweetalert2';

const ListarComprobantes = () => {
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(null); // Guarda el ID del comprobante actualizándose
    const [comprobantes, setComprobantes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1 });
    
    const [isPdfOpen, setIsPdfOpen] = useState(false);
    const [pdfConfig, setPdfConfig] = useState({ url: '', title: '' });
    const [alert, setAlert] = useState(null);

    const showAlert = (type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 3000);
    };

    const fetchComprobantes = async (page = 1, search = '') => {
        setLoading(true);
        try {
            const response = await getComprobantes(page, search);
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
    };

    useEffect(() => { fetchComprobantes(1); }, []);

    const handleUpdateStatus = async (id, newStatus) => {
        setIsUpdating(id); // Bloqueamos visualmente esta fila
        try {
            await updateSunatStatus(id, newStatus);
            setComprobantes(prev => 
                prev.map(c => c.id === id ? { ...c, sunat: parseInt(newStatus) } : c)
            );
            showAlert('success', 'Estado SUNAT actualizado');
        } catch (e) {
            showAlert('error', 'Error al actualizar estado');
        } finally {
            setIsUpdating(null); // Liberamos la fila
        }
    };

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
    ], [isUpdating]);

    return (
        <div className="container mx-auto p-4 md:p-6 min-h-screen">
            {alert && (
                <div className="fixed top-5 right-5 z-[100] w-80">
                    <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Comprobantes</h1>
                    <p className="text-slate-500 text-sm">Facturación electrónica y reportes</p>
                </div>
                
                <div className="relative w-full md:w-96">
                    <input 
                        type="text" 
                        placeholder="Buscar por serie o correlativo..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && fetchComprobantes(1, searchTerm)}
                    />
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
                </div>
            </div>

            <div className="overflow-hidden rounded-xl">
                <Table 
                    columns={columns} 
                    data={comprobantes} 
                    loading={loading}
                    pagination={{
                        currentPage: paginationInfo.currentPage,
                        totalPages: paginationInfo.totalPages,
                        onPageChange: (page) => fetchComprobantes(page, searchTerm)
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