// src/pages/cajeros/EditarCajero.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { showCajero, updateCajero } from 'services/cajeroService'; 
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import LoadingScreen from 'components/Shared/LoadingScreen';

import CajeroForm from '../components/CajeroForm';
import ContactosForm from '../components/ContactosForm';
import DatosAccesoForm from '../components/DatosAccesoForm';

const initialFormData = {
  datos: {
    nombre: '', apellidoPaterno: '', apellidoMaterno: '',
    sexo: '', dni: '', fechaNacimiento: ''
  },
  contactos: { telefonoMovil: '', telefonoFijo: '', correo: '' },
  usuario: { username: '', password: '', password_confirmation: '' }
};

const cleanNulls = (obj) => {
  if (obj === null || obj === undefined) return {};
  const newObj = { ...obj };
  for (const key in newObj) {
    if (newObj[key] === null) newObj[key] = '';
  }
  return newObj;
};

const EditarCajero = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const fetchCajero = async () => {
      try {
        const response = await showCajero(id);
        const cajeroData = response.data; 

        if (!cajeroData) throw new Error("Datos no encontrados.");

        const datosApi = cleanNulls(cajeroData.datos);
        const contactosApi = cleanNulls(cajeroData.contactos?.[0]);
        const usernameApi = cajeroData.username || cajeroData.user?.username || '';

        const structuredData = {
          datos: { ...initialFormData.datos, ...datosApi, sexo: datosApi.sexo === 'Masculino' ? 'Masculino' : 'Femenino' },
          contactos: { ...initialFormData.contactos, ...contactosApi },
          usuario: { 
             username: usernameApi, 
             password: '',
             password_confirmation: '' 
          }
        };
        
        setFormData(structuredData);

      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la información del cajero.");
      } finally {
        setLoading(false);
      }
    };
    fetchCajero();
  }, [id]);

  const handleChange = (e, section) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: type === 'checkbox' ? checked : value,
      },
    }));
  };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAlert(null);
        try {
            const response = await updateCajero(id, formData);
            setAlert({ type: 'success', message: response.message || 'Cajero actualizado con éxito' });
            setTimeout(() => navigate('/admin/listar-cajeros'), 2000);
        } catch (err) {
            let errorDetails = [];
            if (err.details && typeof err.details === 'object') {
                errorDetails = Object.values(err.details).flat();
            } else if (err.message) {
                errorDetails = [err.message];
            }
            setAlert({ type: 'error', message: 'Error al actualizar', details: errorDetails });
        } finally {
            setLoading(false);
        }
    };

  if (loading) return <LoadingScreen />;
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto p-6 ">
      <h1 className="text-3xl font-bold text-slate-800 mb-4">Editando Cajero</h1>
      <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          {formData && (
            <>
              <div className="bg-white p-8 rounded-lg shadow-md"><CajeroForm data={formData.datos} handleChange={(e) => handleChange(e, 'datos')} /></div>
              <div className="bg-white p-8 rounded-lg shadow-md"><ContactosForm data={formData.contactos} handleChange={(e) => handleChange(e, 'contactos')} /></div>
              <div className="bg-white p-8 rounded-lg shadow-md"><DatosAccesoForm data={formData.usuario} handleChange={(e) => handleChange(e, 'usuario')} isEditing={true} /></div>
            </>
          )}
        </div>

        <div className="flex justify-end mt-8 pb-10">
          <button type="button" onClick={() => navigate('/admin/listar-cajeros')} className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 mr-4">Cancelar</button>
          <button type="submit" disabled={loading} className="px-6 py-2 text-white bg-amber-500 rounded-md hover:bg-amber-600 disabled:opacity-50">
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarCajero;