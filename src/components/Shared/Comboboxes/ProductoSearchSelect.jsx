import React, { useState, useEffect, useRef } from 'react';
import { getProductos } from 'services/productoService'; 
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const ProductoSearchSelect = ({ form, setForm, disabled }) => {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const wrapperRef = useRef(null);

    // 1. Función para buscar Productos en el Backend
    const fetchProductos = async (searchTerm = '') => {
        setLoading(true);
        try {
            // Llama al endpoint GET /api/productos?page=1&search=...
            const response = await getProductos(1, searchTerm);
            
            // Extraer array de datos
            const lista = response.data?.data || response.data || [];
            
            setSuggestions(lista);
            setShowSuggestions(true);
            setHasSearched(true);
        } catch (error) {
            console.error("Error al buscar productos", error);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    // 2. Sincronizar input si el formulario padre ya tiene datos
    useEffect(() => {
        // Busca 'productoNombre' en el form para mostrar el texto
        if (form && form.productoNombre) {
            setInputValue(form.productoNombre);
        } else if (form && !form.id_Producto) {
            setInputValue('');
        }
    }, [form]);

    // 3. Cerrar al hacer clic fuera
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    // Manejar escritura
    const handleChange = (e) => {
        const texto = e.target.value;
        setInputValue(texto);
        setHasSearched(false);

        // Si edita, limpiamos la selección previa
        if (form.id_Producto) {
            setForm(prev => ({ 
                ...prev, 
                id_Producto: null, 
                productoNombre: '',
                // Opcional: limpiar precio unitario si lo guardas en el form
                // precio: '' 
            }));
        }
    };

    // Buscar con Enter
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            fetchProductos(inputValue);
        }
    };

    // Seleccionar item de la lista
    const handleSelect = (producto) => {
        setInputValue(producto.nombre);
        
        // Actualizamos el estado del padre con ID y Nombre
        // Tip: Aquí podrías pasar también el precio si es para una Venta/Compra
        setForm(prev => ({ 
            ...prev, 
            id_Producto: producto.id, 
            productoNombre: producto.nombre,
            // ejemplo: precioUnitario: producto.precio_venta 
        }));
        
        setShowSuggestions(false);
    };

    // Botón Lupa
    const handleSearchClick = () => {
        fetchProductos(inputValue);
    };

    // Clic en input (abrir historial o buscar todo)
    const handleInputClick = () => {
        if (!showSuggestions && !hasSearched) {
            fetchProductos(''); // Carga los primeros 10
        } else {
            setShowSuggestions(true);
        }
    };

    return (
        <section className="relative" ref={wrapperRef}>
            <label className="block text-sm font-medium text-slate-700 mb-1">
                Buscar Producto <span className="text-red-500">*</span>
            </label>
            
            <div className="relative flex items-center">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onClick={handleInputClick}
                    disabled={disabled || loading}
                    placeholder="Nombre del producto..."
                    className="w-full border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 border focus:border-black focus:ring-black"
                    autoComplete="off"
                />

                {/* Icono Acción */}
                <button
                    type="button"
                    onClick={handleSearchClick}
                    className="absolute right-2 text-gray-400 hover:text-black"
                    disabled={loading}
                    title="Buscar"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                    ) : (
                        <MagnifyingGlassIcon className="w-5 h-5" />
                    )}
                </button>

                {/* Lista Desplegable */}
                {showSuggestions && (
                    <ul className="absolute z-50 top-full left-0 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-xl">
                        {suggestions.length > 0 ? (
                            suggestions.map((prod) => (
                                <li
                                    key={prod.id}
                                    onClick={() => handleSelect(prod)}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-none flex justify-between items-center"
                                >
                                    <div>
                                        <div className="font-medium text-gray-900">{prod.nombre}</div>
                                        <div className="text-xs text-gray-500">
                                            {prod.categoria?.nombre || 'Sin Cat.'} | {prod.unidad}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-semibold text-slate-700">
                                            Stock: {prod.stock_bodega}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            S/. {parseFloat(prod.precio_venta).toFixed(2)}
                                        </div>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="px-4 py-2 text-gray-500 text-sm italic">
                                {loading ? 'Buscando...' : 'No se encontraron productos.'}
                            </li>
                        )}
                    </ul>
                )}
            </div>

            {/* Feedback */}
            <div className="mt-1 text-xs h-4">
                {form.id_Producto ? (
                    <span className="text-green-600 font-semibold flex items-center gap-1">
                        ✓ Seleccionado: {form.productoNombre} (ID: {form.id_Producto})
                    </span>
                ) : (
                    <span className="text-gray-400">
                        {inputValue && !loading && hasSearched ? 'Selecciona una opción' : ''}
                    </span>
                )}
            </div>
        </section>
    );
};

export default ProductoSearchSelect;