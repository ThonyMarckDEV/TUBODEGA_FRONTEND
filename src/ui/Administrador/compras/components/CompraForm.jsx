import React, { useEffect, useState } from 'react';
import { PlusCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import ProveedorSearchSelect from 'components/Shared/Comboboxes/ProveedorSearchSelect';
import ProductoSearchSelect from 'components/Shared/Comboboxes/ProductoSearchSelect';

const CompraForm = ({ data, setData, disabled = false }) => {
  
  // Calcular total general dinámicamente
  const [totalGeneral, setTotalGeneral] = useState(0);

  useEffect(() => {
    const total = data.detalles.reduce((acc, item) => {
        return acc + (parseFloat(item.cantidad || 0) * parseFloat(item.precio || 0));
    }, 0);
    setTotalGeneral(total);
  }, [data.detalles]);


  // --- MANEJO DE ARRAY DE DETALLES ---

  // Agregar fila vacía
  const addRow = () => {
    setData(prev => ({
        ...prev,
        detalles: [
            ...prev.detalles, 
            { id_Producto: null, productoNombre: '', cantidad: 1, precio: '' }
        ]
    }));
  };

  // Eliminar fila
  const removeRow = (index) => {
    const newDetalles = data.detalles.filter((_, i) => i !== index);
    setData(prev => ({ ...prev, detalles: newDetalles }));
  };

  // Cambio en inputs simples (Cantidad, Precio)
  const handleRowChange = (index, field, value) => {
    const newDetalles = [...data.detalles];
    newDetalles[index][field] = value;
    setData(prev => ({ ...prev, detalles: newDetalles }));
  };

  /**
   * TRUCO PARA USAR ProductoSearchSelect EN UNA LISTA:
   * El componente espera "setForm(prev => ...)"
   * Creamos una función adaptadora que recibe ese callback y lo aplica solo a la fila actual.
   */
  const handleSetRowState = (index, stateUpdater) => {
    setData(prev => {
        const newDetalles = [...prev.detalles];
        const currentRow = newDetalles[index];
        
        // Ejecutamos la actualización que pide el componente hijo (ProductoSearchSelect)
        // stateUpdater es una función: (prevRow) => newRow
        const updatedRow = stateUpdater(currentRow);
        
        newDetalles[index] = updatedRow;
        
        // Opcional: Si seleccionó un producto, precargar precio de compra si lo tuviéramos
        // if(updatedRow.id_Producto && !currentRow.id_Producto) { ... }

        return { ...prev, detalles: newDetalles };
    });
  };

  return (
    <div className="space-y-8">
      
      {/* --- SECCIÓN 1: PROVEEDOR --- */}
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Datos del Proveedor</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="md:col-span-2">
                <ProveedorSearchSelect 
                    form={data} 
                    setForm={setData} 
                    disabled={disabled} 
                />
             </div>
        </div>
      </div>

      {/* --- SECCIÓN 2: DETALLES DE PRODUCTOS --- */}
      <div>
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium text-gray-800">Productos</h3>
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">Producto</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo Unit.</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.detalles.map((detalle, index) => (
                        <tr key={index}>
                            <td className="px-4 py-2">
                                {/* Componente Reutilizable en cada fila */}
                                <ProductoSearchSelect 
                                    form={detalle}
                                    // Pasamos el adaptador especial
                                    setForm={(updater) => handleSetRowState(index, updater)}
                                    disabled={disabled}
                                />
                            </td>
                            <td className="px-4 py-2">
                                <input 
                                    type="number" 
                                    min="1"
                                    value={detalle.cantidad}
                                    onChange={(e) => handleRowChange(index, 'cantidad', e.target.value)}
                                    className="w-24 border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm p-1 border"
                                    disabled={disabled}
                                />
                            </td>
                            <td className="px-4 py-2">
                                <input 
                                    type="number" 
                                    min="0"
                                    step="0.01"
                                    value={detalle.precio}
                                    onChange={(e) => handleRowChange(index, 'precio', e.target.value)}
                                    placeholder="0.00"
                                    className="w-28 border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm p-1 border"
                                    disabled={disabled}
                                />
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-700 font-medium">
                                S/. {((parseFloat(detalle.cantidad || 0) * parseFloat(detalle.precio || 0))).toFixed(2)}
                            </td>
                            <td className="px-4 py-2 text-center">
                                <button 
                                    type="button" 
                                    onClick={() => removeRow(index)}
                                    disabled={disabled || data.detalles.length === 1} // No borrar la última
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

      {/* --- TOTAL GENERAL --- */}
      <div className="flex justify-end text-xl font-bold text-slate-800">
        Total Compra: S/. {totalGeneral.toFixed(2)}
      </div>

    </div>
  );
};

export default CompraForm;