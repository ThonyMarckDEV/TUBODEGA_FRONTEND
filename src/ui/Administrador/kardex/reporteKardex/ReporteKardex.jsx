import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getKardex } from 'services/kardexService'; 
import LoadingScreen from 'components/Shared/LoadingScreen';
import Table from 'components/Shared/Tables/Table';
import ProductoSearchSelect from 'components/Shared/Comboboxes/ProductoSearchSelect';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/solid';

const ReporteKardex = () => {
    const [loading, setLoading] = useState(true);
    const [movimientos, setMovimientos] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1 });
    
    // --- FILTROS ---
    // Usamos la estructura que espera tu ProductoSearchSelect
    const [filterForm, setFilterForm] = useState({
        id_Producto: null,
        productoNombre: '',
        fecha_inicio: '',
        fecha_fin: '',
        tipo: ''
    });

    // Función para actualizar filtros (inputs normales)
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilterForm(prev => ({ ...prev, [name]: value }));
    };

    // Carga de datos
    const fetchKardex = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            // Mapeamos el estado del formulario a lo que espera el servicio
            const filters = {
                producto_id: filterForm.id_Producto,
                fecha_inicio: filterForm.fecha_inicio,
                fecha_fin: filterForm.fecha_fin,
                tipo: filterForm.tipo
            };

            const response = await getKardex(page, filters);
            setMovimientos(response.data || []);
            setPaginationInfo({
                currentPage: response.current_page,
                totalPages: response.last_page,
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [filterForm]); // Se recarga si cambian los filtros

    // Efecto inicial y cuando cambian filtros (puedes agregar debounce si prefieres)
    useEffect(() => {
        fetchKardex(1);
    }, [fetchKardex]);

    // --- COLUMNAS ---
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
            header: 'Producto',
            render: (row) => (
                <div>
                    <span className="font-bold text-gray-700">{row.producto?.nombre}</span>
                    <span className="text-xs text-gray-500 block">{row.observacion}</span>
                </div>
            )
        },
        {
            header: 'Movimiento',
            render: (row) => (
                <div className={`flex items-center gap-1 font-bold text-xs px-2 py-1 rounded-full w-fit ${
                    row.tipo_movimiento === 'ENTRADA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                    {row.tipo_movimiento === 'ENTRADA' ? <ArrowDownIcon className="w-3 h-3" /> : <ArrowUpIcon className="w-3 h-3" />}
                    {row.tipo_movimiento}
                </div>
            )
        },
        {
            header: 'Cantidad',
            render: (row) => (
                <span className={`font-bold ${row.tipo_movimiento === 'ENTRADA' ? 'text-green-600' : 'text-red-600'}`}>
                    {row.tipo_movimiento === 'ENTRADA' ? '+' : '-'}{row.cantidad}
                </span>
            )
        },
        {
            header: 'Saldo Final',
            render: (row) => (
                <span className="font-bold text-slate-800 bg-gray-100 px-2 py-1 rounded">
                    {row.stock_resultante}
                </span>
            )
        }
    ], []);

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Kardex (Historial de Inventario)</h1>

            {/* --- BARRA DE FILTROS --- */}
            <div className="bg-white p-4 rounded-lg shadow mb-6 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    
                    {/* 1. Filtro Producto (Combobox Reutilizable) */}
                    <div className="md:col-span-2">
                        <ProductoSearchSelect 
                            form={filterForm} 
                            setForm={setFilterForm} 
                        />
                    </div>

                    {/* 2. Filtro Fecha Inicio */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Desde</label>
                        <input 
                            type="date" 
                            name="fecha_inicio"
                            value={filterForm.fecha_inicio}
                            onChange={handleFilterChange}
                            className="w-full border-gray-300 rounded-md text-sm p-2"
                        />
                    </div>

                    {/* 3. Filtro Tipo */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Tipo</label>
                        <select 
                            name="tipo" 
                            value={filterForm.tipo}
                            onChange={handleFilterChange}
                            className="w-full border-gray-300 rounded-md text-sm p-2 bg-white"
                        >
                            <option value="">Todos</option>
                            <option value="ENTRADA">Entradas</option>
                            <option value="SALIDA">Salidas</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* --- TABLA DE RESULTADOS --- */}
            {loading && movimientos.length === 0 ? (
                <LoadingScreen />
            ) : (
                <Table 
                    columns={columns}
                    data={movimientos}
                    loading={loading}
                    pagination={{
                        currentPage: paginationInfo.currentPage,
                        totalPages: paginationInfo.totalPages,
                        onPageChange: (page) => fetchKardex(page)
                    }}
                    // Ocultamos el buscador genérico de la tabla porque ya tenemos filtros arriba
                    onSearch={null} 
                />
            )}
        </div>
    );
};

export default ReporteKardex;