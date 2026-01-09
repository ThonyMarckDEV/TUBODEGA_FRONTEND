import React, { useEffect, useState } from 'react';
import { PlusCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import ProveedorSearchSelect from 'components/Shared/Comboboxes/ProveedorSearchSelect';
import ProductoSearchSelect from 'components/Shared/Comboboxes/ProductoSearchSelect';

const CompraForm = ({ data, setData, disabled = false }) => {
  
  const [totalGeneral, setTotalGeneral] = useState(0);

  // 1. LISTA GLOBAL DE IDs SELECCIONADOS
  const selectedIds = data.detalles
      .map(d => d.id_Producto)
      .filter(id => id != null);

  useEffect(() => {
    const total = data.detalles.reduce((acc, item) => {
        return acc + (parseFloat(item.cantidad || 0) * parseFloat(item.precio || 0));
    }, 0);
    setTotalGeneral(total);
  }, [data.detalles]);

  const addRow = () => {
    setData(prev => ({
        ...prev,
        detalles: [
            ...prev.detalles, 
            { id_Producto: null, productoNombre: '', cantidad: 1, precio: '' }
        ]
    }));
  };

  const removeRow = (index) => {
    const newDetalles = data.detalles.filter((_, i) => i !== index);
    setData(prev => ({ ...prev, detalles: newDetalles }));
  };

  const handleRowChange = (index, field, value) => {
    const newDetalles = [...data.detalles];
    newDetalles[index][field] = value;
    setData(prev => ({ ...prev, detalles: newDetalles }));
  };

  const handleSetRowState = (index, stateUpdater) => {
    setData(prev => {
        const newDetalles = [...prev.detalles];
        const currentRow = newDetalles[index];
        const updatedRow = stateUpdater(currentRow);

        // Validación anti-duplicados en el padre
        const isDuplicate = prev.detalles.some((d, i) => 
            i !== index && d.id_Producto === updatedRow.id_Producto && updatedRow.id_Producto !== null
        );

        if (isDuplicate) return prev;

        newDetalles[index] = updatedRow;
        return { ...prev, detalles: newDetalles };
    });
  };

  return (
    <div className="space-y-8 h-full flex flex-col">
      
      {/* SECCIÓN 1: PROVEEDOR */}
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

      {/* SECCIÓN 2: DETALLES DE PRODUCTOS */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">Productos</h3>
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
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-[40%] min-w-[200px]">
                                Producto
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-[15%] min-w-[100px]">
                                Cantidad
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-[20%] min-w-[120px]">
                                Costo Unit.
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-[15%] min-w-[100px]">
                                Subtotal
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-[10%]">
                                Acción
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.detalles.map((detalle, index) => {
                             // Excluir IDs de otras filas, pero permitir el propio
                             const idsToExclude = selectedIds.filter(id => id !== detalle.id_Producto);

                             return (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 align-middle">
                                        <ProductoSearchSelect 
                                            form={detalle}
                                            setForm={(updater) => handleSetRowState(index, updater)}
                                            disabled={disabled}
                                            excludeIds={idsToExclude} // <--- NUEVA PROP
                                        />
                                    </td>

                                    <td className="px-4 py-3 align-middle">
                                        <input 
                                            type="number" 
                                            min="1"
                                            value={detalle.cantidad}
                                            onChange={(e) => handleRowChange(index, 'cantidad', e.target.value)}
                                            className="block w-full h-[38px] rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm px-3 border"
                                            disabled={disabled}
                                            placeholder="1"
                                        />
                                    </td>

                                    <td className="px-4 py-3 align-middle">
                                        <div className="relative rounded-md shadow-sm">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="text-gray-500 sm:text-sm">S/</span>
                                            </div>
                                            <input 
                                                type="number" 
                                                min="0"
                                                step="0.01"
                                                value={detalle.precio}
                                                onChange={(e) => handleRowChange(index, 'precio', e.target.value)}
                                                className="block w-full h-[38px] rounded-md border-gray-300 pl-8 focus:border-black focus:ring-black sm:text-sm border"
                                                disabled={disabled}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </td>

                                    <td className="px-4 py-3 align-middle text-sm text-gray-700 font-bold">
                                        S/. {((parseFloat(detalle.cantidad || 0) * parseFloat(detalle.precio || 0))).toFixed(2)}
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

      {/* TOTAL GENERAL */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <div className="text-right">
            <span className="block text-sm text-gray-500">Monto Total a Pagar</span>
            <span className="text-3xl font-bold text-slate-800">S/. {totalGeneral.toFixed(2)}</span>
        </div>
      </div>

    </div>
  );
};

export default CompraForm;