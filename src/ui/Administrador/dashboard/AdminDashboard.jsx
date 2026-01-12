import React, { useEffect, useState } from 'react';
import { getDashboardMetrics } from 'services/adminDashboardService';

import DashboardHeader from './components/DashboardHeader';
import DashboardKPIs from './components/DashboardKPIs';
import DashboardCharts from './components/DashboardCharts';
import LowStockModal from './components/LowStockModal';

const AdminDashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchMetrics = async (start = '', end = '') => {
        setLoading(true);
        try {
            const response = await getDashboardMetrics(start, end);
            if (response.type === 'success') {
                setMetrics(response.data);
            }
        } catch (error) {
            console.error("Error cargando dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();
    }, []);

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        fetchMetrics(dateRange.start, dateRange.end);
    };

    const handleClearFilter = () => {
        setDateRange({ start: '', end: '' });
        fetchMetrics();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount || 0);
    };

    if (loading && !metrics) {
        return <div className="p-10 text-center text-slate-500 animate-pulse">Cargando métricas del sistema...</div>;
    }

    if (!metrics) return null;

    return (
        <div className="space-y-6 mt-6 animate-fade-in-up pb-10">
            
            {/* 1. Encabezado y Filtros */}
            <DashboardHeader 
                rangeText={metrics.finanzas.rango}
                dateRange={dateRange}
                setDateRange={setDateRange}
                onSubmit={handleFilterSubmit}
                onClear={handleClearFilter}
            />
            
            {/* 2. Tarjetas de Indicadores (KPIs) */}
            <DashboardKPIs 
                metrics={metrics}
                formatCurrency={formatCurrency}
                onOpenLowStock={() => setIsModalOpen(true)}
            />

            {/* 3. Gráficos */}
            <DashboardCharts 
                metrics={metrics}
                loading={loading}
            />

            {/* 4. Modal (Popup) */}
            <LowStockModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                products={metrics.inventario.lista_bajo_stock} 
            />
        </div>
    );
};

export default AdminDashboard;