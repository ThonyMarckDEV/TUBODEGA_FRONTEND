import React from 'react';

const ContactosForm = ({ data, handleChange }) => {
  const baseInputClass = "w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all";

  const validateAndChange = (e) => {
    const { name, value } = e.target;

    // SOLO NÚMEROS (Teléfonos)
    if (name === 'telefonoMovil' || name === 'telefonoFijo') {
       const soloNumeros = /^[0-9]*$/;
       if (!soloNumeros.test(value)) return;
    }

    handleChange(e);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-700 mb-6 border-b pb-2">2. Datos de Contacto</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        
        <div>
          <label htmlFor="telefonoMovil" className="block text-sm font-medium text-slate-600 mb-1">Teléfono Móvil</label>
          <input 
            id="telefonoMovil" name="telefonoMovil" type="tel" 
            value={data.telefonoMovil} onChange={validateAndChange} 
            placeholder="Ej. 987654321" maxLength="9" 
            className={baseInputClass} 
          />
        </div>

        <div>
          <label htmlFor="telefonoFijo" className="block text-sm font-medium text-slate-600 mb-1">
            Teléfono Fijo <span className="text-slate-400 font-normal">(Opcional)</span>
          </label>
          <input 
            id="telefonoFijo" name="telefonoFijo" type="tel" 
            value={data.telefonoFijo} onChange={validateAndChange} 
            placeholder="Ej. 123456" maxLength="6" 
            className={baseInputClass} 
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="correo" className="block text-sm font-medium text-slate-600 mb-1">
            Correo Electrónico
          </label>
          <input id="correo" name="correo" type="email" value={data.correo} onChange={handleChange} placeholder="ejemplo@correo.com" className={baseInputClass} />
        </div>
        
      </div>
    </div>
  );
};

export default ContactosForm;