import React from 'react';

const CategoriaForm = ({ data, handleChange }) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      
      {/* Campo: Nombre */}
      <div>
        <label 
          htmlFor="nombre" 
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Nombre de la Categoría <span className="text-red-500">*</span>
        </label>
        <input 
          id="nombre" 
          name="nombre" 
          type="text" 
          value={data.nombre || ''}
          onChange={handleChange} 
          placeholder="Ej. Bebidas, Abarrotes" 
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          required
        />
      </div>

      {/* Campo: Descripción */}
      <div>
        <label 
          htmlFor="descripcion" 
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Descripción <span className="text-slate-400">(Opcional)</span>
        </label>
        <textarea 
          id="descripcion" 
          name="descripcion" 
          rows="4"
          value={data.descripcion || ''} 
          onChange={handleChange} 
          placeholder="Breve descripción de la categoría..." 
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
        />
      </div>

    </div>
  );
};

export default CategoriaForm;