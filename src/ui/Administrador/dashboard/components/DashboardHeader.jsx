import React from 'react';
import { CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline';

const DashboardHeader = ({ rangeText, dateRange, setDateRange, onSubmit, onClear }) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
            <div>
                <h2 className="text-lg font-bold text-slate-700">Resumen del Negocio</h2>
                <p className="text-xs text-slate-400 mt-1">{rangeText || 'Histórico'}</p>
            </div>

            <form onSubmit={onSubmit} className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 px-2">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-500">Filtrar:</span>
                </div>
                <input 
                    type="date" 
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-200 text-slate-600"
                />
                <span className="text-slate-300">-</span>
                <input 
                    type="date" 
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-200 text-slate-600"
                />
                <button type="submit" className="bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors">
                    Aplicar
                </button>
                {(dateRange.start || dateRange.end) && (
                     <button type="button" onClick={onClear} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors" title="Limpiar filtro">
                        <XMarkIcon className="w-4 h-4"/>
                     </button>
                )}
            </form>
        </div>
    );
};

export default DashboardHeader;