import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
// Asegúrate de que la ruta a tu servicio sea correcta
import { getCajas, toggleCajaEstado } from 'services/cajaService';
import LoadingScreen from 'components/Shared/LoadingScreen';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import Table from 'components/Shared/Tables/Table';
import ViewModal from 'components/Shared/Modals/ViewModal';
import { EyeIcon, InboxIcon } from '@heroicons/react/24/outline';

const ListarCajas = () => {
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [cajaToToggle, setCajaToToggle] = useState(null);
    const [cajas, setCajas] = useState([]);
    
    // Estados para el Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCaja, setSelectedCaja] = useState(null);

    // Estado para la Paginación
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });

    // --- ESTADO DE FILTROS ---
    const [filters, setFilters] = useState({
        search: '',
        estado: ''
    });

    // Configuración de los campos de filtro
    const filterConfig = useMemo(() => [
        {
            name: 'search',
            type: 'text',
            placeholder: 'Buscar por nombre de caja...',
            label: 'Buscador',
            colSpan: 'md:col-span-7'
        },
        {
            name: 'estado',
            type: 'select',
            label: 'Estado',
            options: [
                { value: '', label: 'Todos' },
                { value: '1', label: 'Activas' },
                { value: '0', label: 'Inactivas' }
            ],
            colSpan: 'md:col-span-4'
        }
    ], []);

    // --- MANEJADORES DE FILTROS  ---
    const handleFilterChange = useCallback((name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    }, []);

    // Función principal de carga
    const fetchCajas = useCallback(async (page = 1, currentFilters = filters) => {
        setLoading(true);
        try {
            const response = await getCajas(
                page, 
                currentFilters.search, 
                currentFilters.estado
            );
            
            setCajas(response.data || []);
            setPaginationInfo({
                currentPage: response.current_page || 1,
                totalPages: response.last_page || 1,
                totalItems: response.total || 0,
            });
        } catch (err) {
            setAlert({
                type: 'error',
                message: 'Error al cargar el listado de cajas.'
            });
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Carga inicial
    useEffect(() => { 
        fetchCajas(1, { search: '', estado: '' }); 
    }, [fetchCajas]);

    // --- AQUÍ ESTABA EL ERROR DEL BUCLE ---
    const handleFilterSubmit = useCallback(() => {
        fetchCajas(1, filters);
    }, [fetchCajas, filters]);

    const handleFilterClear = useCallback(() => {
        const cleanFilters = { search: '', estado: '' };
        setFilters(cleanFilters);
        fetchCajas(1, cleanFilters);
    }, [fetchCajas]);

    // --- LÓGICA DE MODALES Y ACCIONES ---
    const handleViewDetails = (caja) => {
        setSelectedCaja(caja);
        setIsModalOpen(true);
    };

    const executeToggleEstado = async () => {
        if (!cajaToToggle) return;
        setCajaToToggle(null);
        setLoading(true);
        try {
            const response = await toggleCajaEstado(cajaToToggle.id);
            setAlert({ type: 'success', message: response.message || 'Estado actualizado.' });
            await fetchCajas(paginationInfo.currentPage, filters);
        } catch (err) {
            setAlert({ type: 'error', message: err.message || 'Error al cambiar estado.' });
            setLoading(false);
        }
    };

    const columns = useMemo(() => [
        {
            header: 'ID',
            render: (row) => <span className="font-mono text-xs text-slate-400">#{row.id}</span>
        },
        {
            header: 'Nombre de Caja',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <InboxIcon className="w-5 h-5 text-slate-400" />
                    <span className="font-semibold text-gray-700">{row.nombre}</span>
                </div>
            )
        },
        {
            header: 'Disponibilidad',
            render: (row) => (
                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                    row.estado_ocupado 
                    ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                    : 'bg-blue-50 text-blue-600 border border-blue-200'
                }`}>
                    {row.estado_ocupado ? 'EN USO' : 'LIBRE'}
                </span>
            )
        },
        {
            header: 'Estado',
            render: (row) => (
                <button 
                    onClick={() => setCajaToToggle({ id: row.id, estado: row.estado })}
                    className={`px-3 py-1 font-bold text-xs rounded-full transition-colors duration-150 ${
                        row.estado === 1
                            ? 'text-green-700 bg-green-100 hover:bg-red-100 hover:text-red-700'
                            : 'text-red-700 bg-red-100 hover:bg-green-100 hover:text-green-700'
                    }`}
                >
                    {row.estado === 1 ? 'ACTIVA' : 'INACTIVA'}
                </button>
            )
        },
        {
            header: 'Acciones',
            render: (row) => (
                <div className="flex gap-2">
                    <button onClick={() => handleViewDetails(row)} className="btn-icon-view bg-emerald-50 text-emerald-600 px-2 py-1 rounded flex items-center gap-1 hover:bg-emerald-100 transition-colors">
                        <EyeIcon className="w-4 h-4" /> Ver
                    </button>
                </div>
            )
        }
    ], []); 

    if (loading && cajas.length === 0) return <LoadingScreen />;

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Gestión de Cajas</h1>
                <Link to="/admin/agregar-caja" className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20">
                    + Nueva Caja
                </Link>
            </div>

            <AlertMessage type={alert?.type} message={alert?.message} onClose={() => setAlert(null)} />

            {/* Modal de Confirmación */}
            {cajaToToggle && (
                <ConfirmModal
                    message={`¿Desea cambiar el estado de la caja a ${cajaToToggle.estado === 1 ? 'INACTIVA' : 'ACTIVA'}?`}
                    subMessage={cajaToToggle.estado === 1 ? "Los cajeros no podrán aperturar turno en esta caja." : "La caja estará disponible para nuevos turnos."}
                    onConfirm={executeToggleEstado}
                    onCancel={() => setCajaToToggle(null)}
                />
            )}
            
            <Table 
                columns={columns}
                data={cajas}
                loading={loading}
                
                // Configuración de Filtros
                filterConfig={filterConfig}
                filters={filters}
                onFilterChange={handleFilterChange}
                onFilterSubmit={handleFilterSubmit}
                onFilterClear={handleFilterClear}

                // Paginación
                pagination={{
                    currentPage: paginationInfo.currentPage,
                    totalPages: paginationInfo.totalPages,
                    onPageChange: (page) => fetchCajas(page, filters)
                }}
            />
            
            {/* Modal Detalles */}
            <ViewModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title="Detalle de Caja" 
            >
                {selectedCaja && (
                    <div className="space-y-6">
                        <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
                            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                                <InboxIcon className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    {selectedCaja.nombre}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                    <span className={`font-semibold ${selectedCaja.estado === 1 ? 'text-green-600' : 'text-red-600'}`}>
                                        {selectedCaja.estado === 1 ? '● Operativa' : '● Inoperativa'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <h4 className="font-bold text-gray-700 mb-3 border-b border-gray-200 pb-1">
                                    Estado Actual
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Disponibilidad:</span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${selectedCaja.estado_ocupado ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {selectedCaja.estado_ocupado ? 'OCUPADA / EN TURNO' : 'LIBRE'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Sede ID:</span>
                                        <span className="font-medium text-gray-900">{selectedCaja.sede_id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Fecha Creación:</span>
                                        <span className="font-medium text-gray-900">{new Date(selectedCaja.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </ViewModal>

        </div>
    );
};

export default ListarCajas;