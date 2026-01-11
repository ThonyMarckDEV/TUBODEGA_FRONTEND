import React, { useEffect, useState } from 'react';
import { getDashboardMetrics } from 'services/adminDashboardService';
// Importamos iconos
import { 
    UsersIcon, CurrencyDollarIcon, ShoppingBagIcon, 
    ExclamationTriangleIcon, UserGroupIcon, BanknotesIcon
} from '@heroicons/react/24/outline';

// IMPORTAMOS RECHARTS
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

// --- COMPONENTE DE TARJETA (METRIC CARD) ---
const MetricCard = ({ title, value, subValue, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
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
        </div>
    </div>
);

// --- COLORES PARA GRÁFICO DE DONA ---
const COLORS_PIE = ['#10B981', '#EF4444']; // Verde (Bien), Rojo (Bajo Stock)

const AdminDashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMetrics = async () => {
            try {
                const response = await getDashboardMetrics();
                if (response.type === 'success') {
                    setMetrics(response.data);
                }
            } catch (error) {
                console.error("Error cargando dashboard:", error);
            } finally {
                setLoading(false);
            }
        };
        loadMetrics();
    }, []);

    if (loading) return <div className="p-10 text-center text-slate-500 animate-pulse">Cargando métricas...</div>;
    if (!metrics) return null;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount || 0);
    };

    // Datos para el Pie Chart (Inventario)
    const dataInventario = [
        { name: 'Stock Saludable', value: metrics.inventario.stock_saludable },
        { name: 'Bajo Stock', value: metrics.inventario.bajo_stock },
    ];

    return (
        <div className="space-y-6 mt-6 animate-fade-in-up pb-10">
            <h2 className="text-lg font-bold text-slate-700">Resumen del Negocio</h2>
            
            {/* --- SECCIÓN DE TARJETAS (KPIs) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard 
                    title="Ingresos Totales"
                    value={formatCurrency(metrics.finanzas.ingresos_totales)}
                    subValue={`Hoy: ${formatCurrency(metrics.finanzas.ventas_hoy)}`}
                    icon={CurrencyDollarIcon}
                    color={{ bg: 'bg-green-50', text: 'text-green-600' }}
                />
                <MetricCard 
                    title="Utilidad Neta"
                    value={formatCurrency(metrics.finanzas.utilidad_neta)}
                    subValue="Histórico"
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
                />
            </div>

            {/* --- SECCIÓN DE GRÁFICOS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                
                {/* 1. GRÁFICO DE BALANCE SEMANAL (Ocupa 2 columnas) */}
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm lg:col-span-2">
                    <h3 className="text-slate-700 font-bold mb-4">Balance Semanal (Ventas vs Gastos)</h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={metrics.graficos.balance_semanal}>
                                <defs>
                                    <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [`S/ ${value}`, '']}
                                />
                                <Legend verticalAlign="top" height={36}/>
                                <Area type="monotone" dataKey="ventas" name="Ventas" stroke="#10B981" fillOpacity={1} fill="url(#colorVentas)" strokeWidth={2} />
                                <Area type="monotone" dataKey="gastos" name="Gastos" stroke="#EF4444" fillOpacity={1} fill="url(#colorGastos)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. GRÁFICO DE ESTADO DE INVENTARIO (Ocupa 1 columna) */}
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <h3 className="text-slate-700 font-bold mb-4">Salud del Inventario</h3>
                    <div className="h-72 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={dataInventario}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {dataInventario.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [value, 'Productos']} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Resumen rápido abajo del gráfico */}
                    <div className="text-center mt-2">
                        <p className="text-sm text-slate-500">Total: <span className="font-bold text-slate-800">{metrics.inventario.total_productos}</span> productos</p>
                    </div>
                </div>

            </div>

             {/* 3. USUARIOS (Tarjetas pequeñas extra) */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                 <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">
                    <div>
                        <p className="text-blue-600 font-bold">Clientes Totales</p>
                        <p className="text-2xl font-bold text-blue-800">{metrics.clientes.total}</p>
                    </div>
                    <UserGroupIcon className="w-10 h-10 text-blue-300" />
                 </div>
                 <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex justify-between items-center">
                    <div>
                        <p className="text-purple-600 font-bold">Cajeros Totales</p>
                        <p className="text-2xl font-bold text-purple-800">{metrics.cajeros.total}</p>
                    </div>
                    <UsersIcon className="w-10 h-10 text-purple-300" />
                 </div>
             </div>
        </div>
    );
};

export default AdminDashboard;