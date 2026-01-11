import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { showSede, updateSede } from 'services/sedeService'; 
import SedeForm from '../components/SedeForm';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import LoadingScreen from 'components/Shared/LoadingScreen';

const initialFormData = {
  nombre: '', 
  direccion: '', 
  codigo_sunat: ''
};

const EditarSede = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);

  // 1. Cargar datos de la sede
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await showSede(id);
        const data = response.data;
        
        // Rellenamos el form, asegurando que no haya nulls
        setFormData({
            nombre: data.nombre || '',
            direccion: data.direccion || '',
            codigo_sunat: data.codigo_sunat || ''
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

  // 2. Manejar cambios en inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 3. Enviar actualización
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);
    try {
      const response = await updateSede(id, formData);
      setAlert({ type: 'success', message: response.message || 'Sede actualizada correctamente.' });
      
      // Opcional: Volver al listado automáticamente
      setTimeout(() => navigate('/admin/listar-sedes'), 1500);
    } catch (err) {
      setAlert(err); // El servicio ya formatea el error
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.nombre) return <LoadingScreen />;
  if (error) return <div className="text-center p-8 text-red-600 font-medium">{error}</div>;

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Editar Sede</h1>
          <button onClick={() => navigate('/admin/listar-sedes')} className="text-gray-500 hover:text-gray-700 font-medium">
              Cancelar
          </button>
      </div>

      <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
          
          <SedeForm data={formData} handleChange={handleChange} />

          <div className="flex justify-end gap-4 mt-8 border-t pt-6">
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
                className="px-6 py-2 text-white bg-amber-500 rounded-md hover:bg-amber-600 disabled:opacity-50 transition-colors font-medium shadow-sm"
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