import React from 'react';

const ContactosForm = ({ data, handleChange }) => {
  const baseInputClass = "w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all";

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-700 mb-6 border-b pb-2">2. Datos de Contacto</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        
        <div>
          <label htmlFor="telefonoMovil" className="block text-sm font-medium text-slate-600 mb-1">Teléfono Móvil</label>
          <input id="telefonoMovil" name="telefonoMovil" type="tel" value={data.telefonoMovil} onChange={handleChange} placeholder="Ej. 987654321" className={baseInputClass} />
        </div>

        <div>
          <label htmlFor="telefonoFijo" className="block text-sm font-medium text-slate-600 mb-1">
            Teléfono Fijo <span className="text-slate-400 font-normal">(Opcional)</span>
          </label>
          <input id="telefonoFijo" name="telefonoFijo" type="tel" value={data.telefonoFijo} onChange={handleChange} placeholder="Ej. 073123456" className={baseInputClass} />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="correo" className="block text-sm font-medium text-slate-600 mb-1">
            Correo Electrónico <span className="text-slate-400 font-normal"></span>
          </label>
          <input id="correo" name="correo" type="email" value={data.correo} onChange={handleChange} placeholder="ejemplo@correo.com" className={baseInputClass} />
        </div>
        
      </div>
    </div>
  );
};

export default ContactosForm;