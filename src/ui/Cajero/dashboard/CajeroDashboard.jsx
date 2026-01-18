import React, { useEffect, useState } from 'react';
import { getCajeroDashboardMetrics } from 'services/cajeroDashboardService';

// Reutilizamos tus componentes existentes
import DashboardHeader from './components/DashboardHeader';
import MetricCard from './components/MetricCard';

// Iconos y Gráficos
import { CurrencyDollarIcon, DocumentTextIcon, ChartBarIcon, ClockIcon, CalculatorIcon } from '@heroicons/react/24/outline';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CajeroDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const fetchMetrics = async (start = '', end = '') => {
        setLoading(true);
        try {
            const response = await getCajeroDashboardMetrics(start, end);
            if (response.type === 'success') {
                setData(response.data);
            }
        } catch (error) {
            console.error("Error dashboard cajero:", error);
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

    const formatMoney = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount || 0);

    if (loading && !data) return <div className="p-10 text-center animate-pulse text-slate-500">Cargando tus métricas...</div>;
    if (!data) return null;

    return (
        <div className="space-y-6 mt-6 pb-10 max-w-[1600px] mx-auto p-4 animate-fade-in-up">
            
            {/* 1. Header con Filtros */}
            <DashboardHeader 
                rangeText={data.resumen.rango_fecha}
                dateRange={dateRange}
                setDateRange={setDateRange}
                onSubmit={handleFilterSubmit}
                onClear={handleClearFilter}
            />

            {/* 2. KPIs Específicos para Cajero */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* KPI 1: DINERO */}
                <MetricCard 
                    title="Ventas Totales Hoy"
                    value={formatMoney(data.resumen.hoy_total)}
                    icon={CurrencyDollarIcon}
                    color={{ bg: 'bg-emerald-50', text: 'text-emerald-600' }}
                />

                {/* KPI 2: CANTIDAD  */}
                <MetricCard 
                    title="Comprobantes Hoy"
                    value={data.resumen.hoy_comprobantes} 
                    subValue="Transacciones"
                    icon={DocumentTextIcon} // Cambié el icono a Documento para que cuadre mejor
                    color={{ bg: 'bg-blue-50', text: 'text-blue-600' }}
                />

                {/* KPI 3: ACUMULADO */}
                <MetricCard 
                    title="Total en Rango"
                    value={formatMoney(data.resumen.rango_total)}
                    subValue="Acumulado"
                    icon={ChartBarIcon}
                    color={{ bg: 'bg-purple-50', text: 'text-purple-600' }}
                />

                {/* KPI 4: PROMEDIO (CAMBIADO "TICKET PROMEDIO" POR "PROMEDIO X VENTA") */}
                <MetricCard 
                    title="Promedio por Venta"
                    value={formatMoney(data.resumen.ticket_promedio)}
                    subValue="Valor Medio"
                    icon={CalculatorIcon}
                    color={{ bg: 'bg-amber-50', text: 'text-amber-600' }}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 3. Gráfico de Rendimiento Personal */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-700 mb-6">Tendencia de mis ventas</h3>
                    
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.graficos.rendimiento}>
                                <defs>
                                    <linearGradient id="colorVentasCajero" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <Tooltip 
                                    formatter={(value) => [`S/ ${value}`, 'Mis Ventas']}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="mis_ventas" 
                                    stroke="#10B981" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorVentasCajero)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. Mini Tabla: Mis Últimos Comprobantes */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <ClockIcon className="w-5 h-5 text-slate-400" />
                        Últimos Movimientos
                    </h3>
                    <div className="space-y-4">
                        {data.recientes.length > 0 ? (
                            data.recientes.map((venta) => (
                                <div key={venta.id} className="flex justify-between items-center border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            {/* Aquí mostramos Comprobante #ID en lugar de Venta #ID si prefieres */}
                                            <span className="font-bold text-slate-700 text-sm">Comp. #{venta.id}</span>
                                            <span className="text-[10px] bg-slate-100 px-1.5 rounded text-slate-500">{venta.hora}</span>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-0.5">{venta.metodo}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-emerald-600 text-sm">{formatMoney(venta.total)}</p>
                                        <p className="text-xs text-slate-400 truncate max-w-[100px]" title={venta.cliente}>
                                            {venta.cliente}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-slate-400 text-sm">No has emitido comprobantes hoy.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CajeroDashboard;