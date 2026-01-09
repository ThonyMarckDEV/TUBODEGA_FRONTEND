import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { createProducto } from 'services/productoService';
import ProductoForm from '../components/ProductoForm';

// Estado inicial: incluye campos para el Select de Categoría
const initialFormData = {
  nombre: '',
  unidad: 'unidad',
  precio_compra: '',
  precio_venta: '',
  stock_minimo: 5,
  // Campos especiales para CategoriaSearchSelect
  id_Categoria: null, 
  categoriaNombre: ''
};

const AgregarProducto = () => {
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
    setAlert(null);

    // Validación manual de Categoría
    if (!formData.id_Categoria) {
        setAlert({ type: 'error', message: 'Debe seleccionar una categoría.' });
        return;
    }

    setLoading(true);

    try {
      // Preparamos el payload para el backend (mapeamos id_Categoria a categoria_id)
      const payload = {
          ...formData,
          categoria_id: formData.id_Categoria
      };

      const response = await createProducto(payload);
      setAlert(response); 
      
      if (response.type === 'success') {
          setFormData(initialFormData);
          
          setTimeout(() => {
              navigate('/admin/listar-productos');
          }, 3000); 
      }
    } catch (error) {
      setAlert(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Nuevo Producto</h1>
      
      <AlertMessage
        type={alert?.type}
        message={alert?.message}
        details={alert?.details}
        onClose={() => setAlert(null)}
      />
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md max-w-3xl">
        
        {/* Pasamos setData (setFormData) porque CategoriaSearchSelect lo necesita */}
        <ProductoForm 
            data={formData} 
            setData={setFormData}
            handleChange={handleChange} 
            disabled={loading}
        />

        <div className="flex justify-end mt-8 gap-4">
          <button 
            type="button" 
            onClick={() => navigate('/admin/listar-productos')}
            className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Guardando...' : 'Guardar Producto'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AgregarProducto;