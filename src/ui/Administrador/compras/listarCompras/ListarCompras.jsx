import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getCompras } from 'services/compraService'; 
import LoadingScreen from 'components/Shared/LoadingScreen';
import Table from 'components/Shared/Tables/Table';

const ListarCompras = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [compras, setCompras] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
    const [searchTerm, setSearchTerm] = useState('');

    const columns = useMemo(() => [
        {
            header: 'ID',
            accessor: 'id'
        },
        {
            header: 'Fecha',
            render: (row) => new Date(row.created_at).toLocaleDateString() + ' ' + new Date(row.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        },
        {
            header: 'Proveedor',
            render: (row) => (
                <div>
                    <div className="font-semibold text-gray-800">{row.proveedor?.razon_social || 'Desconocido'}</div>
                    <div className="text-xs text-gray-500">{row.proveedor?.ruc}</div>
                </div>
            )
        },
        {
            header: 'Total',
            render: (row) => <span className="font-bold text-slate-800">S/. {parseFloat(row.total).toFixed(2)}</span>
        },
        {
            header: 'Acciones',
            render: (row) => (
                <div className="flex gap-4">
                    <Link 
                        to={`/admin/editar-compra/${row.id}`} 
                        className="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
                    >
                        Ver / Editar
                    </Link>
                </div>
            )
        }
    ], []);

    const fetchCompras = useCallback(async (page, search = '') => {
        setLoading(true);
        setError(null);
        try {
            const response = await getCompras(page, search);
            setCompras(response.data || []); 
            setPaginationInfo({
                currentPage: response.current_page,
                totalPages: response.last_page,
                totalItems: response.total,
            });
        } catch (err) {
            setError('Error al cargar compras.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCompras(1, '');
    }, [fetchCompras]);

    const handleSearchTable = (term) => {
        setSearchTerm(term); 
        fetchCompras(1, term);
    };

    const handlePageChange = (page) => {
        fetchCompras(page, searchTerm);
    };

    if (loading && compras.length === 0) return <LoadingScreen />;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Registro de Compras</h1>
                <Link to="/admin/agregar-compra" className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
                    + Nueva Compra
                </Link>
            </div>

            <Table 
                columns={columns}
                data={compras}
                loading={loading}
                pagination={{
                    currentPage: paginationInfo.currentPage,
                    totalPages: paginationInfo.totalPages,
                    onPageChange: handlePageChange
                }}
                onSearch={handleSearchTable} 
                searchPlaceholder="Buscar por proveedor..."
            />
        </div>
    );
};

export default ListarCompras;