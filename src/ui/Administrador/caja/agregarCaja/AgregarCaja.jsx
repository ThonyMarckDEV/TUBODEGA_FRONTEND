import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CajaForm from '../components/CajaForm';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { createCaja } from 'services/cajaService';

const initialFormData = {
  nombre: '',
  estado: 1
};

const AgregarCaja = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
          ...prev,
          [name]: name === 'estado' ? parseInt(value) : value,
      }));
  };
 
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const response = await createCaja(formData);
      setAlert(response);
      
      if (response.type === 'success') {
          setFormData(initialFormData);
          // Opcional: Redirigir después de guardar
          setTimeout(() => navigate('/admin/listar-cajas'), 1500);
      }
    } catch (error) {
      setAlert(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
      navigate('/admin/listar-cajas');
  };

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold text-slate-800 mb-4">Registro de Nueva Caja</h1>
      <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />
      
      {/* Barra superior visual similar al stepper pero estática */}
      <div className="mb-8 border-b border-gray-200 pb-4">
          <span className="text-sm font-medium text-black">Información General</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white p-8 rounded-lg shadow-md">
           <CajaForm data={formData} handleChange={handleChange} />
        </div>

        <div className="flex justify-between mt-8">
          <button
            type="button" 
            onClick={handleBack} 
            disabled={loading}
            className="px-6 py-2 text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar / Volver
          </button>
          
          <button
            type="submit" 
            disabled={loading}
            className="px-6 py-2 text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
                <>
                 <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                 Guardando...
                </>
            ) : 'Guardar Caja'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AgregarCaja;