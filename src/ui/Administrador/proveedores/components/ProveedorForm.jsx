import React from 'react';

const ProveedorForm = ({ data, handleChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Campo: Razón Social (Ocupa las 2 columnas en pantallas medianas) */}
      <div className="md:col-span-2">
        <label 
          htmlFor="razon_social" 
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Razón Social <span className="text-red-500">*</span>
        </label>
        <input 
          id="razon_social" 
          name="razon_social" 
          type="text" 
          value={data.razon_social || ''} 
          onChange={handleChange} 
          placeholder="Ej. Distribuidora Sullana S.A.C." 
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          required
        />
      </div>

      {/* Campo: RUC */}
      <div>
        <label 
          htmlFor="ruc" 
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          RUC <span className="text-slate-400">(11 dígitos)</span>
        </label>
        <input 
          id="ruc" 
          name="ruc" 
          type="text" 
          maxLength="11"
          value={data.ruc || ''} 
          onChange={handleChange} 
          placeholder="Ej. 20123456789" 
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
        />
      </div>

      {/* Campo: Teléfono */}
      <div>
        <label 
          htmlFor="telefono" 
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Teléfono <span className="text-slate-400">(Opcional)</span>
        </label>
        <input 
          id="telefono" 
          name="telefono" 
          type="text" 
          value={data.telefono || ''} 
          onChange={handleChange} 
          placeholder="Ej. 999 888 777" 
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
        />
      </div>

    </div>
  );
};

export default ProveedorForm;