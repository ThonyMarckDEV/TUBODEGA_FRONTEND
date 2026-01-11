import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const MetricCard = ({ title, value, subValue, icon: Icon, color, onClick, isClickable }) => (
    <div 
        onClick={isClickable ? onClick : undefined}
        className={`bg-white p-6 rounded-xl border border-slate-100 shadow-sm transition-all
            ${isClickable ? 'cursor-pointer hover:shadow-lg hover:border-red-200 hover:-translate-y-1' : 'hover:shadow-md'}
        `}
    >
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${color.bg} ${color.text}`}>
                <Icon className="w-6 h-6" />
            </div>
            {subValue && (
                <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                    {subValue}
                </span>
            )}
        </div>
        <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wide">{title}</p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{value}</h3>
            {isClickable && (
                <p className="text-xs text-red-500 mt-2 font-medium flex items-center gap-1">
                    <MagnifyingGlassIcon className="w-3 h-3"/> Ver detalles
                </p>
            )}
        </div>
    </div>
);

export default MetricCard;