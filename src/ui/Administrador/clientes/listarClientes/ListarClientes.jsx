import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getClientes, toggleClienteEstado, showCliente } from 'services/clienteService'; 
import LoadingScreen from 'components/Shared/LoadingScreen';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import Table from 'components/Shared/Tables/Table';
import ViewModal from 'components/Shared/Modals/ViewModal';
import { EyeIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

const ListarCliente = () => {
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);

    // Estados para acciones
    const [clienteToToggle, setClienteToToggle] = useState(null);
    const [clientes, setClientes] = useState([]);
    
    // Estados para Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCliente, setSelectedCliente] = useState(null);
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
            placeholder: 'DNI, RUC, Nombre, Razón Social...',
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

    // --- HANDLERS DE FILTROS ---
    const handleFilterChange = useCallback((name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    }, []);

    // --- FETCH DATA ---
    const fetchClientes = useCallback(async (page = 1, currentFilters = filters) => {
        setLoading(true);
        try {
            // Pasamos los parámetros individuales al servicio
            const response = await getClientes(
                page, 
                currentFilters.search, 
                currentFilters.estado
            );
            
            setClientes(response.data || []);
            setPaginationInfo({
                currentPage: response.current_page || 1,
                totalPages: response.last_page || 1,
                totalItems: response.total || 0,
            });
        } catch (err) {
            setAlert({ type: 'error', message: 'No se pudieron cargar los clientes.' });
        } finally {
            setLoading(false);
        }
    }, [filters]); 

    // Carga Inicial
    useEffect(() => {
        fetchClientes(1, { search: '', estado: '' });
    }, [fetchClientes]);

    // Submit Automático (Estable)
    const handleFilterSubmit = useCallback(() => {
        fetchClientes(1, filters);
    }, [fetchClientes, filters]);

    // Limpiar (Estable)
    const handleFilterClear = useCallback(() => {
        const cleanFilters = { search: '', estado: '' };
        setFilters(cleanFilters);
        fetchClientes(1, cleanFilters);
    }, [fetchClientes]);

    // --- LÓGICA DE ACCIONES ---
    const handleViewDetails = async (id) => {
        setIsModalOpen(true);
        setDetailsLoading(true);
        setSelectedCliente(null);
        try {
            const response = await showCliente(id);
            setSelectedCliente(response.data);
        } catch (error) {
            setAlert({ type: 'error', message: "Error al cargar detalles" });
        } finally {
            setDetailsLoading(false);
        }
    };

    const executeToggleEstado = async () => {
        if (!clienteToToggle) return;
        const { id, estado } = clienteToToggle;
        // Invertir estado (1 -> 0, 0 -> 1)
        const nuevoEstado = estado === 1 ? 0 : 1; 
        
        setClienteToToggle(null);
        setLoading(true);

        try {
            // Ajusta si tu servicio toggleClienteEstado requiere (id) o (id, nuevoEstado)
            const response = await toggleClienteEstado(id, nuevoEstado);
            setAlert({ type: 'success', message: response.message || 'Estado actualizado.' });
            await fetchClientes(paginationInfo.currentPage, filters); 
        } catch (err) {
            setAlert({ type: 'error', message: err.message || 'Error al cambiar estado.' }); 
            setLoading(false);
        }
    };

    // --- COLUMNAS ---
    const columns = useMemo(() => [
        {
            header: 'Documento',
            render: (cliente) => {
                const esEmpresa = !!cliente.datos?.ruc;
                return (
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                            {esEmpresa ? cliente.datos.ruc : cliente.datos?.dni || 'N/A'}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            {esEmpresa ? 'RUC (Empresa)' : 'DNI (Persona)'}
                        </span>
                    </div>
                );
            }
        },
        {
            header: 'Cliente / Razón Social',
            render: (cliente) => {
                const { nombre, apellidoPaterno, apellidoMaterno, ruc } = cliente.datos || {};
                const esEmpresa = !!ruc;
                const nombreMostrar = esEmpresa 
                    ? nombre 
                    : `${nombre || ''} ${apellidoPaterno || ''} ${apellidoMaterno || ''}`;

                return (
                    <div className="max-w-xs overflow-hidden">
                        <div className="font-semibold text-gray-700 truncate uppercase">
                            {nombreMostrar}
                        </div>
                        {esEmpresa && (
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-1 rounded border border-blue-100">
                                EMPRESA
                            </span>
                        )}
                    </div>
                );
            }
        },
        {
            header: 'Estado',
            render: (cliente) => (
                <button 
                    onClick={() => setClienteToToggle({ id: cliente.id, estado: cliente.estado })}
                    className={`px-3 py-1 font-bold text-xs rounded-full transition-colors duration-150 ${
                        cliente.estado === 1
                            ? 'text-green-700 bg-green-100 hover:bg-red-100 hover:text-red-700'
                            : 'text-red-700 bg-red-100 hover:bg-green-100 hover:text-green-700'
                    }`}
                >
                    {cliente.estado === 1 ? 'ACTIVO' : 'INACTIVO'}
                </button>
            )
        },
        {
            header: 'Acciones',
            render: (cliente) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleViewDetails(cliente.id)}
                        className="btn-icon-view bg-emerald-50 text-emerald-600 px-2 py-1 rounded flex items-center gap-1 hover:bg-emerald-100 transition-colors"
                    >
                        <EyeIcon className="w-4 h-4" /> Ver
                    </button>
                    <Link 
                        to={`/admin/editar-cliente/${cliente.id}`} 
                        className="btn-icon-edit bg-indigo-50 text-indigo-600 px-2 py-1 rounded flex items-center gap-1 hover:bg-indigo-100 transition-colors"
                    >
                        <PencilSquareIcon className="w-4 h-4" /> Editar
                    </Link>
                </div>
            )
        }
    ], []);

    if (loading && clientes.length === 0) return <LoadingScreen />;

    return (
        <div className="container mx-auto p-6">

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Gestión de Clientes</h1>
                <Link to="/admin/agregar-cliente" className="btn-primary-shadow">
                    + Nuevo Cliente
                </Link>
            </div>

            <AlertMessage
                type={alert?.type}
                message={alert?.message}
                onClose={() => setAlert(null)}
            />

            {clienteToToggle && (
                <ConfirmModal
                    message={`¿Desea cambiar el estado a ${clienteToToggle.estado === 1 ? 'INACTIVO' : 'ACTIVO'}?`}
                    subMessage="El cliente no podrá ser seleccionado en nuevas ventas si está inactivo."
                    onConfirm={executeToggleEstado}
                    onCancel={() => setClienteToToggle(null)}
                />
            )}
            
            <Table 
                columns={columns}
                data={clientes}
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
                    onPageChange: (page) => fetchClientes(page, filters)
                }}
            />

            {/* MODAL DETALLES */}
            <ViewModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title="Información Detallada"
                isLoading={detailsLoading}
            >
                {selectedCliente && (
                    <div className="space-y-6">
                         <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
                            <div className={`h-16 w-16 rounded-full flex items-center justify-center font-bold text-2xl ${!!selectedCliente.datos?.ruc ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                {selectedCliente.datos?.nombre?.charAt(0) || 'C'}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 uppercase">
                                    {!!selectedCliente.datos?.ruc ? selectedCliente.datos?.nombre : `${selectedCliente.datos?.nombre} ${selectedCliente.datos?.apellidoPaterno}`}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${!!selectedCliente.datos?.ruc ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                        {!!selectedCliente.datos?.ruc ? 'PERSONA JURÍDICA' : 'PERSONA NATURAL'}
                                    </span>
                                    <span className="text-gray-300">|</span>
                                    <span className={`font-semibold ${selectedCliente.estado === 1 ? 'text-green-600' : 'text-red-600'}`}>
                                        {selectedCliente.estado === 1 ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Información Legal</h4>
                                <div className="space-y-2 text-sm">
                                    <p className="flex justify-between"><span className="text-gray-500">Documento:</span> <span className="font-medium">{selectedCliente.datos?.ruc || selectedCliente.datos?.dni}</span></p>
                                    <p className="flex justify-between"><span className="text-gray-500">Registro:</span> <span className="font-medium">{new Date(selectedCliente.created_at).toLocaleDateString()}</span></p>
                                </div>
                             </div>
                             <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Contactos</h4>
                                <div className="space-y-2 text-sm">
                                    {selectedCliente.contactos?.length > 0 ? (
                                        selectedCliente.contactos.map((c, i) => (
                                            <div key={i} className="bg-white p-2 rounded border border-gray-200">
                                                {c.correo && <p className="font-medium text-gray-800">{c.correo}</p>}
                                                {c.telefonoMovil && <p className="text-gray-500 text-xs">Móvil: {c.telefonoMovil}</p>}
                                            </div>
                                        ))
                                    ) : <span className="italic text-gray-400">Sin datos de contacto</span>}
                                </div>
                             </div>
                        </div>
                    </div>
                )}
            </ViewModal>
        </div>
    );
};

export default ListarCliente;