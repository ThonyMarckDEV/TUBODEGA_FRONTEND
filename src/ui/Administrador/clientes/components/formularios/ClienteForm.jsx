import React from 'react';

const ClienteForm = ({ data, handleChange }) => {
  // Determinamos si es empresa basándonos en el campo 'tipo'
  const isEmpresa = data.tipo === 'Empresa';

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-700 mb-6 border-b pb-2">1. Datos del Cliente</h2>
      
      {/* Selector de Tipo de Cliente */}
      <div className="mb-6 p-4 bg-slate-50 rounded-lg flex gap-4 border border-slate-200">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input 
            type="radio" name="tipo" value="Persona" 
            checked={!isEmpresa} onChange={handleChange} 
            className="w-4 h-4 text-black focus:ring-black border-gray-300"
          />
          <span className="text-sm font-medium text-slate-700 group-hover:text-black">Persona Natural</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input 
            type="radio" name="tipo" value="Empresa" 
            checked={isEmpresa} onChange={handleChange} 
            className="w-4 h-4 text-black focus:ring-black border-gray-300"
          />
          <span className="text-sm font-medium text-slate-700 group-hover:text-black">Empresa (RUC)</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
        
        {/* Nombre o Razón Social */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            {isEmpresa ? 'Razón Social' : 'Nombre'}
          </label>
          <input 
            name="nombre" 
            type="text" 
            value={data.nombre} 
            onChange={handleChange} 
            placeholder={isEmpresa ? "Ej. Corporación Acme S.A.C." : "Ej. Juan"} 
            className="input-style" 
          />
        </div>

        {/* Campos exclusivos para Persona */}
        {!isEmpresa && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Apellido Paterno</label>
              <input 
                name="apellidoPaterno" 
                type="text" 
                value={data.apellidoPaterno} 
                onChange={handleChange} 
                placeholder="Ej. Pérez" 
                className="input-style" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Apellido Materno</label>
              <input 
                name="apellidoMaterno" 
                type="text" 
                value={data.apellidoMaterno} 
                onChange={handleChange} 
                placeholder="Ej. González" 
                className="input-style" 
              />
            </div>
          </>
        )}

        {/* Documento Dinámico */}
        {isEmpresa ? (
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">RUC</label>
            <input 
              name="ruc" 
              type="text" 
              value={data.ruc} 
              onChange={handleChange} 
              placeholder="###########" 
              className="input-style" 
              maxLength="11" 
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">DNI</label>
            <input 
              name="dni" 
              type="text" 
              value={data.dni} 
              onChange={handleChange} 
              placeholder="########" 
              className="input-style" 
              maxLength="8" 
            />
          </div>
        )}

        {/* Fecha Dinámica */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            {isEmpresa ? 'Fecha de Constitución' : 'Fecha de Nacimiento'}
          </label>
          <input 
            type="date" 
            name="fechaNacimiento" 
            value={data.fechaNacimiento} 
            onChange={handleChange} 
            className="input-style" 
          />
        </div>

        {/* Sexo (Solo Persona) */}
        {!isEmpresa && (
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Sexo</label>
            <select 
              name="sexo" 
              value={data.sexo} 
              onChange={handleChange} 
              className="input-style"
            >
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