import React from 'react';

const ClienteForm = ({ data, handleChange, isEdit = false }) => {
  const isEmpresa = data.tipo === 'Empresa';

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
      
      {/* Selector de Tipo: Editable si isEdit es false */}
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
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            {isEmpresa ? 'Razón Social' : 'Nombre'}
          </label>
          <input 
            name="nombre" type="text" value={data.nombre} onChange={handleChange} 
            placeholder={isEmpresa ? "Ej. Corporación Acme S.A.C." : "Ej. Juan"} 
            className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-indigo-500 outline-none" 
          />
        </div>

        {!isEmpresa && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Apellido Paterno</label>
              <input name="apellidoPaterno" type="text" value={data.apellidoPaterno} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Apellido Materno</label>
              <input name="apellidoMaterno" type="text" value={data.apellidoMaterno} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
            </div>
          </>
        )}

        {isEmpresa ? (
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">RUC</label>
            <input name="ruc" type="text" value={data.ruc} onChange={handleChange} maxLength="11" className="w-full px-3 py-2 border rounded-md" />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">DNI</label>
            <input name="dni" type="text" value={data.dni} onChange={handleChange} maxLength="8" className="w-full px-3 py-2 border rounded-md" />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            {isEmpresa ? 'Fecha de Constitución' : 'Fecha de Nacimiento'}
          </label>
          <input type="date" name="fechaNacimiento" value={data.fechaNacimiento} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
        </div>

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