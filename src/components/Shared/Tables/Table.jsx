// src/components/Shared/Table.jsx
import React, { useState } from 'react';
import Pagination from '../Pagination';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'; // Asegúrate de tener heroicons instalado

const Table = ({ 
    columns, 
    data, 
    loading = false, 
    pagination = null, 
    onSearch = null, // NUEVA PROP: Función que recibe el texto a buscar
    searchPlaceholder = "Buscar..." // NUEVA PROP: Texto del placeholder
}) => {
    
    const [searchTerm, setSearchTerm] = useState('');

    // Maneja el clic en "Buscar" o Enter
    const handleSearchSubmit = () => {
        if (onSearch) {
            onSearch(searchTerm);
        }
    };

    // Maneja la tecla Enter
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearchSubmit();
        }
    };

    // Maneja el botón de limpiar "X"
    const handleClear = () => {
        setSearchTerm('');
        if (onSearch) {
            onSearch(''); // Envía vacío para resetear la lista
        }
    };

    return (
        <div className="w-full">
            
            {/* --- SECCIÓN DEL BUSCADOR (Solo se renderiza si pasas onSearch) --- */}
            {onSearch && (
                <div className="mb-4 flex gap-2 items-center max-w-md">
                    <div className="relative w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-black focus:ring-1 focus:ring-black sm:text-sm transition duration-150 ease-in-out"
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={loading}
                        />
                        {/* Botón X para limpiar */}
                        {searchTerm && (
                            <button 
                                onClick={handleClear}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                    
                    <button
                        onClick={handleSearchSubmit}
                        disabled={loading}
                        className="px-4 py-2 bg-black text-white rounded-md hover:bg-zinc-800 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                        Buscar
                    </button>
                </div>
            )}

            {/* --- CONTENEDOR DE LA TABLA --- */}
            <div className={`bg-white shadow-md rounded-lg overflow-hidden transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
                                {columns.map((col, index) => (
                                    <th key={index} className="px-5 py-3 font-semibold tracking-wider">
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.length > 0 ? (
                                data.map((row, rowIndex) => (
                                    <tr key={row.id || rowIndex} className="border-b border-gray-200 hover:bg-gray-50">
                                        {columns.map((col, colIndex) => (
                                            <td key={`${rowIndex}-${colIndex}`} className="px-5 py-4 text-sm">
                                                {col.render 
                                                    ? col.render(row) 
                                                    : row[col.accessor]}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-8 text-gray-500">
                                        No se encontraron datos.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- PAGINACIÓN --- */}
            {pagination && (
                <div className="mt-4">
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