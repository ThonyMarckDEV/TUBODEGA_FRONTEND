import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SedeForm from '../components/SedeForm';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { createSede } from 'services/sedeService';

const initialFormData = {
  nombre: '', 
  direccion: '', 
  codigo_sunat: ''
};

const AgregarSede = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);
    try {
      const response = await createSede(formData);
      setAlert(response); // Mensaje de éxito
      setFormData(initialFormData); // Limpiar form
      // Opcional: Redirigir después de unos segundos
      // setTimeout(() => navigate('/admin/listar-sedes'), 2000);
    } catch (error) {
      setAlert(error); // Mensaje de error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Nueva Sede</h1>
          <button onClick={() => navigate('/admin/listar-sedes')} className="text-gray-500 hover:text-gray-700 font-medium">
              ← Volver al listado
          </button>
      </div>

      <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />
      
      <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
            <SedeForm data={formData} handleChange={handleChange} />

            <div className="flex justify-end mt-8 border-t pt-6">
              <button
                type="submit" 
                disabled={loading}
                className="px-6 py-2 text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors font-medium"
              >
                {loading ? 'Creando Sede...' : 'Crear Sede'}
              </button>
            </div>
          </form>
      </div>
    </div>
  );
};
 
export default AgregarSede;