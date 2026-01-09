import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { showCategoria, updateCategoria } from 'services/categoriaService'; 
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import LoadingScreen from 'components/Shared/LoadingScreen';
import CategoriaForm from '../components/CategoriaForm';

const EditarCategoria = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null); // Iniciamos en null para saber si cargó
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCategoria = async () => {
      try {
        const response = await showCategoria(id);
        const data = response.data; 
        
        // Asignamos directamente los datos al estado
        setFormData({
            nombre: data.nombre || '',
            descripcion: data.descripcion || ''
        });
      } catch (err) {
        setError("No se pudo cargar la categoría.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategoria();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      setSaving(true);
      setAlert(null);
      try {
          const response = await updateCategoria(id, formData);
          setAlert({ type: 'success', message: response.message || 'Categoría actualizada' });
          setTimeout(() => navigate('/admin/listar-categorias'), 1500);
      } catch (err) {
          setAlert(err);
      } finally {
          setSaving(false);
      }
  };

  if (loading) return <LoadingScreen />;
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-slate-800 mb-4">Editar Categoría</h1>
      <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md max-w-2xl">
        
        {/* USAMOS EL MISMO COMPONENTE, PERO CON DATOS PRECARGADOS */}
        {formData && (
            <CategoriaForm 
                data={formData} 
                handleChange={handleChange} 
            />
        )}

        <div className="flex justify-end mt-8 gap-4">
          <button 
            type="button" 
            onClick={() => navigate('/admin/listar-categorias')} 
            className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={saving} 
            className="px-6 py-2 text-white bg-amber-500 rounded-md hover:bg-amber-600 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarCategoria;