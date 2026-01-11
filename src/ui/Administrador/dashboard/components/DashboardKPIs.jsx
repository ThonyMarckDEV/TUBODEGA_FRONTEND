import React from 'react';
import MetricCard from './MetricCard';
import { 
    CurrencyDollarIcon, BanknotesIcon, ShoppingBagIcon, 
    ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

const DashboardKPIs = ({ metrics, formatCurrency, onOpenLowStock }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard 
                title="Ingresos (Rango)"
                value={formatCurrency(metrics.finanzas.ingresos_totales)}
                subValue={`Hoy: ${formatCurrency(metrics.finanzas.ventas_hoy)}`}
                icon={CurrencyDollarIcon}
                color={{ bg: 'bg-green-50', text: 'text-green-600' }}
            />
            <MetricCard 
                title="Utilidad Neta"
                value={formatCurrency(metrics.finanzas.utilidad_neta)}
                subValue="En rango seleccionado"
                icon={BanknotesIcon}
                color={{ bg: 'bg-indigo-50', text: 'text-indigo-600' }}
            />
            <MetricCard 
                title="Total Productos"
                value={metrics.inventario.total_productos}
                subValue="En catálogo"
                icon={ShoppingBagIcon}
                color={{ bg: 'bg-orange-50', text: 'text-orange-600' }}
            />
            <MetricCard 
                title="Bajo Stock (Bodega)"
                value={metrics.inventario.bajo_stock}
                subValue="Reponer urgente"
                icon={ExclamationTriangleIcon}
                color={{ bg: 'bg-red-50', text: 'text-red-600' }}
                isClickable={true}
                onClick={onOpenLowStock}
            />
        </div>
    );
};

export default DashboardKPIs;