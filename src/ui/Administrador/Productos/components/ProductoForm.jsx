import React from 'react';
import CategoriaSearchSelect from 'components/Shared/Comboboxes/CategoriaSearchSelect';

const ProductoForm = ({ data, setData, handleChange, disabled = false }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* --- INTEGRACIÓN DEL BUSCADOR DE CATEGORÍAS --- */}
      <div className="md:col-span-2">
         {/* Pasamos form y setForm (data y setData) para que el componente maneje el estado */}
         <CategoriaSearchSelect 
            form={data} 
            setForm={setData} 
            disabled={disabled} 
         />
      </div>

      {/* Campo: Nombre */}
      <div className="md:col-span-2">
        <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 mb-1">
          Nombre del Producto <span className="text-red-500">*</span>
        </label>
        <input 
          id="nombre" 
          name="nombre" 
          type="text" 
          value={data.nombre || ''} 
          onChange={handleChange} 
          placeholder="Ej. Coca Cola 3L" 
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2 border"
          required
          disabled={disabled}
        />
      </div>

      {/* Campo: Unidad */}
      <div>
        <label htmlFor="unidad" className="block text-sm font-medium text-slate-700 mb-1">
          Unidad de Medida <span className="text-red-500">*</span>
        </label>
        <select
            id="unidad"
            name="unidad"
            value={data.unidad || 'unidad'}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2 border bg-white"
            disabled={disabled}
        >
            <option value="unidad">Unidad (und)</option>
            <option value="kg">Kilogramo (kg)</option>
            <option value="litro">Litro (L)</option>
            <option value="caja">Caja</option>
            <option value="paquete">Paquete</option>
        </select>
      </div>

      {/* Campo: Stock Mínimo */}
      <div>
        <label htmlFor="stock_minimo" className="block text-sm font-medium text-slate-700 mb-1">
          Stock Mínimo Alerta
        </label>
        <input 
          id="stock_minimo" 
          name="stock_minimo" 
          type="number" 
          min="0"
          value={data.stock_minimo || ''} 
          onChange={handleChange} 
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2 border"
          disabled={disabled}
        />
      </div>

      {/* Campo: Precio Compra */}
      <div>
        <label htmlFor="precio_compra" className="block text-sm font-medium text-slate-700 mb-1">
          Precio Compra (S/.) <span className="text-red-500">*</span>
        </label>
        <input 
          id="precio_compra" 
          name="precio_compra" 
          type="number" 
          step="0.01"
          min="0"
          value={data.precio_compra || ''} 
          onChange={handleChange} 
          placeholder="0.00" 
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2 border"
          required
          disabled={disabled}
        />
      </div>

      {/* Campo: Precio Venta */}
      <div>
        <label htmlFor="precio_venta" className="block text-sm font-medium text-slate-700 mb-1">
          Precio Venta (S/.) <span className="text-red-500">*</span>
        </label>
        <input 
          id="precio_venta" 
          name="precio_venta" 
          type="number" 
          step="0.01"
          min="0"
          value={data.precio_venta || ''} 
          onChange={handleChange} 
          placeholder="0.00" 
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2 border"
          required
          disabled={disabled}
        />
      </div>

    </div>
  );
};

export default ProductoForm;