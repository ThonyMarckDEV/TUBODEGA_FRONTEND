import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { showSede, updateSede } from 'services/sedeService'; 
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import LoadingScreen from 'components/Shared/LoadingScreen';
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

const EditarSede = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await showSede(id);
        const { sede, admin } = response.data;
        
        setFormData({
            sede: {
                nombre: sede.nombre || '',
                direccion: sede.direccion || '',
                codigo_sunat: sede.codigo_sunat || ''
            },
            admin: {
                nombre: admin?.datos?.nombre || '',
                apellidoPaterno: admin?.datos?.apellidoPaterno || '',
                dni: admin?.datos?.dni || '',
                username: admin?.username || '',
                password: ''
            }
        });

      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la información de la sede.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

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
      const response = await updateSede(id, formData);
      setAlert({ type: 'success', message: response.message || 'Sede y Admin actualizados correctamente.' });
      setTimeout(() => navigate('/admin/listar-sedes'), 1500);
    } catch (err) {
        let message = 'Ocurrió un error al actualizar';
        let details = [];
        if (err.details) {
            message = "Por favor corrige los siguientes errores:";
            details = Object.values(err.details).flat();
        } else if (err.message) {
            message = err.message;
        }
        setAlert({ 
            type: 'error', 
            message: message,
            details: details 
        });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.sede.nombre) return <LoadingScreen />;
  if (error) return <div className="text-center p-8 text-red-600 font-medium">{error}</div>;

  const inputClass = "w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm";

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Editar Sede y Encargado</h1>
          <button onClick={() => navigate('/admin/listar-sedes')} className="text-gray-500 hover:text-gray-700 font-medium">
              Cancelar
          </button>
      </div>

      <AlertMessage 
        type={alert?.type} 
        message={alert?.message} 
        details={alert?.details}
        onClose={() => setAlert(null)} 
      />

      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* SECCIÓN 1: DATOS DE LA SEDE */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 h-fit">
            <div className="flex items-center gap-2 mb-4 border-b pb-2">
                <BuildingOffice2Icon className="w-6 h-6 text-indigo-600"/>
                <h2 className="text-lg font-bold text-slate-700">1. Datos del Local</h2>
            </div>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Nombre de Sede</label>
                    <input name="nombre" value={formData.sede.nombre} onChange={(e) => handleChange(e, 'sede')} className={inputClass} required />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Dirección</label>
                    <input name="direccion" value={formData.sede.direccion} onChange={(e) => handleChange(e, 'sede')} className={inputClass} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Código SUNAT</label>
                    <input name="codigo_sunat" value={formData.sede.codigo_sunat} onChange={(e) => handleChange(e, 'sede')} className={inputClass} maxLength={4}/>
                </div>
            </div>
          </div>

          {/* SECCIÓN 2: ADMINISTRADOR ENCARGADO */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 h-fit">
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
                    <p className="text-xs text-indigo-500 font-bold mb-3 uppercase">Actualizar Credenciales</p>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Usuario</label>
                            <input name="username" value={formData.admin.username} onChange={(e) => handleChange(e, 'admin')} className={inputClass} required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Nueva Contraseña</label>
                            <input type="password" name="password" value={formData.admin.password} onChange={(e) => handleChange(e, 'admin')} className={inputClass} placeholder="Opcional" />
                        </div>
                    </div>
                </div>
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end gap-4 mt-4 pb-10">
            <button 
                type="button" 
                onClick={() => navigate('/admin/listar-sedes')}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
                Cancelar
            </button>
            <button
                type="submit" 
                disabled={loading}
                className="px-8 py-2 text-white bg-amber-500 rounded-md hover:bg-amber-600 disabled:opacity-50 transition-colors font-medium shadow-lg"
            >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarSede;