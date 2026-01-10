// src/pages/clientes/AgregarCliente.jsx
import React, { useState } from 'react';

// Importación de los componentes del formulario
import ClienteForm from '../components/formularios/ClienteForm';
import ContactosForm from '../components/formularios/ContactosForm';

import AlertMessage from 'components/Shared/Errors/AlertMessage';

// Importación del servicio
import { createCliente } from 'services/clienteService';

const initialFormData = {
  datos: {
    tipo: 'Persona',
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    sexo: '',
    dni: '',
    fechaNacimiento: '',
    ruc: '',
  },
  contactos: {
    telefonoMovil: '',
    telefonoFijo: '',
    correo: '',
  }
};

const STEPS = [
  { id: 1, name: 'Datos Personales' },
  { id: 2, name: 'Contacto' },
];

const AgregarCliente = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleChange = (e, section) => {
      const { name, value, type, checked } = e.target;
      
      setFormData(prev => {
          const newSectionData = {
              ...prev[section],
              [name]: type === 'checkbox' ? checked : value,
          };

          return {
              ...prev,
              [section]: newSectionData,
          };
      });
    };
 
  const handleSubmit = async (e) => {
    if (e) e.preventDefault(); // Previene cualquier comportamiento por si acaso
    setLoading(true);
    try {
      const response = await createCliente(formData);
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
        return <ClienteForm data={formData.datos} handleChange={(e) => handleChange(e, 'datos')} isEdit={false} />;
      case 2:
        return (
          <>
            <ContactosForm data={formData.contactos} handleChange={(e) => handleChange(e, 'contactos')} />
          </>
        );
      default:
        return <ClienteForm data={formData.datosPersonales} handleChange={(e) => handleChange(e, 'datosPersonales')} />;
    }
  };

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold text-slate-800 mb-4">Registro de Nuevo Cliente</h1>
      <AlertMessage
        type={alert?.type}
        message={alert?.message}
        details={alert?.details}
        onClose={() => setAlert(null)}
      />
      
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
      </div>

      <form>
        <div className="bg-white p-8 rounded-lg shadow-md">
          {renderFormStep()}
        </div>

        {/* Botones de navegación */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1 || loading}
            className="px-6 py-2 text-white bg-gray-500 rounded-md hover:bg-gray-600 disabled:bg-gray-300"
          >
            Anterior
          </button>
          {currentStep < STEPS.length ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="px-6 py-2 text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              Siguiente
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 text-white bg-amber-500 rounded-md hover:bg-amber-600 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Cliente'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AgregarCliente;