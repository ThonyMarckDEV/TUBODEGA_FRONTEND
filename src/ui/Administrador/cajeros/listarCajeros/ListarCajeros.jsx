import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getCajeros, toggleCajeroEstado, showCajero } from 'services/cajeroService'; 
import LoadingScreen from 'components/Shared/LoadingScreen';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import Table from 'components/Shared/Tables/Table';
import ViewModal from 'components/Shared/Modals/ViewModal';
import { EyeIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

const ListarCajero = () => {
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [cajeroToToggle, setCajeroToToggle] = useState(null);
    const [cajeros, setCajeros] = useState([]);
    
    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCajero, setSelectedCajero] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });

    // --- ESTADO DE FILTROS ---
    const [filters, setFilters] = useState({
        search: '',
        estado: ''
    });

    // --- CONFIGURACIÓN VISUAL DE FILTROS ---
    const filterConfig = useMemo(() => [
        {
            name: 'search',
            type: 'text',
            label: 'Buscador',
            placeholder: 'Usuario, Nombre, DNI...',
            colSpan: 'md:col-span-7' 
        },
        {
            name: 'estado',
            type: 'select',
            label: 'Estado',
            options: [
                { value: '', label: 'Todos' },
                { value: '1', label: 'Activos' },
                { value: '0', label: 'Inactivos' }
            ],
            colSpan: 'md:col-span-4'
        }
    ], []);

    // --- HANDLERS CON useCallback  ---
    const handleFilterChange = useCallback((name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    }, []);

    // ---- FETCH DATA  ---
    const fetchCajeros = useCallback(async (page = 1, currentFilters = filters) => {
        setLoading(true);
        try {
            const response = await getCajeros(
                page, 
                currentFilters.search, 
                currentFilters.estado
            );
            
            setCajeros(response.data || []);
            setPaginationInfo({
                currentPage: response.current_page || 1,
                totalPages: response.last_page || 1,
                totalItems: response.total || 0,
            });
        } catch (err) {
            setAlert({ type: 'error', message: 'Error al cargar cajeros.' });
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Carga inicial
    useEffect(() => { 
        fetchCajeros(1, { search: '', estado: '' }); 
    }, [fetchCajeros]);

    // Función estable para el submit automático
    const handleFilterSubmit = useCallback(() => {
        fetchCajeros(1, filters);
    }, [fetchCajeros, filters]);
    
    // Función estable para limpiar
    const handleFilterClear = useCallback(() => {
        const cleanFilters = { search: '', estado: '' };
        setFilters(cleanFilters);
        fetchCajeros(1, cleanFilters);
    }, [fetchCajeros]);

    // --- ACCIONES ---
    const handleViewDetails = async (id) => {
        setIsModalOpen(true);
        setDetailsLoading(true);
        setSelectedCajero(null);
        try {
            const response = await showCajero(id);
            setSelectedCajero(response.data);
        } catch (error) {
            setAlert({ type: 'error', message: 'Error al ver detalles.' });
        } finally {
            setDetailsLoading(false);
        }
    };

    const executeToggleEstado = async () => {
        if (!cajeroToToggle) return;
        const nuevoEstado = cajeroToToggle.estado === 1 ? 0 : 1; 
        
        setCajeroToToggle(null);
        setLoading(true);
        try {
            const response = await toggleCajeroEstado(cajeroToToggle.id, nuevoEstado);
            setAlert({ type: 'success', message: response.message });
            await fetchCajeros(paginationInfo.currentPage, filters);
        } catch (err) {
            setAlert({ type: 'error', message: err.message });
            setLoading(false);
        }
    };

    // --- COLUMNAS ---
    const columns = useMemo(() => [
        {
            header: 'Usuario',
            render: (cajero) => <span className="font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">{cajero.username}</span>
        },
        {
            header: 'Nombre Completo',
            render: (cajero) => {
                const { nombre, apellidoPaterno, apellidoMaterno } = cajero.datos || {};
                return <span className="font-semibold text-gray-700">{`${nombre || ''} ${apellidoPaterno || ''} ${apellidoMaterno || ''}`}</span>;
            }
        },
        {
            header: 'Estado',
            render: (cajero) => (
                <button 
                    onClick={() => setCajeroToToggle({ id: cajero.id, estado: cajero.estado })}
                    className={`px-3 py-1 font-bold text-xs rounded-full transition-colors ${
                        cajero.estado === 1
                            ? 'text-green-700 bg-green-100 hover:bg-red-100 hover:text-red-700'
                            : 'text-red-700 bg-red-100 hover:bg-green-100 hover:text-green-700'
                    }`}
                >
                    {cajero.estado === 1 ? 'ACTIVO' : 'INACTIVO'}
                </button>
            )
        },
        {
            header: 'Acciones',
            render: (cajero) => (
                <div className="flex gap-2">
                    <button onClick={() => handleViewDetails(cajero.id)} className="btn-icon-view bg-emerald-50 text-emerald-600 px-2 py-1 rounded flex items-center gap-1">
                        <EyeIcon className="w-4 h-4" /> Ver
                    </button>
                    <Link to={`/admin/editar-cajero/${cajero.id}`} className="btn-icon-edit bg-indigo-50 text-indigo-600 px-2 py-1 rounded flex items-center gap-1">
                        <PencilSquareIcon className="w-4 h-4" /> Editar
                    </Link>
                </div>
            )
        }
    ], []); 

    if (loading && cajeros.length === 0) return <LoadingScreen />;

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Gestión de Cajeros</h1>
                <Link to="/admin/agregar-cajero" className="btn-primary-shadow">
                    + Nuevo Cajero
                </Link>
            </div>

            <AlertMessage type={alert?.type} message={alert?.message} onClose={() => setAlert(null)} />

            {cajeroToToggle && (
                <ConfirmModal
                    message={`¿Cambiar estado a ${cajeroToToggle.estado === 1 ? 'INACTIVO' : 'ACTIVO'}?`}
                    subMessage="El cajero perderá acceso al sistema si se desactiva."
                    onConfirm={executeToggleEstado}
                    onCancel={() => setCajeroToToggle(null)}
                />
            )}
            
            <Table 
                columns={columns}
                data={cajeros}
                loading={loading}
                
                // Configuración de Filtros
                filterConfig={filterConfig}
                filters={filters}
                onFilterChange={handleFilterChange}
                onFilterSubmit={handleFilterSubmit} 
                onFilterClear={handleFilterClear}   

                pagination={{
                    currentPage: paginationInfo.currentPage,
                    totalPages: paginationInfo.totalPages,
                    onPageChange: (page) => fetchCajeros(page, filters)
                }}
            />
            
            {/* Modal Detalles */}
            <ViewModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title="Detalle del Cajero" 
                isLoading={detailsLoading}
            >
                {selectedCajero && (
                    <div className="space-y-6">
                        {/* Cabecera Modal */}
                        <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
                            <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-2xl">
                                {selectedCajero.datos?.nombre?.charAt(0) || 'C'}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    {selectedCajero.datos?.nombre} {selectedCajero.datos?.apellidoPaterno} {selectedCajero.datos?.apellidoMaterno}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                    <span className="bg-gray-100 px-2 py-0.5 rounded border text-xs font-mono text-gray-600">
                                        @{selectedCajero.username}
                                    </span>
                                    <span className="text-gray-300">|</span>
                                    <span className={`font-semibold ${selectedCajero.estado === 1 ? 'text-green-600' : 'text-red-600'}`}>
                                        {selectedCajero.estado === 1 ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Grid de Información */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {/* Datos Personales */}
                             <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <h4 className="font-bold text-gray-700 mb-3 border-b border-gray-200 pb-1">Datos Personales</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-gray-500">DNI:</span><span className="font-medium">{selectedCajero.datos?.dni}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Sexo:</span><span className="font-medium">{selectedCajero.datos?.sexo}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Nacimiento:</span><span className="font-medium">{selectedCajero.datos?.fechaNacimiento || 'N/A'}</span></div>
                                </div>
                             </div>
                             
                             {/* Info Contacto */}
                             <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <h4 className="font-bold text-gray-700 mb-3 border-b border-gray-200 pb-1">Contacto</h4>
                                <div className="space-y-2 text-sm">
                                    {selectedCajero.contactos?.length > 0 ? (
                                        selectedCajero.contactos.map((c, i) => (
                                            <div key={i} className="border-b pb-2 mb-2 last:border-0 last:mb-0 last:pb-0">
                                                <div className="block"><span className="text-xs text-gray-500 uppercase">Email:</span> <span className="font-medium">{c.correo}</span></div>
                                                <div className="block"><span className="text-xs text-gray-500 uppercase">Móvil:</span> <span className="font-medium">{c.telefonoMovil}</span></div>
                                            </div>
                                        ))
                                    ) : <span className="italic text-gray-400">Sin contacto</span>}
                                </div>
                             </div>
                        </div>
                    </div>
                )}
            </ViewModal>

        </div>
    );
};

export default ListarCajero;