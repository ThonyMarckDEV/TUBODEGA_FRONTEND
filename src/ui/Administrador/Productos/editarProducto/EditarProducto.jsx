import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { showProducto, updateProducto } from 'services/productoService'; 
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import LoadingScreen from 'components/Shared/LoadingScreen';
import ProductoForm from '../components/ProductoForm';

const EditarProducto = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const response = await showProducto(id);
        const data = response.data; 
        
        setFormData({
            nombre: data.nombre,
            unidad: data.unidad,
            precio_compra: data.precio_compra,
            precio_venta: data.precio_venta,
            precio_venta_mayorista: data.precio_venta_mayorista,
            stock_minimo: data.stock_minimo,

            id_Categoria: data.categoria_id,
            categoriaNombre: data.categoria ? data.categoria.nombre : ''
        });
      } catch (err) {
        setAlert({ type: 'error', message: "No se pudo cargar el producto." });
      } finally {
        setLoading(false);
      }
    };
    fetchProducto();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
      e.preventDefault();

      if (!formData.id_Categoria) {
        setAlert({ type: 'error', message: 'La categoría es obligatoria.' });
        return;
      }

      setSaving(true);
      setAlert(null);
      try {
          const payload = {
              ...formData,
              categoria_id: formData.id_Categoria
          };

          const response = await updateProducto(id, payload);
          setAlert({ type: 'success', message: response.message || 'Producto actualizado' });
          setTimeout(() => navigate('/admin/listar-productos'), 1500);
      } catch (err) {
          setAlert(err);
      } finally {
          setSaving(false);
      }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-slate-800 mb-4">Editar Producto</h1>
      <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md max-w-3xl">
        
        {formData && (
            <ProductoForm 
                data={formData} 
                setData={setFormData}
                handleChange={handleChange} 
                disabled={saving}
            />
        )}

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

export default EditarProducto;