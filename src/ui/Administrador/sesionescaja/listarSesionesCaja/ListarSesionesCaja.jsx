import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getSesionesCaja } from 'services/sesionesCajaService';
import LoadingScreen from 'components/Shared/LoadingScreen';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import Table from 'components/Shared/Tables/Table';
import ViewModal from 'components/Shared/Modals/ViewModal';
import { EyeIcon, CurrencyDollarIcon, UserIcon, ClockIcon } from '@heroicons/react/24/outline';

const ListarSesionesCaja = () => {
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [sesiones, setSesiones] = useState([]);
    
    // Estados para el Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSesion, setSelectedSesion] = useState(null);

    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
    const [searchTerm, setSearchTerm] = useState('');

    // --- HELPER: FORMATEAR MONEDA ---
    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return '-';
        return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);
    };

    // --- HELPER: FORMATEAR FECHA ---
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // --- HELPER: OBTENER NOMBRE DEL CAJERO  ---
    const getNombreCajero = (cajero) => {
        if (!cajero) return 'Desconocido';
        // Si existe la relación 'datos', usamos nombre y apellido
        if (cajero.datos) {
            return `${cajero.datos.nombre || ''} ${cajero.datos.apellidoPaterno || ''} ${cajero.datos.apellidoMaterno || ''}`;
        }
        // Fallback: Si no hay datos personales, usamos el username
        return cajero.username || 'Usuario sin nombre';
    };

    const handleViewDetails = (sesion) => {
        setSelectedSesion(sesion);
        setIsModalOpen(true);
    };

    const columns = useMemo(() => [
        {
            header: 'ID',
            render: (row) => <span className="font-mono text-xs text-slate-400">#{row.id}</span>
        },
        {
            header: 'Caja',
            render: (row) => (
                <div className="font-semibold text-gray-700">
                    {row.caja?.nombre || 'Caja Eliminada'}
                </div>
            )
        },
        {
            header: 'Cajero',
            render: (row) => (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                    <UserIcon className="w-3 h-3" />
                    <span className="capitalize">{getNombreCajero(row.cajero)}</span>
                </div>
            )
        },
        {
            header: 'Apertura',
            render: (row) => <span className="text-xs text-gray-500">{formatDate(row.fecha_apertura)}</span>
        },
        {
            header: 'Cierre',
            render: (row) => <span className="text-xs text-gray-500">{formatDate(row.fecha_cierre)}</span>
        },
        {
            header: 'Estado',
            render: (row) => (
                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                    row.estado === 1 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                    {row.estado === 1 ? 'ABIERTA' : 'CERRADA'}
                </span>
            )
        },
        {
            header: 'Acciones',
            render: (row) => (
                <button onClick={() => handleViewDetails(row)} className="btn-icon-view bg-blue-50 text-blue-600 px-2 py-1 rounded flex items-center gap-1 hover:bg-blue-100 transition-colors">
                    <EyeIcon className="w-4 h-4" /> Detalle
                </button>
            )
        }
    ], []); 

    const fetchSesiones = useCallback(async (page, search = '') => {
        setLoading(true);
        try {
            const response = await getSesionesCaja(page, search);
            setSesiones(response.data || []);
            setPaginationInfo({
                currentPage: response.current_page,
                totalPages: response.last_page,
                totalItems: response.total,
            });
        } catch (err) {
            setAlert({
                type: 'error',
                message: 'Error al cargar el historial de sesiones.'
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchSesiones(1, ''); }, [fetchSesiones]);

    if (loading && sesiones.length === 0) return <LoadingScreen />;

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Historial de Cajas (Sesiones)</h1>
            </div>

            <AlertMessage type={alert?.type} message={alert?.message} onClose={() => setAlert(null)} />
            
            <Table 
                columns={columns}
                data={sesiones}
                loading={loading}
                pagination={{
                    currentPage: paginationInfo.currentPage,
                    totalPages: paginationInfo.totalPages,
                    onPageChange: (page) => fetchSesiones(page, searchTerm)
                }}
                onSearch={(term) => { setSearchTerm(term); fetchSesiones(1, term); }}
                searchPlaceholder="Buscar por caja o cajero..."
            />
            
            {/* MODAL DETALLES DE LA SESIÓN */}
            <ViewModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={`Detalle Sesión #${selectedSesion?.id}`} 
            >
                {selectedSesion && (
                    <div className="space-y-6">
                        {/* Cabecera */}
                        <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
                            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                <ClockIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    {selectedSesion.caja?.nombre}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Cajero: <span className="font-medium text-gray-800 capitalize">
                                        {getNombreCajero(selectedSesion.cajero)}
                                    </span>
                                </p>
                            </div>
                            <div className="ml-auto">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedSesion.estado === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {selectedSesion.estado === 1 ? 'ACTUALMENTE ABIERTA' : 'FINALIZADA'}
                                </span>
                            </div>
                        </div>

                        {/* Grid de Fechas */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-gray-50 p-3 rounded border border-gray-100">
                                <span className="block text-gray-400 text-xs uppercase font-bold">Fecha Apertura</span>
                                <span className="font-medium text-gray-700">{formatDate(selectedSesion.fecha_apertura)}</span>
                            </div>
                            <div className="bg-gray-50 p-3 rounded border border-gray-100">
                                <span className="block text-gray-400 text-xs uppercase font-bold">Fecha Cierre</span>
                                <span className="font-medium text-gray-700">{formatDate(selectedSesion.fecha_cierre)}</span>
                            </div>
                        </div>

                        {/* Balance Económico */}
                        <div className="border rounded-lg overflow-hidden">
                            <div className="bg-slate-50 px-4 py-2 border-b font-semibold text-slate-700 flex items-center gap-2">
                                <CurrencyDollarIcon className="w-5 h-5" /> Balance de Caja
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Monto Inicial (Base):</span>
                                    <span className="font-mono font-medium">{formatCurrency(selectedSesion.monto_inicial)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Total Ventas (Sistema):</span>
                                    <span className="font-mono font-medium text-green-600">+ {formatCurrency(selectedSesion.monto_ventas)}</span>
                                </div>
                                <div className="h-px bg-gray-200 my-2"></div>
                                <div className="flex justify-between items-center text-sm font-bold bg-slate-50 p-2 rounded">
                                    <span className="text-gray-800">Total Esperado en Caja:</span>
                                    <span className="font-mono text-slate-800">
                                        {formatCurrency(parseFloat(selectedSesion.monto_inicial) + parseFloat(selectedSesion.monto_ventas))}
                                    </span>
                                </div>
                                
                                {selectedSesion.estado === 0 && (
                                    <>
                                        <div className="flex justify-between items-center text-sm pt-2">
                                            <span className="text-gray-600">Dinero Físico Reportado:</span>
                                            <span className="font-mono font-medium text-blue-600">{formatCurrency(selectedSesion.monto_final_fisico)}</span>
                                        </div>
                                        <div className={`flex justify-between items-center text-sm p-2 rounded border ${
                                            parseFloat(selectedSesion.diferencia) < 0 
                                            ? 'bg-red-50 border-red-100 text-red-700' 
                                            : parseFloat(selectedSesion.diferencia) > 0 
                                                ? 'bg-green-50 border-green-100 text-green-700'
                                                : 'bg-gray-50 border-gray-100 text-gray-600'
                                        }`}>
                                            <span className="font-bold">Diferencia (Sobrante/Faltante):</span>
                                            <span className="font-mono font-bold">{formatCurrency(selectedSesion.diferencia)}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        
                        {selectedSesion.observaciones && (
                             <div className="bg-amber-50 p-4 rounded text-sm text-amber-800 border border-amber-100">
                                <span className="font-bold block mb-1">Observaciones:</span>
                                {selectedSesion.observaciones}
                             </div>
                        )}
                    </div>
                )}
            </ViewModal>

        </div>
    );
};

export default ListarSesionesCaja;