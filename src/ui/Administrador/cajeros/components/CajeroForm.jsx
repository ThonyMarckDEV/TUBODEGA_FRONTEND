import React from 'react';

const CajeroForm = ({ data, handleChange }) => {
  const baseInputClass = "w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all";

  const validateAndChange = (e) => {
    const { name, value } = e.target;

    // 1. SOLO LETRAS (Nombres y Apellidos)
    const soloLetras = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]*$/;
    if (['nombre', 'apellidoPaterno', 'apellidoMaterno'].includes(name)) {
      if (!soloLetras.test(value)) return;
    }

    // 2. SOLO NÚMEROS (DNI)
    const soloNumeros = /^[0-9]*$/;
    if (name === 'dni') {
      if (!soloNumeros.test(value)) return;
    }

    handleChange(e);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-700 mb-6 border-b pb-2">1. Datos Personales</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
        
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-slate-600 mb-1">Nombre</label>
          <input id="nombre" name="nombre" type="text" value={data.nombre} onChange={validateAndChange} placeholder="Ej. Juan" className={baseInputClass} />
        </div>
        <div>
          <label htmlFor="apellidoPaterno" className="block text-sm font-medium text-slate-600 mb-1">Apellido Paterno</label>
          <input id="apellidoPaterno" name="apellidoPaterno" type="text" value={data.apellidoPaterno} onChange={validateAndChange} placeholder="Ej. Pérez" className={baseInputClass} />
        </div>
        <div>
          <label htmlFor="apellidoMaterno" className="block text-sm font-medium text-slate-600 mb-1">Apellido Materno</label>
          <input id="apellidoMaterno" name="apellidoMaterno" type="text" value={data.apellidoMaterno} onChange={validateAndChange} placeholder="Ej. González" className={baseInputClass} />
        </div>

        <div>
          <label htmlFor="dni" className="block text-sm font-medium text-slate-600 mb-1">DNI</label>
          <input id="dni" name="dni" type="text" value={data.dni} onChange={validateAndChange} placeholder="########" className={baseInputClass} maxLength="8" />
        </div>
        
        <div>
          <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-slate-600 mb-1">Fecha de Nacimiento</label>
          <input id="fechaNacimiento" type="date" name="fechaNacimiento" value={data.fechaNacimiento} onChange={handleChange} className={baseInputClass} />
        </div>

        <div>
          <label htmlFor="sexo" className="block text-sm font-medium text-slate-600 mb-1">Sexo</label>
          <select id="sexo" name="sexo" value={data.sexo} onChange={handleChange} className={baseInputClass}>
              <option value="">Seleccione...</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
          </select>
        </div>
        
      </div>
    </div>
  );
};

export default CajeroForm;