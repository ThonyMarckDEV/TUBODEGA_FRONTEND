// components/ClienteForm.jsx
import React from 'react';

const ClienteForm = ({ data, handleChange, isEdit = false }) => {
  const isEmpresa = data.tipo === 'Empresa';

  // Función local para validar entradas antes de enviar al padre
  const validateAndChange = (e) => {
    const { name, value } = e.target;

    // 1. VALIDACIÓN SOLO NÚMEROS (DNI y RUC)
    if (name === 'dni' || name === 'ruc') {
        const soloNumeros = /^[0-9]*$/;
        if (!soloNumeros.test(value)) return;
    }

    // 2. VALIDACIÓN SOLO LETRAS (Nombres y Apellidos)
    // Regex: Acepta letras (a-z), Ñ, tildes y espacios.
    const soloLetras = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]*$/;

    if (name === 'apellidoPaterno' || name === 'apellidoMaterno') {
        if (!soloLetras.test(value)) return;
    }

    // Caso especial: El 'nombre' solo se valida como letras si es PERSONA NATURAL.
    if (name === 'nombre' && !isEmpresa) {
        if (!soloLetras.test(value)) return;
    }

    // Si pasa todas las validaciones, ejecutamos el cambio
    handleChange(e);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 border-b pb-2">
        <h2 className="text-xl font-semibold text-slate-700">1. Datos del Cliente</h2>
        {isEdit && (
          <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-1 rounded">
            Tipo de registro no editable
          </span>
        )}
      </div>
      
      {/* Selector de Tipo */}
      <div className={`mb-6 p-4 rounded-lg flex gap-4 border ${isEdit ? 'bg-slate-50 border-slate-200' : 'bg-blue-50 border-blue-200'}`}>
        <label className={`flex items-center gap-2 ${isEdit ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
          <input 
            type="radio" name="tipo" value="Persona" 
            checked={data.tipo === 'Persona'} 
            onChange={handleChange}
            disabled={isEdit} 
            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
          />
          <span className={`text-sm font-medium ${data.tipo === 'Persona' ? 'text-black' : 'text-slate-500'}`}>
            Persona Natural
          </span>
        </label>
        <label className={`flex items-center gap-2 ${isEdit ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
          <input 
            type="radio" name="tipo" value="Empresa" 
            checked={data.tipo === 'Empresa'} 
            onChange={handleChange}
            disabled={isEdit}
            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
          />
          <span className={`text-sm font-medium ${data.tipo === 'Empresa' ? 'text-black' : 'text-slate-500'}`}>
            Empresa (RUC)
          </span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
        
        {/* NOMBRE / RAZÓN SOCIAL */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            {isEmpresa ? 'Razón Social' : 'Nombre'}
          </label>
          <input 
            name="nombre" 
            type="text" 
            value={data.nombre} 
            onChange={validateAndChange} 
            placeholder={isEmpresa ? "Ej. Corporación Acme S.A.C." : "Ej. Juan"} 
            className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-indigo-500 outline-none" 
          />
        </div>

        {!isEmpresa && (
          <>
            {/* APELLIDO PATERNO */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Apellido Paterno</label>
              <input 
                name="apellidoPaterno" 
                type="text" 
                value={data.apellidoPaterno} 
                onChange={validateAndChange} 
                placeholder="Ej. Pérez"
                className="w-full px-3 py-2 border rounded-md" 
              />
            </div>
            
            {/* APELLIDO MATERNO */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Apellido Materno</label>
              <input 
                name="apellidoMaterno" 
                type="text" 
                value={data.apellidoMaterno} 
                onChange={validateAndChange} 
                placeholder="Ej. López"
                className="w-full px-3 py-2 border rounded-md" 
              />
            </div>
          </>
        )}

        {isEmpresa ? (
          /* RUC */
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">RUC</label>
            <input 
                name="ruc" 
                type="text" 
                value={data.ruc} 
                onChange={validateAndChange} 
                maxLength="11" 
                placeholder="Ej. 20123456789"
                className="w-full px-3 py-2 border rounded-md" 
            />
          </div>
        ) : (
          /* DNI */
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">DNI</label>
            <input 
                name="dni" 
                type="text" 
                value={data.dni} 
                onChange={validateAndChange} 
                maxLength="8" 
                placeholder="Ej. 70123456"
                className="w-full px-3 py-2 border rounded-md" 
            />
          </div>
        )}

        {/* FECHA */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            {isEmpresa ? 'Fecha de Constitución' : 'Fecha de Nacimiento'}
          </label>
          <input 
            type="date" 
            name="fechaNacimiento" 
            value={data.fechaNacimiento} 
            onChange={handleChange} 
            className="w-full px-3 py-2 border rounded-md" 
          />
        </div>

        {/* SEXO */}
        {!isEmpresa && (
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Sexo</label>
            <select name="sexo" value={data.sexo} onChange={handleChange} className="w-full px-3 py-2 border rounded-md">
                <option value="">Seleccione...</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClienteForm;