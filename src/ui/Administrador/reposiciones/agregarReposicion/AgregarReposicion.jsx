import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { createReposicion } from 'services/reposicionService';
import ReposicionForm from '../components/ReposicionForm';

const initialFormData = {
  detalles: [
    { id_Producto: null, productoNombre: '', cantidad: 1 }
  ]
};

const AgregarReposicion = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    // Validación simple
    const detallesValidos = formData.detalles.filter(d => d.id_Producto && d.cantidad > 0);
    if (detallesValidos.length === 0) {
        setAlert({ type: 'error', message: 'Debe seleccionar al menos un producto válido.' });
        return;
    }

    setLoading(true);

    try {
      const payload = {
          detalles: detallesValidos.map(d => ({
              producto_id: d.id_Producto,
              cantidad: parseInt(d.cantidad)
          }))
      };

      const response = await createReposicion(payload);
      setAlert(response); 
      
      if (response.type === 'success') {
          setFormData(initialFormData);
          // navigate('/admin/listar-reposiciones');
      }
    } catch (error) {
      setAlert(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Nueva Reposición (Almacén → Bodega)</h1>
      
      <AlertMessage
        type={alert?.type}
        message={alert?.message}
        details={alert?.details}
        onClose={() => setAlert(null)}
      />
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md max-w-4xl">
        
        <ReposicionForm 
            data={formData} 
            setData={setFormData}
            disabled={loading}
        />

        <div className="flex justify-end mt-8 gap-4">
          <button 
            type="button" 
            onClick={() => navigate('/admin/listar-reposiciones')}
            className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Procesando...' : 'Confirmar Traslado'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AgregarReposicion;