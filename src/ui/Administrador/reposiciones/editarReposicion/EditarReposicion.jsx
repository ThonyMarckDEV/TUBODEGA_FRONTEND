import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { showReposicion, updateReposicion } from 'services/reposicionService'; 
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import LoadingScreen from 'components/Shared/LoadingScreen';
import ReposicionForm from '../components/ReposicionForm';

const EditarReposicion = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchReposicion = async () => {
      try {
        const response = await showReposicion(id);
        const data = response.data; 
        
        setFormData({
            detalles: data.detalles.map(d => ({
                id_Producto: d.producto_id,
                productoNombre: d.producto ? d.producto.nombre : 'Producto eliminado',
                cantidad: d.cantidad
            }))
        });
      } catch (err) {
        setAlert({ type: 'error', message: "No se pudo cargar la reposición." });
      } finally {
        setLoading(false);
      }
    };
    fetchReposicion();
  }, [id]);

  const handleSubmit = async (e) => {
      e.preventDefault();
      setSaving(true);
      setAlert(null);

      const detallesValidos = formData.detalles.filter(d => d.id_Producto && d.cantidad > 0);

      try {
          const payload = {
              detalles: detallesValidos.map(d => ({
                  producto_id: d.id_Producto,
                  cantidad: parseInt(d.cantidad)
              }))
          };

          const response = await updateReposicion(id, payload);
          setAlert({ type: 'success', message: response.message || 'Reposición actualizada' });
          setTimeout(() => navigate('/admin/listar-reposiciones'), 1500);
      } catch (err) {
          setAlert(err);
      } finally {
          setSaving(false);
      }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-slate-800 mb-4">Editar Reposición N° {id}</h1>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <p className="text-sm text-yellow-700">
            ⚠️ <strong>Cuidado:</strong> Al guardar, se revertirá el movimiento original (devolviendo stock al almacén) y se aplicará el nuevo.
        </p>
      </div>

      <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md max-w-4xl">
        
        {formData && (
            <ReposicionForm 
                data={formData} 
                setData={setFormData}
                disabled={saving}
            />
        )}

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

export default EditarReposicion;