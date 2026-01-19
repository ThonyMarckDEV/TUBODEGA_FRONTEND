import React from 'react';

const ProveedorForm = ({ data, handleChange }) => {

  const validateAndChange = (e) => {
    const { name, value } = e.target;

    // VALIDACIÓN: SOLO NÚMEROS (RUC y Teléfono)
    if (name === 'ruc' || name === 'telefono') {
        const soloNumeros = /^[0-9]*$/;
        if (!soloNumeros.test(value)) return;
    }
    
    handleChange(e);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Campo: Razón Social */}
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
          onChange={validateAndChange} 
          placeholder="Ej. Distribuidora Sullana S.A.C." 
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border outline-none"
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
          onChange={validateAndChange} 
          placeholder="Ej. 20123456789" 
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border outline-none"
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
          type="tel" 
          maxLength="9" 
          value={data.telefono || ''} 
          onChange={validateAndChange} 
          placeholder="Ej. 999888777" 
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border outline-none"
        />
      </div>

    </div>
  );
};

export default ProveedorForm;