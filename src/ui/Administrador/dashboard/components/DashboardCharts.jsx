import React from 'react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { UserGroupIcon, UsersIcon } from '@heroicons/react/24/outline';

const COLORS_PIE = ['#10B981', '#EF4444'];

const DashboardCharts = ({ metrics, loading }) => {
    
    const dataInventario = [
        { name: 'Stock Saludable', value: metrics.inventario.stock_saludable },
        { name: 'Bajo Stock', value: metrics.inventario.bajo_stock },
    ];

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* GRÁFICO DE BALANCE */}
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm lg:col-span-2 relative">
                    {loading && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
                            <span className="text-sm font-bold text-slate-500 animate-pulse">Actualizando datos...</span>
                        </div>
                    )}
                    
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

                {/* GRÁFICO DE DONA */}
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

            {/* TARJETAS EXTRA (Usuarios) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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
        </>
    );
};

export default DashboardCharts;