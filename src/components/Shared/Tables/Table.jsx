// src/components/Shared/Tables/Table.jsx
import React from 'react';
import Pagination from '../Pagination';
import { FunnelIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const Table = ({ 
    columns, 
    data, 
    loading = false, 
    pagination = null,
    filterConfig = [], 
    filters = {},
    onFilterChange = () => {},
    onFilterSubmit = () => {},
    onFilterClear = () => {}
}) => {

    // Maneja el cambio en cualquier input
    const handleInput = (e, name) => {
        onFilterChange(name, e.target.value);
    };

    // Permite buscar al presionar Enter
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onFilterSubmit();
        }
    };

    // Renderiza el input correcto según el tipo (text, select, date)
    const renderFilterInput = (config) => {
        const baseClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all disabled:bg-gray-100 disabled:text-gray-400";

        switch (config.type) {
            case 'select':
                return (
                    <select
                        name={config.name}
                        value={filters[config.name] || ''}
                        onChange={(e) => handleInput(e, config.name)}
                        disabled={loading}
                        className={`${baseClass} bg-white cursor-pointer`}
                    >
                        {config.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                );
            
            case 'date':
                return (
                    <input
                        type="date"
                        name={config.name}
                        value={filters[config.name] || ''}
                        onChange={(e) => handleInput(e, config.name)}
                        disabled={loading}
                        className={baseClass}
                    />
                );

            case 'text':
            default:
                return (
                    <div className="relative">
                        <input
                            type="text"
                            name={config.name}
                            placeholder={config.placeholder || ''}
                            value={filters[config.name] || ''}
                            onChange={(e) => handleInput(e, config.name)}
                            onKeyDown={handleKeyDown}
                            disabled={loading}
                            className={`${baseClass} pl-9`}
                        />
                        <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                    </div>
                );
        }
    };

    return (
        <div className="w-full flex flex-col gap-4">
            
            {/* --- SECCIÓN DE FILTROS DINÁMICOS --- */}
            {filterConfig.length > 0 && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        {filterConfig.map((field, index) => (
                            <div key={index} className={field.colSpan || "md:col-span-12"}>
                                {field.label && (
                                    <label className="block text-xs font-bold text-gray-500 mb-1">
                                        {field.label}
                                    </label>
                                )}
                                {renderFilterInput(field)}
                            </div>
                        ))}

                        {/* Botones de Acción (Filtrar / Limpiar) */}
                        <div className="md:col-span-2 flex gap-2 h-[38px]"> {/* Altura fija para alinear con inputs */}
                            <button 
                                type="button" 
                                onClick={onFilterSubmit}
                                disabled={loading}
                                className="flex-1 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-black transition flex justify-center items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FunnelIcon className="w-4 h-4" /> 
                                <span className="hidden lg:inline">Filtrar</span>
                            </button>
                            <button 
                                type="button" 
                                onClick={onFilterClear} 
                                disabled={loading}
                                className="px-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 border border-gray-200 transition disabled:opacity-50"
                                title="Limpiar filtros"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TABLA DE DATOS --- */}
            <div className={`bg-white shadow-md rounded-lg overflow-hidden transition-opacity duration-300 ${loading ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
                <div className="overflow-x-auto min-h-[200px]">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr className="bg-slate-50 text-left text-slate-600 uppercase text-xs tracking-wider border-b border-slate-200">
                                {columns.map((col, index) => (
                                    <th key={index} className="px-5 py-3 font-bold">
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {data.length > 0 ? (
                                data.map((row, rowIndex) => (
                                    <tr key={row.id || rowIndex} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
                                        {columns.map((col, colIndex) => (
                                            <td key={`${rowIndex}-${colIndex}`} className="px-5 py-4 text-sm text-slate-700">
                                                {col.render ? col.render(row) : row[col.accessor]}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-16 text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <MagnifyingGlassIcon className="w-8 h-8 opacity-20" />
                                            <span className="text-sm">No se encontraron registros</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- PAGINACIÓN --- */}
            {pagination && (
                <div className="mt-2">
                    <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={pagination.onPageChange}
                    />
                </div>
            )}
        </div>
    );
};

export default Table;