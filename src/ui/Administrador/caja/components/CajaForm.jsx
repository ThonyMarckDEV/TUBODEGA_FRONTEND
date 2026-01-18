import React from 'react';

const CajaForm = ({ data, handleChange }) => {
  const baseInputClass = "w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-1 focus:ring-black focus:border-black outline-none transition-all";

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-700 mb-6 border-b pb-2">Datos de la Caja</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        
        <div className="md:col-span-2">
          <label htmlFor="nombre" className="block text-sm font-medium text-slate-600 mb-1">Nombre / Identificador</label>
          <input 
            id="nombre" 
            name="nombre" 
            type="text" 
            value={data.nombre} 
            onChange={handleChange} 
            placeholder="Ej. Caja 01 - Principal" 
            className={baseInputClass} 
            autoFocus
          />
          <p className="text-xs text-gray-400 mt-1">Este nombre identificará el punto de venta para los cajeros.</p>
        </div>

        <div>
            <label htmlFor="estado" className="block text-sm font-medium text-slate-600 mb-1">Estado Operativo</label>
            <select 
                id="estado" 
                name="estado" 
                value={data.estado} 
                onChange={handleChange} 
                className={baseInputClass}
            >
                <option value={1}>Activa (Disponible para uso)</option>
                <option value={0}>Inactiva (En mantenimiento)</option>
            </select>
        </div>
        
      </div>
    </div>
  );
};

export default CajaForm;