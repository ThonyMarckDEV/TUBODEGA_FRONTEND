import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getKardex } from 'services/kardexService'; 
import Table from 'components/Shared/Tables/Table';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/solid';
import AlertMessage from 'components/Shared/Errors/AlertMessage';

const ReporteKardex = () => {
    const [loading, setLoading] = useState(true);
    const [movimientos, setMovimientos] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1 });
    const [alert, setAlert] = useState(null);

    // --- ESTADO DE FILTROS ---
    const [filters, setFilters] = useState({
        producto_id: '',
        fecha_inicio: '',
        fecha_fin: '',
        tipo: '',
        ubicacion: ''
    });

    // ---  REFERENCIA DE FILTROS  ---
    const filtersRef = useRef(filters);
    useEffect(() => {
        filtersRef.current = filters;
    }, [filters]);

    // --- CONFIGURACIÓN VISUAL DE FILTROS (Pasados a la Tabla) ---
    const filterConfig = useMemo(() => [
        {
            name: 'producto_id',
            type: 'text',
            label: 'Producto',
            placeholder: 'Buscar por ID de producto...',
            colSpan: 'md:col-span-2'
        },
        {
            name: 'fecha_inicio',
            type: 'date',
            label: 'Desde',
            colSpan: 'md:col-span-2'
        },
        {
            name: 'fecha_fin',
            type: 'date',
            label: 'Hasta',
            colSpan: 'md:col-span-2'
        },
        {
            name: 'tipo',
            type: 'select',
            label: 'Movimiento',
            colSpan: 'md:col-span-2',
            options: [
                { value: '', label: 'Todos' },
                { value: 'ENTRADA', label: 'Entradas (+)' },
                { value: 'SALIDA', label: 'Salidas (-)' }
            ]
        },
        {
            name: 'ubicacion',
            type: 'select',
            label: 'Ubicación',
            colSpan: 'md:col-span-3',
            options: [
                { value: '', label: 'Todas' },
                { value: 'BODEGA', label: 'Bodega (Tienda)' },
                { value: 'ALMACEN', label: 'Almacén (Reserva)' }
            ]
        }
    ], []);

    // --- FETCH DATA  ---
    const fetchKardex = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const currentFilters = filtersRef.current;
            
            const response = await getKardex(page, currentFilters);
            
            setMovimientos(response.data || []);
            setPaginationInfo({
                currentPage: response.current_page,
                totalPages: response.last_page,
            });
        } catch (err) {
            setAlert({ type: 'error', message: 'Error al cargar el historial del Kardex.' });
        } finally {
            setLoading(false);
        }
    }, []); 

    // Carga inicial (Solo una vez)
    useEffect(() => {
        fetchKardex(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ---  HANDLERS ---
    const handleFilterChange = useCallback((name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    }, []);

    // Submit estable (llamado por el debounce de la tabla)
    const handleSearchSubmit = useCallback(() => {
        fetchKardex(1);
    }, [fetchKardex]);

    // Limpiar estable
    const handleFilterClear = useCallback(() => {
        const emptyFilters = { producto_id: '', fecha_inicio: '', fecha_fin: '', tipo: '', ubicacion: '' };
        setFilters(emptyFilters);
        filtersRef.current = emptyFilters; // Actualizar ref inmediatamente
        fetchKardex(1);
    }, [fetchKardex]);

    // --- 6. COLUMNAS ---
    const columns = useMemo(() => [
        {
            header: 'Fecha',
            render: (row) => (
                <div className="text-sm">
                    <div className="font-medium text-gray-800">{new Date(row.fecha).toLocaleDateString()}</div>
                    <div className="text-gray-500 text-xs">{new Date(row.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
            )
        },
        {
            header: 'Producto / Referencia',
            render: (row) => (
                <div>
                    <span className="font-bold text-gray-700 block">{row.producto?.nombre}</span>
                    {row.referencia && (
                        <span className="text-[10px] bg-gray-200 text-gray-600 px-1 rounded uppercase font-mono">
                            Ref: {row.referencia}
                        </span>
                    )}
                </div>
            )
        },
        {
            header: 'Movimiento',
            render: (row) => (
                <div>
                    <div className={`flex items-center gap-1 font-bold text-xs px-2 py-1 rounded-full w-fit mb-1 ${
                        row.tipo_movimiento === 'ENTRADA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                        {row.tipo_movimiento === 'ENTRADA' ? <ArrowDownIcon className="w-3 h-3" /> : <ArrowUpIcon className="w-3 h-3" />}
                        {row.tipo_movimiento}
                    </div>
                    <span className="text-xs text-gray-500 italic block max-w-[150px] truncate" title={row.motivo}>
                        {row.motivo}
                    </span>
                </div>
            )
        },
        {
            header: 'Ubicación',
            render: (row) => (
                <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    row.ubicacion === 'ALMACEN' 
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-orange-50 text-orange-700 border-orange-200'
                }`}>
                    {row.ubicacion}
                </span>
            )
        },
        {
            header: 'Stock Ini.',
            render: (row) => <span className="text-gray-500">{row.stock_anterior}</span>
        },
        {
            header: 'Cant.',
            render: (row) => (
                <span className={`font-bold ${row.tipo_movimiento === 'ENTRADA' ? 'text-green-600' : 'text-red-600'}`}>
                    {row.tipo_movimiento === 'ENTRADA' ? '+' : '-'}{row.cantidad}
                </span>
            )
        },
        {
            header: 'Stock Fin.',
            render: (row) => (
                <span className="font-bold text-slate-900 bg-yellow-100 px-2 py-1 rounded border border-yellow-200">
                    {row.stock_resultante}
                </span>
            )
        }
    ], []);

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Kardex (Historial de Inventario)</h1>

            <AlertMessage type={alert?.type} message={alert?.message} onClose={() => setAlert(null)} />

            {/* TABLA CON FILTROS INTEGRADOS */}
            <Table 
                columns={columns}
                data={movimientos}
                loading={loading}
                
                // Configuración de Filtros
                filterConfig={filterConfig}
                filters={filters}
                onFilterChange={handleFilterChange}
                onFilterSubmit={handleSearchSubmit}
                onFilterClear={handleFilterClear}

                // Paginación
                pagination={{
                    currentPage: paginationInfo.currentPage,
                    totalPages: paginationInfo.totalPages,
                    onPageChange: (page) => fetchKardex(page)
                }}
            />
        </div>
    );
};

export default ReporteKardex;