// src/pages/cajeros/AgregarCajero.jsx
import React, { useState } from 'react';

// Importación de componentes
import CajeroForm from '../components/CajeroForm';
import ContactosForm from '../components/ContactosForm';
import DatosAccesoForm from '../components/DatosAccesoForm';
import AlertMessage from 'components/Shared/Errors/AlertMessage';

// Importación del servicio
import { createCajero } from 'services/cajeroService';


const initialFormData = {
  datos: {
    nombre: '', apellidoPaterno: '', apellidoMaterno: '',
    sexo: '', dni: '', fechaNacimiento: '', ruc: '',
  },
  contactos: {
    telefonoMovil: '', telefonoFijo: '', correo: '',
  },
  accesos: {
    username: '', password: '', password_confirmation: ''
  }
};

const STEPS = [
  { id: 1, name: 'Datos Personales' },
  { id: 2, name: 'Contacto' },
  { id: 3, name: 'Acceso' }, // Nuevo paso
];

const AgregarCajero = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleChange = (e, section) => {
      const { name, value, type, checked } = e.target;
      setFormData(prev => ({
          ...prev,
          [section]: {
              ...prev[section],
              [name]: type === 'checkbox' ? checked : value,
          },
      }));
    };
 
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const response = await createCajero(formData);
      setAlert(response);
      setFormData(initialFormData);
      setCurrentStep(1);
    } catch (error) {
      setAlert(error);
    } finally {
      setLoading(false);
    }
  };

  const renderFormStep = () => {
    switch (currentStep) {
      case 1:
        return <CajeroForm data={formData.datos} handleChange={(e) => handleChange(e, 'datos')} />;
      case 2:
        return <ContactosForm data={formData.contactos} handleChange={(e) => handleChange(e, 'contactos')} />;
      case 3:
        return <DatosAccesoForm data={formData.accesos} handleChange={(e) => handleChange(e, 'accesos')} />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold text-slate-800 mb-4">Registro de Nuevo Cajero</h1>
      <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />
      
      {/* Stepper */}
      <div className="mb-8">
        <ol className="flex items-center w-full">
          {STEPS.map((step, index) => (
            <li key={step.id} className={`flex w-full items-center ${index < STEPS.length - 1 ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-300 after:border-1 after:inline-block" : ""}`}>
              <span className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${currentStep >= step.id ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'}`}>
                {step.id}
              </span>
            </li>
          ))}
        </ol>
        <div className="flex justify-between mt-2 px-1">
            {STEPS.map((step) => (
                <span key={step.id} className={`text-xs font-medium ${currentStep >= step.id ? 'text-black' : 'text-gray-400'}`}></span>
            ))}
        </div>
      </div>

      <form>
        <div className="bg-white p-8 rounded-lg shadow-md">
          {renderFormStep()}
        </div>

        <div className="flex justify-between mt-8">
          <button
            type="button" onClick={handleBack} disabled={currentStep === 1 || loading}
            className="px-6 py-2 text-white bg-gray-500 rounded-md hover:bg-gray-600 disabled:bg-gray-300"
          >
            Anterior
          </button>
          {currentStep < STEPS.length ? (
            <button
              type="button" onClick={handleNext} disabled={loading}
              className="px-6 py-2 text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              Siguiente
            </button>
          ) : (
            <button
              type="button" onClick={handleSubmit} disabled={loading}
              className="px-6 py-2 text-white bg-amber-500 rounded-md hover:bg-amber-600 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Cajero'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AgregarCajero;