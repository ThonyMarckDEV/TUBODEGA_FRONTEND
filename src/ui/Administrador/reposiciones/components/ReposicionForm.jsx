import React from 'react';
import { PlusCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import ProductoSearchSelect from 'components/Shared/Comboboxes/ProductoSearchSelect';

const ReposicionForm = ({ data, setData, disabled = false }) => {

  // 1. Calculamos los IDs que ya están en uso en toda la tabla
  const selectedIds = data.detalles
      .map(d => d.id_Producto)
      .filter(id => id != null);

  const addRow = () => {
    setData(prev => ({
        ...prev,
        detalles: [
            ...prev.detalles, 
            { id_Producto: null, productoNombre: '', cantidad: 1, stockDisponible: null }
        ]
    }));
  };

  const removeRow = (index) => {
    const newDetalles = data.detalles.filter((_, i) => i !== index);
    setData(prev => ({ ...prev, detalles: newDetalles }));
  };

  const handleRowChange = (index, value) => {
    const newDetalles = [...data.detalles];
    newDetalles[index].cantidad = value;
    setData(prev => ({ ...prev, detalles: newDetalles }));
  };

  const handleSetRowState = (index, stateUpdater) => {
    setData(prev => {
        const newDetalles = [...prev.detalles];
        const currentRow = newDetalles[index];
        let updatedRow = stateUpdater(currentRow);

        // OPCIONAL: Doble seguridad en el padre
        // Si el nuevo ID ya existe en otra fila (y no es el mismo de esta fila), no hacemos nada
        const isDuplicate = prev.detalles.some((d, i) => 
            i !== index && d.id_Producto === updatedRow.id_Producto && updatedRow.id_Producto !== null
        );

        if (isDuplicate) {
             // Podrías lanzar un toast/alerta aquí si quisieras
             return prev; 
        }

        newDetalles[index] = updatedRow;
        return { ...prev, detalles: newDetalles };
    });
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-md">
        <p className="text-sm text-blue-700">
          ℹ️ Estás registrando un traslado de <strong>Almacén</strong> hacia <strong>Bodega</strong>.
        </p>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">Productos a Reponer</h3>
            <button 
                type="button" 
                onClick={addRow}
                disabled={disabled}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 text-sm font-bold transition-colors"
            >
                <PlusCircleIcon className="w-5 h-5" /> 
                <span className="hidden sm:inline">Agregar Producto</span>
                <span className="sm:hidden">Agregar</span>
            </button>
        </div>

        <div className="border rounded-lg shadow-sm bg-white min-h-[400px] flex flex-col">
            <div className="overflow-x-auto pb-60 rounded-lg"> 
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-[60%] min-w-[200px]">
                                Producto
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-[25%] min-w-[100px]">
                                Cantidad
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-[15%]">
                                Acción
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.detalles.map((detalle, index) => {
                            // Calculamos qué IDs excluir para ESTA fila (todos menos el suyo propio)
                            const idsToExclude = selectedIds.filter(id => id !== detalle.id_Producto);

                            return (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 align-middle">
                                        <ProductoSearchSelect 
                                            form={detalle}
                                            setForm={(updater) => handleSetRowState(index, updater)}
                                            disabled={disabled}
                                            // PASAMOS LA LISTA DE EXCLUIDOS
                                            excludeIds={idsToExclude} 
                                        />
                                    </td>
                                    <td className="px-4 py-3 align-middle">
                                        <div className="flex items-center h-full">
                                            <input 
                                                type="number" 
                                                min="1"
                                                value={detalle.cantidad}
                                                onChange={(e) => handleRowChange(index, e.target.value)}
                                                className="block w-full h-[38px] rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm px-3 border"
                                                disabled={disabled}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 align-middle text-center">
                                        <button 
                                            type="button" 
                                            onClick={() => removeRow(index)}
                                            disabled={disabled || data.detalles.length === 1}
                                            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
             {data.detalles.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                    No hay productos agregados
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ReposicionForm;