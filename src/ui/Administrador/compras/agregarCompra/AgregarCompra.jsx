import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { createCompra } from 'services/compraService';
import CompraForm from '../components/CompraForm';

const initialFormData = {
  id_Proveedor: null,
  proveedorNombre: '', // Para visualización
  detalles: [
    { id_Producto: null, productoNombre: '', cantidad: 1, precio: '' }
  ]
};

const AgregarCompra = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    // Validaciones Frontend básicas
    if (!formData.id_Proveedor) {
        setAlert({ type: 'error', message: 'Debe seleccionar un proveedor.' });
        return;
    }
    const detallesValidos = formData.detalles.filter(d => d.id_Producto && d.cantidad > 0 && d.precio > 0);
    if (detallesValidos.length === 0) {
        setAlert({ type: 'error', message: 'Debe agregar al menos un producto válido (con precio y cantidad).' });
        return;
    }

    setLoading(true);

    try {
      // Preparamos payload para Laravel
      const payload = {
          proveedor_id: formData.id_Proveedor,
          detalles: detallesValidos.map(d => ({
              producto_id: d.id_Producto,
              cantidad: parseInt(d.cantidad),
              precio: parseFloat(d.precio)
          }))
      };

      const response = await createCompra(payload);
      setAlert(response); 
      
      if (response.type === 'success') {
          setFormData(initialFormData);
          navigate('/admin/listar-compras');
      }
    } catch (error) {
      setAlert(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Registrar Compra</h1>
      
      <AlertMessage
        type={alert?.type}
        message={alert?.message}
        details={alert?.details}
        onClose={() => setAlert(null)}
      />
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md max-w-5xl">
        
        <CompraForm 
            data={formData} 
            setData={setFormData}
            disabled={loading}
        />

        <div className="flex justify-end mt-8 gap-4">
          <button 
            type="button" 
            onClick={() => navigate('/admin/listar-compras')}
            className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Procesando...' : 'Registrar Compra'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AgregarCompra;