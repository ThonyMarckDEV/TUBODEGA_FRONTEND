// src/components/Shared/Table.jsx
import React from 'react';
import Pagination from '../Pagination';

const Table = ({ 
    columns, 
    data, 
    loading = false, 
    pagination = null // Objeto opcional: { currentPage, totalPages, onPageChange }
}) => {
    
    return (
        <div className="w-full">
            {/* Contenedor de la tabla con efecto de carga */}
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
                                                {/* LÓGICA CLAVE:
                                                    1. Si hay una función 'render', úsala (para botones, fechas, iconos).
                                                    2. Si no, usa el 'accessor' para sacar el dato directo del objeto.
                                                */}
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

            {/* Renderizar paginación solo si se pasan las props necesarias */}
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