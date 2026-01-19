import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const DatosAccesoForm = ({ data, handleChange, isEditing = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const baseInputClass = "w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all";

  const validateAndChange = (e) => {
    const { name, value } = e.target;

    // VALIDACIÓN USERNAME: No permitir espacios en blanco
    if (name === 'username') {
        if (/\s/.test(value)) return; 
    }

    handleChange(e);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-700 mb-6 border-b pb-2">3. Datos de Acceso al Sistema</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        
        <div className="md:col-span-2">
          <label htmlFor="username" className="block text-sm font-medium text-slate-600 mb-1">Nombre de Usuario</label>
          <input 
            id="username" name="username" type="text" 
            value={data.username} 
            onChange={validateAndChange} // Validamos sin espacios
            placeholder="Ej. jgonzalez" 
            className={baseInputClass} autoComplete="off"
          />
        </div>

        <div className="relative">
          <label htmlFor="password" className="block text-sm font-medium text-slate-600 mb-1">
            {isEditing ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}
          </label>
          <div className="relative">
            <input 
                id="password" name="password" 
                type={showPassword ? "text" : "password"} 
                value={data.password} onChange={handleChange} // Contraseña permite todo
                placeholder={isEditing ? "Dejar en blanco para mantener actual" : "********"} 
                className={`${baseInputClass} pr-10`} 
            />
            <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
            >
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="password_confirmation" className="block text-sm font-medium text-slate-600 mb-1">
             Confirmar Contraseña
          </label>
          <input 
            id="password_confirmation" name="password_confirmation" type="password" 
            value={data.password_confirmation} onChange={handleChange} 
            placeholder="Repite la contraseña" className={baseInputClass} 
          />
        </div>

      </div>
      {isEditing && (
        <div className="mt-4 flex items-center gap-2 bg-amber-50 p-3 rounded-md border border-amber-100">
           <span className="text-amber-600 text-lg">⚠️</span>
           <p className="text-xs text-amber-700">
             <strong>Nota:</strong> Si no deseas cambiar la contraseña del cajero, deja ambos campos de contraseña vacíos.
           </p>
        </div>
      )}
    </div>
  );
};

export default DatosAccesoForm;