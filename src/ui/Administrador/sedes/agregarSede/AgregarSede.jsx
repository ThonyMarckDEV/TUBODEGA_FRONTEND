import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { createSede } from 'services/sedeService';
import { BuildingOffice2Icon, UserCircleIcon } from '@heroicons/react/24/outline';

const initialFormData = {
  sede: {
    nombre: '', 
    direccion: '', 
    codigo_sunat: ''
  },
  admin: {
    nombre: '',
    apellidoPaterno: '',
    dni: '',
    username: '',
    password: ''
  }
};

const AgregarSede = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // Manejador genérico para objetos anidados
  const handleChange = (e, section) => {
      const { name, value } = e.target;
      setFormData(prev => ({
          ...prev,
          [section]: {
              ...prev[section],
              [name]: value
          }
      }));
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);
    try {
      const response = await createSede(formData);
      setAlert(response);
      setFormData(initialFormData);
      // setTimeout(() => navigate('/admin/listar-sedes'), 2000);
    } catch (error) {
      setAlert(error);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm";

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Apertura de Nueva Sede</h1>
          <button onClick={() => navigate('/admin/listar-sedes')} className="text-gray-500 hover:text-gray-700 font-medium">
              ← Cancelar
          </button>
      </div>

      <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />
      
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* SECCIÓN 1: DATOS DE LA SEDE */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <div className="flex items-center gap-2 mb-4 border-b pb-2">
                <BuildingOffice2Icon className="w-6 h-6 text-indigo-600"/>
                <h2 className="text-lg font-bold text-slate-700">1. Datos del Local</h2>
            </div>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Nombre de Sede</label>
                    <input name="nombre" value={formData.sede.nombre} onChange={(e) => handleChange(e, 'sede')} className={inputClass} placeholder="Ej. Sucursal Norte" required />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Dirección</label>
                    <input name="direccion" value={formData.sede.direccion} onChange={(e) => handleChange(e, 'sede')} className={inputClass} placeholder="Ej. Av. Los Héroes 340" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Código SUNAT (Opcional)</label>
                    <input name="codigo_sunat" value={formData.sede.codigo_sunat} onChange={(e) => handleChange(e, 'sede')} className={inputClass} placeholder="0002" maxLength={4}/>
                </div>
            </div>
          </div>

          {/* SECCIÓN 2: ADMINISTRADOR ENCARGADO */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <div className="flex items-center gap-2 mb-4 border-b pb-2">
                <UserCircleIcon className="w-6 h-6 text-emerald-600"/>
                <h2 className="text-lg font-bold text-slate-700">2. Datos del Administrador</h2>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">DNI</label>
                        <input name="dni" value={formData.admin.dni} onChange={(e) => handleChange(e, 'admin')} className={inputClass} maxLength={8} required />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Nombre</label>
                        <input name="nombre" value={formData.admin.nombre} onChange={(e) => handleChange(e, 'admin')} className={inputClass} required />
                    </div>
                </div>
                
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Apellido Paterno</label>
                    <input name="apellidoPaterno" value={formData.admin.apellidoPaterno} onChange={(e) => handleChange(e, 'admin')} className={inputClass} required />
                </div>

                <div className="pt-2 border-t border-dashed">
                    <p className="text-xs text-indigo-500 font-bold mb-3 uppercase">Credenciales de Acceso</p>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Usuario</label>
                            <input name="username" value={formData.admin.username} onChange={(e) => handleChange(e, 'admin')} className={inputClass} required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Contraseña</label>
                            <input type="password" name="password" value={formData.admin.password} onChange={(e) => handleChange(e, 'admin')} className={inputClass} required />
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* BOTÓN DE GUARDAR */}
          <div className="md:col-span-2 flex justify-end mt-4">
            <button
              type="submit" 
              disabled={loading}
              className="px-8 py-3 text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-all font-bold shadow-lg hover:shadow-xl w-full md:w-auto"
            >
              {loading ? 'Procesando...' : 'Crear Sede y Asignar Admin'}
            </button>
          </div>

      </form>
    </div>
  );
};
 
export default AgregarSede;