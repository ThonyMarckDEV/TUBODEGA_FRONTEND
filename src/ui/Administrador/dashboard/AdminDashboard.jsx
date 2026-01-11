import React, { useEffect, useState } from 'react';
import { getDashboardMetrics } from 'services/adminDashboardService';
import { 
    UsersIcon, CurrencyDollarIcon, ShoppingBagIcon, 
    ExclamationTriangleIcon, UserGroupIcon, BanknotesIcon,
    CalendarIcon, XMarkIcon, MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

// IMPORTAMOS RECHARTS
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

// --- MODAL DE PRODUCTOS BAJO STOCK ---
const LowStockModal = ({ isOpen, onClose, products }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100">
                {/* Header Modal */}
                <div className="bg-red-50 p-4 border-b border-red-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                            <ExclamationTriangleIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-red-900">Alerta de Inventario</h3>
                            <p className="text-sm text-red-700">Productos que requieren reposición inmediata</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-red-100 rounded-full text-red-500 transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Body Modal - Lista */}
                <div className="p-0 max-h-[60vh] overflow-y-auto">
                    {products.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            ¡Todo en orden! No hay productos con bajo stock.
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 font-bold sticky top-0">
                                <tr>
                                    <th className="px-6 py-3">Producto</th>
                                    <th className="px-6 py-3 text-center">Stock Actual</th>
                                    <th className="px-6 py-3 text-center">Mínimo</th>
                                    <th className="px-6 py-3 text-center">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {products.map((prod) => (
                                    <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-3 font-medium text-slate-800">{prod.nombre}</td>
                                        <td className="px-6 py-3 text-center">
                                            <span className="font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                                                {prod.stock_bodega} {prod.unidad}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-center text-slate-500">{prod.stock_minimo} {prod.unidad}</td>
                                        <td className="px-6 py-3 text-center">
                                            {prod.stock_bodega === 0 ? (
                                                <span className="text-xs font-bold text-red-700 uppercase">Agotado</span>
                                            ) : (
                                                <span className="text-xs font-bold text-orange-600 uppercase">Crítico</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer Modal */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-medium transition-colors"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE DE TARJETA (METRIC CARD) ---
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

const COLORS_PIE = ['#10B981', '#EF4444'];

const AdminDashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Estados para Filtros
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    
    // Estado para Modal
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

    if (loading && !metrics) return <div className="p-10 text-center text-slate-500 animate-pulse">Cargando métricas...</div>;
    if (!metrics) return null;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount || 0);
    };

    const dataInventario = [
        { name: 'Stock Saludable', value: metrics.inventario.stock_saludable },
        { name: 'Bajo Stock', value: metrics.inventario.bajo_stock },
    ];

    return (
        <div className="space-y-6 mt-6 animate-fade-in-up pb-10">
            {/* --- HEADER CON FILTROS --- */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-700">Resumen del Negocio</h2>
                    <p className="text-xs text-slate-400 mt-1">{metrics.finanzas.rango || 'Histórico'}</p>
                </div>

                <form onSubmit={handleFilterSubmit} className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
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
                         <button type="button" onClick={handleClearFilter} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors" title="Limpiar filtro">
                            <XMarkIcon className="w-4 h-4"/>
                         </button>
                    )}
                </form>
            </div>
            
            {/* --- KPIs --- */}
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
                
                {/* --- TARJETA CLICKEABLE PARA MODAL --- */}
                 <MetricCard 
                    title="Bajo Stock (Bodega)"
                    value={metrics.inventario.bajo_stock}
                    subValue="Reponer urgente"
                    icon={ExclamationTriangleIcon}
                    color={{ bg: 'bg-red-50', text: 'text-red-600' }}
                    isClickable={true}
                    onClick={() => setIsModalOpen(true)}
                />
            </div>

            {/* --- GRÁFICOS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm lg:col-span-2 relative">
                    {loading && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl"><span className="text-sm font-bold text-slate-500">Actualizando...</span></div>}
                    
                    <h3 className="text-slate-700 font-bold mb-4">Balance Financiero</h3>
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
                    <div className="text-center mt-2">
                        <p className="text-sm text-slate-500">Total: <span className="font-bold text-slate-800">{metrics.inventario.total_productos}</span> productos</p>
                    </div>
                </div>
            </div>

            {/* --- MODAL --- */}
            <LowStockModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                products={metrics.inventario.lista_bajo_stock} 
            />
        </div>
    );
};

export default AdminDashboard;