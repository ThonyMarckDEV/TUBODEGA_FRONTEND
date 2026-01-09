// src/ui/Administrador/roles/listarRoles/ListarRoles.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getRoles } from 'services/rolService';
import LoadingScreen from 'components/Shared/LoadingScreen';
import Table from 'components/Shared/Tables/Table';

const ListarRoles = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const [roles, setRoles] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ 
        currentPage: 1, 
        totalPages: 1, 
        totalItems: 0 
    });

    const columns = useMemo(() => [
        { 
            header: 'ID', 
            accessor: 'id'
        },
        { 
            header: 'Nombre', 
            accessor: 'nombre'
        },
        { 
            header: 'Descripción', 
            accessor: 'descripcion'
        },
    ], []);

    const fetchRoles = useCallback(async (page) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getRoles(page); 
            setRoles(data.data);
            setPaginationInfo({
                currentPage: data.current_page,
                totalPages: data.last_page,
                totalItems: data.total,
            });
        } catch (err) {
            setError('No se pudieron cargar los roles.');
            console.error(err);
        } finally {
            setLoading(false);
            if (isInitialLoad) setIsInitialLoad(false); 
        }
    }, [isInitialLoad]);

    useEffect(() => {
        fetchRoles(paginationInfo.currentPage);
    }, [paginationInfo.currentPage, fetchRoles]);

    const handlePageChange = (page) => {
        setPaginationInfo(prev => ({ ...prev, currentPage: page }));
    };

    if (isInitialLoad && loading) return <LoadingScreen />;

    if (error) return <div className="text-center p-8 text-red-600">{error}</div>;

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Listado de Roles</h1>
            
            <Table 
                columns={columns}
                data={roles}
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

export default ListarRoles;