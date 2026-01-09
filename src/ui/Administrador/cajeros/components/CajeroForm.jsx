import React from 'react';

const CajeroForm = ({ data, handleChange }) => {

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-700 mb-6 border-b pb-2">1. Datos Personales</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
        
        {/* --- Fila 1: Información Básica --- */}
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-slate-600 mb-1">Nombre</label>
          <input id="nombre" name="nombre" type="text" value={data.nombre} onChange={handleChange} placeholder="Ej. Juan" className="input-style" />
        </div>
        <div>
          <label htmlFor="apellidoPaterno" className="block text-sm font-medium text-slate-600 mb-1">Apellido Paterno</label>
          <input id="apellidoPaterno" name="apellidoPaterno" type="text" value={data.apellidoPaterno} onChange={handleChange} placeholder="Ej. Pérez" className="input-style" />
        </div>
        <div>
          <label htmlFor="apellidoMaterno" className="block text-sm font-medium text-slate-600 mb-1">Apellido Materno</label>
          <input id="apellidoMaterno" name="apellidoMaterno" type="text" value={data.apellidoMaterno} onChange={handleChange} placeholder="Ej. González" className="input-style" />
        </div>

        {/* --- Fila 2: Documentos --- */}
        <div>
          <label htmlFor="dni" className="block text-sm font-medium text-slate-600 mb-1">DNI</label>
          <input id="dni" name="dni" type="text" value={data.dni} onChange={handleChange} placeholder="########" className="input-style" maxLength="8" />
        </div>

        <div>
          <label htmlFor="ruc" className="block text-sm font-medium text-slate-600 mb-1">RUC <span className="text-slate-400">(Opcional)</span></label>
          <input id="ruc" name="ruc" type="text" value={data.ruc} onChange={handleChange} placeholder="###########" className="input-style" maxLength="11" />
        </div>
        
        {/* --- Fila 3: Datos Personales --- */}
        <div>
          <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-slate-600 mb-1">Fecha de Nacimiento</label>
          <input id="fechaNacimiento" type="date" name="fechaNacimiento" value={data.fechaNacimiento} onChange={handleChange} className="input-style" />
        </div>

        <div>
          <label htmlFor="sexo" className="block text-sm font-medium text-slate-600 mb-1">Sexo</label>
          <select id="sexo" name="sexo" value={data.sexo} onChange={handleChange} className="input-style">
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