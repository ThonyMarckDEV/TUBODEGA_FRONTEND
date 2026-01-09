// src/ui/Administrador/clientes/listarClientes/ListarClientes.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getClientes, toggleClienteEstado } from 'services/clienteService'; 
import LoadingScreen from 'components/Shared/LoadingScreen';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import Table from 'components/Shared/Tables/Table'

const ListarCliente = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [alert, setAlert] = useState(null);

    const [clienteToToggle, setClienteToToggle] = useState(null);
    const [clientes, setClientes] = useState([]);
    
    const [paginationInfo, setPaginationInfo] = useState({ 
        currentPage: 1, 
        totalPages: 1, 
        totalItems: 0 
    });
    const [currentPage, setCurrentPage] = useState(1);

    // DEFINICIÓN DE COLUMNAS
    const columns = useMemo(() => [
        {
            header: 'DNI',
            // Usamos render porque el dato está anidado en 'datos'
            render: (cliente) => cliente.datos?.dni || 'N/A'
        },
        {
            header: 'Nombre Completo',
            render: (cliente) => {
                const { nombre, apellidoPaterno, apellidoMaterno } = cliente.datos || {};
                return `${nombre || ''} ${apellidoPaterno || ''} ${apellidoMaterno || ''}`;
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
                    className={`px-3 py-1 font-semibold leading-tight rounded-full text-sm transition-colors duration-150 ${
                        cliente.estado === 1
                            ? 'text-green-700 bg-green-100 hover:bg-red-100 hover:text-red-700'
                            : 'text-red-700 bg-red-100 hover:bg-green-100 hover:text-green-700'
                    }`}
                >
                    {cliente.estado === 1 ? 'Activo' : 'Inactivo'}
                </button>
            )
        },
        {
            header: 'Acciones',
            render: (cliente) => (
                <Link 
                    to={`/admin/editar-cliente/${cliente.id}`} 
                    className="text-indigo-600 hover:text-indigo-900 font-medium"
                >
                    Editar
                </Link>
            )
        }
    ], [loading]); // Dependencia 'loading' para deshabilitar botones si es necesario

    const fetchClientes = useCallback(async (page) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getClientes(page);
            setClientes(data.data);
            setPaginationInfo({
                currentPage: data.current_page,
                totalPages: data.last_page,
                totalItems: data.total,
            });
        } catch (err) {
            setError('No se pudieron cargar los clientes. Por favor, intente de nuevo más tarde.');
            console.error(err);
        } finally {
            setLoading(false);
            if (isInitialLoad) setIsInitialLoad(false); 
        }
    }, [isInitialLoad]);

    useEffect(() => {
        fetchClientes(currentPage);
    }, [currentPage, fetchClientes]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
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
            await fetchClientes(currentPage); 
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
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Listado de Clientes</h1>

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
            {/* TABLA REUTILIZABLE */}
            <Table 
                columns={columns}
                data={clientes}
                loading={loading}
                pagination={{
                    currentPage: paginationInfo.currentPage,
                    totalPages: paginationInfo.totalPages,
                    onPageChange: handlePageChange
                }}
            />
        </div>
    );
};

export default ListarCliente;