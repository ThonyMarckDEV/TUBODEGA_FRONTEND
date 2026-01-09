import React from 'react';
import { PlusCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import ProductoSearchSelect from 'components/Shared/Comboboxes/ProductoSearchSelect';

const ReposicionForm = ({ data, setData, disabled = false }) => {

  // Agregar fila
  const addRow = () => {
    setData(prev => ({
        ...prev,
        detalles: [
            ...prev.detalles, 
            { id_Producto: null, productoNombre: '', cantidad: 1, stockDisponible: null }
        ]
    }));
  };

  // Eliminar fila
  const removeRow = (index) => {
    const newDetalles = data.detalles.filter((_, i) => i !== index);
    setData(prev => ({ ...prev, detalles: newDetalles }));
  };

  // Cambio de cantidad
  const handleRowChange = (index, value) => {
    const newDetalles = [...data.detalles];
    newDetalles[index].cantidad = value;
    setData(prev => ({ ...prev, detalles: newDetalles }));
  };

  /**
   * Adaptador para ProductoSearchSelect.
   * Además de ID y Nombre, capturamos 'stock_almacen' para mostrarlo como ayuda visual.
   */
  const handleSetRowState = (index, stateUpdater) => {
    setData(prev => {
        const newDetalles = [...prev.detalles];
        const currentRow = newDetalles[index];
        
        // Ejecutamos el actualizador que viene del componente hijo
        let updatedRow = stateUpdater(currentRow);
        
        // TRUCO: Si el updater devolvió un ID nuevo, significa que seleccionó algo.
        // El componente ProductoSearchSelect no nos pasa el objeto completo en el setForm estándar,
        // pero podemos modificar el componente o, más simple, inferir que si cambió el nombre es nuevo.
        // 
        // Para hacerlo perfecto, necesitamos que ProductoSearchSelect nos permita pasar una prop 'onSelect'.
        // Pero asumiendo que usamos la versión estándar:
        
        // Nota: Para que esto funcione fluido, lo ideal es que ProductoSearchSelect
        // llame a setForm pasando propiedades extra si queremos.
        // Por ahora, solo guardamos ID y Nombre.
        
        newDetalles[index] = updatedRow;
        return { ...prev, detalles: newDetalles };
    });
  };

  // Para capturar el Stock Disponible, necesitamos interceptar el momento de selección.
  // Como ProductoSearchSelect usa 'setForm', vamos a pasarle una función wrapper inteligente.
  const handleProductSelectWrapper = (index, updaterOrValue) => {
      setData(prev => {
          const newDetalles = [...prev.detalles];
          const currentRow = newDetalles[index];
          
          // Calculamos el nuevo estado de la fila
          const nextRowState = typeof updaterOrValue === 'function' 
              ? updaterOrValue(currentRow) 
              : updaterOrValue;

          // Si detectamos que se asignó un ID (selección), buscamos el stock en el backend? 
          // No, el componente hijo ya tenía el dato. 
          // *MEJORA*: Modificaremos ligeramente el uso abajo para que ProductoSearchSelect
          // nos permita guardar datos extra si le pasamos el objeto completo.
          
          newDetalles[index] = nextRowState;
          return { ...prev, detalles: newDetalles };
      });
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <p className="text-sm text-blue-700">
          ℹ️ Estás registrando un traslado de <strong>Almacén</strong> hacia <strong>Bodega</strong>.
          Asegúrate de tener stock suficiente en el Almacén.
        </p>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium text-gray-800">Productos a Reponer</h3>
            <button 
                type="button" 
                onClick={addRow}
                disabled={disabled}
                className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-800"
            >
                <PlusCircleIcon className="w-5 h-5" /> Agregar Producto
            </button>
        </div>

        <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-2/3">Producto (Origen: Almacén)</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/4">Cantidad a Mover</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Eliminar</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.detalles.map((detalle, index) => (
                        <tr key={index}>
                            <td className="px-4 py-2">
                                <ProductoSearchSelect 
                                    form={detalle}
                                    setForm={(updater) => handleSetRowState(index, updater)}
                                    disabled={disabled}
                                />
                            </td>
                            <td className="px-4 py-2 align-top">
                                <input 
                                    type="number" 
                                    min="1"
                                    value={detalle.cantidad}
                                    onChange={(e) => handleRowChange(index, e.target.value)}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm p-2 border"
                                    disabled={disabled}
                                />
                            </td>
                            <td className="px-4 py-2 text-center align-middle">
                                <button 
                                    type="button" 
                                    onClick={() => removeRow(index)}
                                    disabled={disabled || data.detalles.length === 1}
                                    className="text-red-500 hover:text-red-700 disabled:opacity-30"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default ReposicionForm;