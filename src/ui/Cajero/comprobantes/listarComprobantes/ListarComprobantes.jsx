import React, { useState, useEffect, useMemo } from 'react';
import { getComprobantes, updateSunatStatus } from 'services/comprobanteService';
import Table from 'components/Shared/Tables/Table';
import PdfModal from 'components/Shared/Modals/PdfModal'; // Lo crearemos abajo
import { PrinterIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import API_BASE_URL from 'js/urlHelper';
import Swal from 'sweetalert2';

const ListarComprobantes = () => {
    const [loading, setLoading] = useState(true);
    const [comprobantes, setComprobantes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1 });
    
    // Estado para el visor de PDF
    const [isPdfOpen, setIsPdfOpen] = useState(false);
    const [pdfConfig, setPdfConfig] = useState({ url: '', title: '' });

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
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchComprobantes(1); }, []);

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await updateSunatStatus(id, newStatus);
            setComprobantes(prev => prev.map(c => c.id === id ? { ...c, sunat: parseInt(newStatus) } : c));
            Swal.fire({ icon: 'success', title: 'Estado SUNAT actualizado', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
        } catch (e) {
            Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
        }
    };

    const openPdf = (row) => {
        setPdfConfig({
            url: `${API_BASE_URL}/api/ventas/${row.venta_id}/pdf`,
            title: `${row.tipo_documento === 'F' ? 'Factura' : 'Boleta'} ${row.serie_asignada}-${row.correlativo_asignado}`
        });
        setIsPdfOpen(true);
    };

    const columns = useMemo(() => [
        { 
            header: 'Documento', 
            render: (row) => (
                <div className="font-mono font-bold text-slate-700">
                    <span className={row.tipo_documento === 'F' ? 'text-orange-600' : 'text-blue-600'}>
                        {row.tipo_documento === 'F' ? 'FAC' : 'BOL'} 
                    </span> {row.serie_asignada}-{row.correlativo_asignado}
                </div>
            )
        },
        { 
            header: 'Venta', 
            render: (row) => <span className="text-xs text-gray-500">#{String(row.venta_id).padStart(6, '0')}</span> 
        },
        {
            header: 'Cliente',
            render: (row) => {
                const datos = row.venta?.cliente?.datos;
                return (
                    <div className="flex flex-col text-xs uppercase">
                        <span className="font-semibold">{datos?.nombre || 'Público General'}</span>
                        <span className="text-[10px] text-gray-400">{datos?.ruc || datos?.dni || ''}</span>
                    </div>
                );
            }
        },
        {
            header: 'Estado SUNAT',
            render: (row) => {
                const estilos = {
                    0: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    1: 'bg-green-100 text-green-800 border-green-200',
                    2: 'bg-red-100 text-red-800 border-red-200'
                };
                return (
                    <select 
                        value={row.sunat}
                        onChange={(e) => handleUpdateStatus(row.id, e.target.value)}
                        className={`text-[10px] font-bold py-1 px-2 rounded border focus:ring-0 ${estilos[row.sunat]}`}
                    >
                        <option value="0">PENDIENTE</option>
                        <option value="1">ENVIADO (SUNAT)</option>
                        <option value="2">ANULADO</option>
                    </select>
                );
            }
        },
        {
            header: 'Acciones',
            render: (row) => (
                <button 
                    onClick={() => openPdf(row)}
                    className="flex items-center gap-1 bg-slate-100 hover:bg-black hover:text-white px-3 py-1.5 rounded transition-colors text-xs font-medium"
                >
                    <PrinterIcon className="w-4 h-4" /> PDF
                </button>
            )
        }
    ], []);

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Comprobantes Electrónicos</h1>
            
            <div className="mb-6 flex justify-end">
                <div className="relative w-full md:w-80">
                    <input 
                        type="text" 
                        placeholder="Buscar por serie o correlativo..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && fetchComprobantes(1, searchTerm)}
                    />
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                </div>
            </div>

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

            <PdfModal 
                isOpen={isPdfOpen} 
                onClose={() => setIsPdfOpen(false)}
                title={pdfConfig.title}
                pdfUrl={pdfConfig.url}
            />
        </div>
    );
};

export default ListarComprobantes;