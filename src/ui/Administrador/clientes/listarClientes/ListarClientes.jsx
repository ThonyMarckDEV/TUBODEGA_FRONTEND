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
    const [error, setError] = useState(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [alert, setAlert] = useState(null);

    const [clienteToToggle, setClienteToToggle] = useState(null);
    const [clientes, setClientes] = useState([]);
    
    // --- ESTADOS PARA EL MODAL DE VER ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const [paginationInfo, setPaginationInfo] = useState({ 
        currentPage: 1, 
        totalPages: 1, 
        totalItems: 0 
    });
    const [searchTerm, setSearchTerm] = useState('');

    // --- FUNCIÓN PARA VER DETALLES ---
    const handleViewDetails = async (id) => {
        setIsModalOpen(true);
        setDetailsLoading(true);
        setSelectedCliente(null); // Limpiar data anterior

        try {
            const response = await showCliente(id);
            setSelectedCliente(response.data);
        } catch (error) {
            console.error("Error al cargar detalles del cliente", error);
            // Opcional: mostrar alerta de error
        } finally {
            setDetailsLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        // Pequeño delay para limpiar la data visualmente después de cerrar la animación
        setTimeout(() => setSelectedCliente(null), 300); 
    };

    // DEFINICIÓN DE COLUMNAS
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
                
                // Si es empresa, solo mostramos el nombre. Si es persona, nombre + apellidos.
                const nombreMostrar = esEmpresa 
                    ? nombre 
                    : `${nombre || ''} ${apellidoPaterno || ''} ${apellidoMaterno || ''}`;

                return (
                    <div className="max-w-xs overflow-hidden">
                        <div className="font-semibold text-gray-700 truncate uppercase">
                            {nombreMostrar}
                        </div>
                        {esEmpresa && (
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-1 rounded">EMPRESA</span>
                        )}
                    </div>
                );
            }
        },
        {
            header: 'Fecha de Registro',
            render: (cliente) => new Date(cliente.created_at).toLocaleDateString()
        },
        {
            header: 'Estado',
            render: (cliente) => (
                <button 
                    onClick={() => handleToggleEstado(cliente.id, cliente.estado)}
                    disabled={loading}
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
                        className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-medium text-sm bg-emerald-50 px-2 py-1 rounded transition-colors"
                        title="Ver Detalles"
                    >
                        <EyeIcon className="w-4 h-4" /> Ver
                    </button>

                    <Link 
                        to={`/admin/editar-cliente/${cliente.id}`} 
                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium text-sm bg-indigo-50 px-2 py-1 rounded transition-colors"
                        title="Editar Cliente"
                    >
                        <PencilSquareIcon className="w-4 h-4" /> Editar
                    </Link>
                </div>
            )
        }
    ], [loading]);

    const fetchClientes = useCallback(async (page , search = '') => {
        setLoading(true);
        setError(null);
        try {
            const response = await getClientes(page , search);
            setClientes(response.data || []);
            setPaginationInfo({
                currentPage: response.current_page,
                totalPages: response.last_page,
                totalItems: response.total,
            });
        } catch (err) {
            setError('No se pudieron cargar los clientes.');
            console.error(err);
        } finally {
            setLoading(false);
            if (isInitialLoad) setIsInitialLoad(false); 
        }
    }, [isInitialLoad]);

    useEffect(() => {
        fetchClientes(1, '');
    }, [fetchClientes]);

    const handleSearchTable = (term) => {
        setSearchTerm(term);
        fetchClientes(1, term); 
    };

    const handlePageChange = (page) => {
        fetchClientes(page, searchTerm);
    };

    const handleToggleEstado = (clienteId, currentEstado) => {
        setClienteToToggle({ id: clienteId, estado: currentEstado });
    };

    const executeToggleEstado = async () => {
        if (!clienteToToggle) return;

        const { id, estado } = clienteToToggle;
        const nuevoEstado = estado === 1 ? 0 : 1;
        
        setClienteToToggle(null);
        setLoading(true);

        try {
            const response = await toggleClienteEstado(id, nuevoEstado);
            setAlert(response);
            await fetchClientes(paginationInfo.currentPage, searchTerm); 
        } catch (err) {
            console.error("Error al cambiar estado:", err);
            setAlert(err); 
            setLoading(false);
        }
    };

    if (isInitialLoad && loading) return <LoadingScreen />;
    if (error) return <div className="text-center p-8 text-red-600">{error}</div>;

    return (
        <div className="container mx-auto p-6">

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Clientes</h1>
                <Link to="/admin/agregar-cliente" className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
                    + Nuevo Cliente
                </Link>
            </div>

            <AlertMessage
                type={alert?.type}
                message={alert?.message}
                details={alert?.details}
                onClose={() => setAlert(null)}
            />

            {clienteToToggle && (
                <ConfirmModal
                    message={`¿Desea cambiar el estado de este cliente a ${clienteToToggle.estado === 1 ? 'INACTIVO' : 'ACTIVO'}?`}
                    onConfirm={executeToggleEstado}
                    onCancel={() => setClienteToToggle(null)}
                />
            )}
            
            <Table 
                columns={columns}
                data={clientes}
                loading={loading}
                pagination={{
                    currentPage: paginationInfo.currentPage,
                    totalPages: paginationInfo.totalPages,
                    onPageChange: handlePageChange
                }}
                onSearch={handleSearchTable}
                searchPlaceholder="Buscar por DNI o Nombre"
            />

            {/* --- MODAL DE DETALLES DEL CLIENTE --- */}
            <ViewModal 
                isOpen={isModalOpen} 
                onClose={closeModal} 
                title="Información Detallada"
                isLoading={detailsLoading}
            >
                {selectedCliente && (() => {
                    // Detectamos si es empresa para adaptar el modal
                    const esEmpresa = !!selectedCliente.datos?.ruc;
                    const d = selectedCliente.datos;

                    return (
                        <div className="space-y-6">
                            
                            {/* 1. Encabezado Dinámico */}
                            <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
                                <div className={`h-16 w-16 rounded-full flex items-center justify-center font-bold text-2xl ${esEmpresa ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                    {d?.nombre?.charAt(0) || 'C'}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 uppercase">
                                        {esEmpresa ? d?.nombre : `${d?.nombre} ${d?.apellidoPaterno} ${d?.apellidoMaterno}`}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${esEmpresa ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                            {esEmpresa ? 'PERSONA JURÍDICA' : 'PERSONA NATURAL'}
                                        </span>
                                        <span className="text-gray-300">|</span>
                                        <span className={`font-semibold ${selectedCliente.estado === 1 ? 'text-green-600' : 'text-red-600'}`}>
                                            {selectedCliente.estado === 1 ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                
                                {/* 2. Datos Principales (Adaptado) */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <h4 className="font-bold text-gray-700 mb-3 border-b border-gray-200 pb-1">
                                        Información Legal
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        {/* Mostrar RUC o DNI según corresponda */}
                                        {esEmpresa ? (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">RUC:</span>
                                                <span className="font-medium text-gray-900">{d?.ruc}</span>
                                            </div>
                                        ) : (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">DNI:</span>
                                                <span className="font-medium text-gray-900">{d?.dni}</span>
                                            </div>
                                        )}

                                        {/* Solo mostrar Sexo si no es empresa */}
                                        {!esEmpresa && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Sexo:</span>
                                                <span className="font-medium text-gray-900">{d?.sexo}</span>
                                            </div>
                                        )}

                                        {/* Etiqueta de fecha dinámica */}
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">
                                                {esEmpresa ? 'Fecha de Constitución:' : 'Fecha de Nacimiento:'}
                                            </span>
                                            <span className="font-medium text-gray-900">
                                                {d?.fechaNacimiento ? new Date(d.fechaNacimiento).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Información de Contacto */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <h4 className="font-bold text-gray-700 mb-3 border-b border-gray-200 pb-1">
                                        Información de Contacto
                                    </h4>
                                    <div className="space-y-3">
                                        {selectedCliente.contactos && selectedCliente.contactos.length > 0 ? (
                                            selectedCliente.contactos.map((contacto, index) => (
                                                <div key={index} className="text-sm bg-white p-2 rounded shadow-sm border border-gray-100">
                                                    <div className="flex flex-col mb-2">
                                                        <span className="text-gray-400 text-[10px] font-bold uppercase">Correo Electrónico</span>
                                                        <span className="font-medium text-gray-800 break-all">{contacto.correo || 'No registrado'}</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="flex flex-col">
                                                            <span className="text-gray-400 text-[10px] font-bold uppercase">Móvil</span>
                                                            <span className="font-medium text-gray-800">{contacto.telefonoMovil || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-gray-400 text-[10px] font-bold uppercase">Fijo</span>
                                                            <span className="font-medium text-gray-800">{contacto.telefonoFijo || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">Sin contactos.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </ViewModal>
        </div>
    );
};

export default ListarCliente;