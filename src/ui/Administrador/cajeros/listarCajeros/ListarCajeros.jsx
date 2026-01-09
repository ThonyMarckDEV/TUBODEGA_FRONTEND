// src/pages/cajeros/ListarCajero.jsx
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
    
    // View Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCajero, setSelectedCajero] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
    const [searchTerm, setSearchTerm] = useState('');

    const handleViewDetails = async (id) => {
        setIsModalOpen(true);
        setDetailsLoading(true);
        setSelectedCajero(null);
        try {
            const response = await showCajero(id);
            setSelectedCajero(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setDetailsLoading(false);
        }
    };

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
                    className={`px-3 py-1 font-bold text-xs rounded-full transition-colors duration-150 ${
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

    const fetchCajeros = useCallback(async (page, search = '') => {
        setLoading(true);
        try {
            const response = await getCajeros(page, search);
            setCajeros(response.data || []);
            setPaginationInfo({
                currentPage: response.current_page,
                totalPages: response.last_page,
                totalItems: response.total,
            });
        } catch (err) {
            setAlert({
                type: 'error',
                message: 'Error al cargar cajeros.'
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCajeros(1, ''); }, [fetchCajeros]);

    const executeToggleEstado = async () => {
        if (!cajeroToToggle) return;
        const nuevoEstado = cajeroToToggle.estado === 1 ? 0 : 1;
        setCajeroToToggle(null);
        setLoading(true);
        try {
            const response = await toggleCajeroEstado(cajeroToToggle.id, nuevoEstado);
            setAlert(response);
            await fetchCajeros(paginationInfo.currentPage, searchTerm);
        } catch (err) {
            setAlert(err);
            setLoading(false);
        }
    };

    if (loading && cajeros.length === 0) return <LoadingScreen />;

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Gestión de Cajeros</h1>
                <Link to="/admin/agregar-cajero" className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
                    + Nuevo Cajero
                </Link>
            </div>

            <AlertMessage type={alert?.type} message={alert?.message} onClose={() => setAlert(null)} />

            {cajeroToToggle && (
                <ConfirmModal
                    message={`¿Cambiar estado a ${cajeroToToggle.estado === 1 ? 'INACTIVO' : 'ACTIVO'}?`}
                    onConfirm={executeToggleEstado}
                    onCancel={() => setCajeroToToggle(null)}
                />
            )}
            
            <Table 
                columns={columns}
                data={cajeros}
                loading={loading}
                pagination={{
                    currentPage: paginationInfo.currentPage,
                    totalPages: paginationInfo.totalPages,
                    onPageChange: (page) => fetchCajeros(page, searchTerm)
                }}
                onSearch={(term) => { setSearchTerm(term); fetchCajeros(1, term); }}
                searchPlaceholder="Buscar por Usuario o Nombre"
            />
            
            {/* MODAL DETALLES DEL CAJERO */}
            <ViewModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title="Detalle del Cajero" 
                isLoading={detailsLoading}
            >
                {selectedCajero && (
                    <div className="space-y-6">
                        
                        {/* 1. Encabezado con Avatar y Estado */}
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* 2. Datos Personales */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <h4 className="font-bold text-gray-700 mb-3 border-b border-gray-200 pb-1">
                                    Datos Personales
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">DNI:</span>
                                        <span className="font-medium text-gray-900">{selectedCajero.datos?.dni}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Sexo:</span>
                                        <span className="font-medium text-gray-900">{selectedCajero.datos?.sexo}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Fecha Nacimiento:</span>
                                        <span className="font-medium text-gray-900">{selectedCajero.datos?.fechaNacimiento || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">RUC:</span>
                                        <span className="font-medium text-gray-900">{selectedCajero.datos?.ruc || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Información de Contacto */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <h4 className="font-bold text-gray-700 mb-3 border-b border-gray-200 pb-1">
                                    Información de Contacto
                                </h4>
                                <div className="space-y-3">
                                    {selectedCajero.contactos && selectedCajero.contactos.length > 0 ? (
                                        selectedCajero.contactos.map((contacto, index) => (
                                            <div key={index} className="text-sm bg-white p-2 rounded shadow-sm border border-gray-100">
                                                <div className="flex flex-col">
                                                    <span className="text-gray-500 text-xs uppercase">Email</span>
                                                    <span className="font-medium text-gray-800 break-all">{contacto.correo || 'N/A'}</span>
                                                </div>
                                                <div className="flex flex-col mt-1">
                                                    <span className="text-gray-500 text-xs uppercase">Teléfono Móvil</span>
                                                    <span className="font-medium text-gray-800">{contacto.telefonoMovil || 'N/A'}</span>
                                                </div>
                                                {contacto.telefonoFijo && (
                                                    <div className="flex flex-col mt-1">
                                                        <span className="text-gray-500 text-xs uppercase">Teléfono Fijo</span>
                                                        <span className="font-medium text-gray-800">{contacto.telefonoFijo}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No hay información de contacto registrada.</p>
                                    )}
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