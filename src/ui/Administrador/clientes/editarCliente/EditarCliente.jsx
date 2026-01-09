import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { showCliente, updateCliente } from 'services/clienteService'; 
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import LoadingScreen from 'components/Shared/LoadingScreen';

// Importa todos tus componentes de formulario
import ClienteForm from '../components/formularios/ClienteForm';
import ContactosForm from '../components/formularios/ContactosForm';

// --- PLANTILLA DE DATOS VACÍOS ---
// Define la estructura completa que esperan los formularios para evitar errores.
const initialFormData = {
  datos: {
    nombre: '', apellidoPaterno: '', apellidoMaterno: '',
    sexo: '', dni: '', fechaNacimiento: '',
    ruc: ''
  },
  contactos: { telefonoMovil: '', telefonoFijo: '', correo: '' },
};

// --- FUNCIÓN DE AYUDA PARA LIMPIAR VALORES NULL ---
const cleanNulls = (obj) => {
  if (obj === null || obj === undefined) return {};
  const newObj = { ...obj };
  for (const key in newObj) {
    if (newObj[key] === null) {
      newObj[key] = '';
    }
  }
  return newObj;
};

const EditarCliente = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const response = await showCliente(id);
        const clienteData = response.data; 

        if (!clienteData) {
          throw new Error("La respuesta de la API no contiene los datos del cliente.");
        }

        // 1. Limpiamos los datos de la API para eliminar valores `null`
        const datosApi = cleanNulls(clienteData.datos);
        const contactosApi = cleanNulls(clienteData.contactos?.[0]);
        
        // 2. Preparamos los datos personales con las transformaciones necesarias
        const datosLimpios = {
            ...initialFormData.datos, // Empezamos con la plantilla
            ...datosApi, // Sobrescribimos con los datos limpios de la API
            sexo: datosApi.sexo === 'Masculino' ? 'Masculino' : 'Femenino',
        };

        // 3. Construimos el estado final del formulario
        const structuredData = {
          datos: datosLimpios,
          contactos: { ...initialFormData.contactos, ...contactosApi },
        };
        
        setFormData(structuredData);

      } catch (err) {
        console.error("Error al procesar datos del cliente:", err);
        setError("No se pudo cargar la información del cliente. Revisa la consola.");
      } finally {
        setLoading(false);
      }
    };
    fetchCliente();
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
            const response = await updateCliente(id, formData);
            setAlert({ type: 'success', message: response.message || 'Cliente actualizado con éxito' });
            setTimeout(() => navigate('/admin/listar-clientes'), 2000);
        } catch (err) {
            let errorDetails = [];
            
            if (err.details && typeof err.details === 'object') {
                errorDetails = Object.values(err.details).flat();
            } else if (err.message) {
                errorDetails = [err.message];
            }

            setAlert({ 
                type: 'error', 
                message: 'Error al actualizar', 
                details: errorDetails 
            });
        } finally {
            setLoading(false);
        }
    };

  if (loading) return <LoadingScreen />;
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto p-6 ">
      <h1 className="text-3xl font-bold text-slate-800 mb-4">
        Editando Cliente: {formData?.datos?.nombre} {formData?.datos?.apellidoPaterno} {formData?.datos?.apellidoMaterno}
      </h1>
      <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

      <form onSubmit={handleSubmit}>
        <div className="space-y-12">
          {formData && (
            <>
              <div className="bg-white p-8 rounded-lg shadow-md"><ClienteForm data={formData.datos} handleChange={(e) => handleChange(e, 'datos')} /></div>
              <div className="bg-white p-8 rounded-lg shadow-md"><ContactosForm data={formData.contactos} handleChange={(e) => handleChange(e, 'contactos')} /></div>
            </>
          )}
        </div>

        <div className="flex justify-end mt-8">
          <button type="button" onClick={() => navigate('/admin/listar-clientes')} className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 mr-4">Cancelar</button>
          <button type="submit" disabled={loading} className="px-6 py-2 text-white bg-amber-500 rounded-md hover:bg-amber-600 disabled:opacity-50">
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarCliente;