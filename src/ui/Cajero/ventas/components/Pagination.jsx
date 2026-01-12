import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const Pagination = ({ current, last, total, onPageChange, loading }) => {
    if (total === 0) return null;

    const pageNumbers = [];
    for (let i = 1; i <= last; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-slate-500 font-medium order-2 sm:order-1">
                Total: <span className="text-black font-bold">{total}</span> productos
            </p>
            
            <div className="flex items-center gap-1 order-1 sm:order-2">
                {/* Botón Anterior */}
                <button
                    onClick={() => onPageChange(current - 1)}
                    disabled={current === 1 || loading}
                    className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-20 transition-colors mr-1"
                >
                    <ChevronLeftIcon className="w-4 h-4 text-slate-600" />
                </button>

                {/* Números de Página */}
                <div className="flex gap-1">
                    {pageNumbers.map((num) => (
                        <button
                            key={num}
                            onClick={() => onPageChange(num)}
                            disabled={loading}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                                current === num
                                    ? 'bg-black text-white border-black shadow-sm'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                            }`}
                        >
                            {num}
                        </button>
                    ))}
                </div>

                {/* Botón Siguiente */}
                <button
                    onClick={() => onPageChange(current + 1)}
                    disabled={current === last || loading}
                    className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-20 transition-colors ml-1"
                >
                    <ChevronRightIcon className="w-4 h-4 text-slate-600" />
                </button>
            </div>
        </div>
    );
};

export default Pagination;