import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getClientes, toggleClienteEstado, showCliente } from 'services/clienteService'; 
import LoadingScreen from 'components/Shared/LoadingScreen';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import Table from 'components/Shared/Tables/Table';
import ViewModal from 'components/Shared/Modals/ViewModal';
import { EyeIcon, PencilSquareIcon, FunnelIcon } from '@heroicons/react/24/outline'; // Agregamos FunnelIcon

const ListarCliente = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [alert, setAlert] = useState(null);

    const [clienteToToggle, setClienteToToggle] = useState(null);
    const [clientes, setClientes] = useState([]);
    
    // --- ESTADOS DE FILTRO ---
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState(''); // Estado del filtro select

    // --- ESTADOS PARA EL MODAL ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const [paginationInfo, setPaginationInfo] = useState({ 
        currentPage: 1, 
        totalPages: 1, 
        totalItems: 0 
    });

    // --- FUNCIÓN DE CARGA (Actualizada con estado) ---
    const fetchClientes = useCallback(async (page, search = '', estado = '') => {
        setLoading(true);
        setError(null);
        try {
            const response = await getClientes(page, search, estado);
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
        }
    }, []);

    // Efecto principal: Recarga cuando cambia el filtro de estado
    useEffect(() => {
        fetchClientes(1, searchTerm, filterEstado);
    }, [fetchClientes, filterEstado , searchTerm]); // searchTerm lo manejamos en el evento del buscador, filterEstado aquí

    // --- HANDLERS ---
    
    const handleSearchTable = (term) => {
        setSearchTerm(term);
        fetchClientes(1, term, filterEstado); 
    };

    const handlePageChange = (page) => {
        fetchClientes(page, searchTerm, filterEstado);
    };

    const handleFilterEstadoChange = (e) => {
        setFilterEstado(e.target.value);
        // El useEffect detectará el cambio y recargará
    };

    // --- MODAL Y TOGGLE ---
    const handleViewDetails = async (id) => {
        setIsModalOpen(true);
        setDetailsLoading(true);
        setSelectedCliente(null);
        try {
            const response = await showCliente(id);
            setSelectedCliente(response.data);
        } catch (error) {
            console.error("Error al cargar detalles", error);
        } finally {
            setDetailsLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedCliente(null), 300); 
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
            // Recargamos manteniendo filtros actuales
            await fetchClientes(paginationInfo.currentPage, searchTerm, filterEstado); 
        } catch (err) {
            setAlert(err); 
            setLoading(false);
        }
    };

    // --- DEFINICIÓN DE COLUMNAS (Igual que antes) ---
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
                    >
                        <EyeIcon className="w-4 h-4" /> Ver
                    </button>
                    <Link 
                        to={`/admin/editar-cliente/${cliente.id}`} 
                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium text-sm bg-indigo-50 px-2 py-1 rounded transition-colors"
                    >
                        <PencilSquareIcon className="w-4 h-4" /> Editar
                    </Link>
                </div>
            )
        }
    ], []);

    if (loading && clientes.length === 0) return <LoadingScreen />;
    if (error) return <div className="text-center p-8 text-red-600">{error}</div>;

    return (
        <div className="container mx-auto p-6">

            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-slate-800">Clientes</h1>
                
                <div className="flex items-center gap-3">
                    {/* FILTRO DE ESTADO */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FunnelIcon className="h-4 w-4 text-gray-400" />
                        </div>
                        <select
                            value={filterEstado}
                            onChange={handleFilterEstadoChange}
                            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-black focus:border-black appearance-none cursor-pointer hover:border-gray-400 transition-colors"
                        >
                            <option value="">Todos los estados</option>
                            <option value="1">Activos</option>
                            <option value="0">Inactivos</option>
                        </select>
                    </div>

                    <Link to="/admin/agregar-cliente" className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm font-medium">
                        + Nuevo Cliente
                    </Link>
                </div>
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

            {/* MODAL DETALLES (Sin cambios en lógica interna) */}
            <ViewModal 
                isOpen={isModalOpen} 
                onClose={closeModal} 
                title="Información Detallada"
                isLoading={detailsLoading}
            >
                {selectedCliente && (
                    // ... (El contenido de tu modal se mantiene igual) ...
                    <div className="space-y-6">
                         {/* ... Copia aquí el contenido del modal que ya tenías ... */}
                         {/* Para abreviar la respuesta, asumo que mantienes tu diseño de modal */}
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
                                </div>
                            </div>
                        </div>
                        {/* ... Resto de campos del modal ... */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {/* ... Datos ... */}
                             <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <h4 className="font-bold text-gray-700 mb-2">Información Legal</h4>
                                <p className="text-sm"><span className="text-gray-500">Documento:</span> {selectedCliente.datos?.ruc || selectedCliente.datos?.dni}</p>
                             </div>
                             {/* ... Contactos ... */}
                             <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <h4 className="font-bold text-gray-700 mb-2">Contactos</h4>
                                <div className="space-y-2 text-sm">
                                    {selectedCliente.contactos?.map((c, i) => (
                                        <div key={i} className="bg-white p-2 rounded border border-gray-200">
                                            <p className="font-medium">{c.correo}</p>
                                            <p className="text-gray-500">Movil: {c.telefonoMovil}</p>
                                        </div>
                                    ))}
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