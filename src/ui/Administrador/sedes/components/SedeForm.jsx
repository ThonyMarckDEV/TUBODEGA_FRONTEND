import React from 'react';

const SedeForm = ({ data, handleChange }) => {
  const baseInputClass = "w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all";

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-700 mb-6 border-b pb-2">Información de la Sede</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        
        <div className="col-span-1 md:col-span-2">
          <label htmlFor="nombre" className="block text-sm font-medium text-slate-600 mb-1">Nombre de la Sede</label>
          <input 
            id="nombre" 
            name="nombre" 
            type="text" 
            value={data.nombre} 
            onChange={handleChange} 
            placeholder="Ej. Sucursal Centro" 
            className={baseInputClass} 
            required
          />
        </div>

        <div>
          <label htmlFor="codigo_sunat" className="block text-sm font-medium text-slate-600 mb-1">Código SUNAT (Opcional)</label>
          <input 
            id="codigo_sunat" 
            name="codigo_sunat" 
            type="text" 
            value={data.codigo_sunat} 
            onChange={handleChange} 
            placeholder="Ej. 0001" 
            className={baseInputClass} 
            maxLength="4"
          />
          <p className="text-xs text-gray-400 mt-1">Usado para facturación electrónica.</p>
        </div>

        <div className="col-span-1 md:col-span-2">
          <label htmlFor="direccion" className="block text-sm font-medium text-slate-600 mb-1">Dirección Física</label>
          <input 
            id="direccion" 
            name="direccion" 
            type="text" 
            value={data.direccion} 
            onChange={handleChange} 
            placeholder="Ej. Av. Principal 123" 
            className={baseInputClass} 
          />
        </div>

      </div>
    </div>
  );
};

export default SedeForm;