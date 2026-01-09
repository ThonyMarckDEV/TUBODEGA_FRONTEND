import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { createCategoria } from 'services/categoriaService';
import CategoriaForm from '../components/CategoriaForm';

const initialFormData = {
  nombre: '',
  descripcion: ''
};

const AgregarCategoria = () => {
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
      const response = await createCategoria(formData);
      setAlert(response); 
      
      if (response.type === 'success') {
          setFormData(initialFormData);
          setTimeout(() => navigate('/admin/listar-categorias'), 3000);
      }
    } catch (error) {
      setAlert(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Nueva Categoría</h1>
      
      <AlertMessage
        type={alert?.type}
        message={alert?.message}
        details={alert?.details}
        onClose={() => setAlert(null)}
      />
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md max-w-2xl">
        
        {/* USAMOS EL COMPONENTE REUTILIZABLE */}
        <CategoriaForm 
            data={formData} 
            handleChange={handleChange} 
        />

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
            disabled={loading}
            className="px-6 py-2 text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Guardando...' : 'Guardar Categoría'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AgregarCategoria;