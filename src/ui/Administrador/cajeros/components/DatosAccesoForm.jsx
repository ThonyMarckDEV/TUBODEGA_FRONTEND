// src/components/formularios/DatosAccesoForm.jsx
import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const DatosAccesoForm = ({ data, handleChange, isEditing = false }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-700 mb-6 border-b pb-2">3. Datos de Acceso al Sistema</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        
        {/* Usuario */}
        <div className="md:col-span-2">
          <label htmlFor="username" className="block text-sm font-medium text-slate-600 mb-1">Nombre de Usuario</label>
          <input 
            id="username" 
            name="username" 
            type="text" 
            value={data.username} 
            onChange={handleChange} 
            placeholder="Ej. jgonzalez" 
            className="input-style" 
            autoComplete="off"
          />
        </div>

        {/* Contraseña */}
        <div className="relative">
          <label htmlFor="password" className="block text-sm font-medium text-slate-600 mb-1">
            {isEditing ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}
          </label>
          <div className="relative">
            <input 
                id="password" 
                name="password" 
                type={showPassword ? "text" : "password"} 
                value={data.password} 
                onChange={handleChange} 
                placeholder={isEditing ? "Dejar en blanco para mantener actual" : "********"} 
                className="input-style pr-10" 
            />
            <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Confirmar Contraseña */}
        <div>
          <label htmlFor="password_confirmation" className="block text-sm font-medium text-slate-600 mb-1">
             Confirmar Contraseña
          </label>
          <input 
            id="password_confirmation" 
            name="password_confirmation" 
            type="password" 
            value={data.password_confirmation} 
            onChange={handleChange} 
            placeholder="Repite la contraseña" 
            className="input-style" 
          />
        </div>

      </div>
      {isEditing && (
        <p className="text-xs text-amber-600 mt-4 bg-amber-50 p-2 rounded border border-amber-100">
           Nota: Si no deseas cambiar la contraseña del cajero, deja los campos de contraseña vacíos.
        </p>
      )}
    </div>
  );
};

export default DatosAccesoForm;