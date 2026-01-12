import React, { useState, useEffect, useRef } from 'react';
import { getProductos } from 'services/productoService'; 
import { MagnifyingGlassIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const ProductoSearchSelect = ({ form, setForm, disabled, excludeIds = [] }) => {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const wrapperRef = useRef(null);

    const fetchProductos = async (searchTerm = '') => {
        setLoading(true);
        try {
            const response = await getProductos(1, searchTerm);
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

    useEffect(() => {
        if (form && form.productoNombre) {
            setInputValue(form.productoNombre);
        } else if (form && !form.id_Producto) {
            setInputValue('');
        }
    }, [form]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleChange = (e) => {
        const texto = e.target.value;
        setInputValue(texto);
        setHasSearched(false);

        if (form.id_Producto) {
            setForm(prev => ({ 
                ...prev, 
                id_Producto: null, 
                productoNombre: '',
                unidad: ''
            }));
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            fetchProductos(inputValue);
        }
    };

    const handleSelect = (producto) => {
        setInputValue(producto.nombre);
        setForm(prev => ({ 
            ...prev, 
            id_Producto: producto.id, 
            productoNombre: producto.nombre,
            stockDisponible: producto.stock_almacen,
            unidad: producto.unidad
        }));
        setShowSuggestions(false);
    };

    const handleSearchClick = () => fetchProductos(inputValue);

    const handleInputClick = () => {
        if (!showSuggestions && !hasSearched) {
            fetchProductos(''); 
        } else {
            setShowSuggestions(true);
        }
    };

    return (
        <section className="relative w-full" ref={wrapperRef}>
            
            <div className="relative flex items-center">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onClick={handleInputClick}
                    disabled={disabled || loading}
                    placeholder="Buscar producto..."
                    className="w-full h-[38px] border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 border focus:border-black focus:ring-black text-sm"
                    autoComplete="off"
                />

                <button
                    type="button"
                    onClick={handleSearchClick}
                    className="absolute right-2 text-gray-400 hover:text-black"
                    disabled={loading}
                    title="Buscar"
                >
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                    ) : (
                        <MagnifyingGlassIcon className="w-5 h-5" />
                    )}
                </button>

                {showSuggestions && (
                    <ul className="absolute z-50 top-full left-0 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-xl">
                        {suggestions.length > 0 ? (
                            suggestions.map((prod) => {
                                const isExcluded = excludeIds.includes(prod.id);

                                return (
                                    <li
                                        key={prod.id}
                                        onClick={() => {
                                            if (!isExcluded) handleSelect(prod);
                                        }}
                                        className={`
                                            px-4 py-2 border-b border-gray-50 last:border-none flex justify-between items-center text-sm
                                            ${isExcluded 
                                                ? 'bg-gray-100 opacity-60 cursor-not-allowed' 
                                                : 'hover:bg-gray-100 cursor-pointer text-gray-700'
                                            }
                                        `}
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900">{prod.nombre}</span>
                                                {isExcluded && (
                                                    <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold border border-red-200 flex items-center gap-1">
                                                        <ExclamationCircleIcon className="w-3 h-3"/> Ya agregado
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                {prod.categoria?.nombre || 'Sin Cat.'} | {prod.unidad}
                                            </div>
                                        </div>
                                        
                                        <div className="text-right flex flex-col items-end pl-2">
                                            <div className="text-xs font-bold text-blue-600">
                                                Almacén: {prod.stock_almacen}
                                            </div>
                                            <div className="text-[10px] text-gray-400">
                                                Bodega: {prod.stock_bodega}
                                            </div>
                                        </div>
                                    </li>
                                );
                            })
                        ) : (
                            <li className="px-4 py-2 text-gray-500 text-sm italic">
                                {loading ? 'Buscando...' : 'No se encontraron productos.'}
                            </li>
                        )}
                    </ul>
                )}
            </div>

            <div className="mt-1 text-xs h-4">
                {form.id_Producto ? (
                    <span className="text-green-600 font-semibold flex items-center gap-1 truncate">
                        ✓ {form.productoNombre} ({form.unidad || 'U'}) [ID: {form.id_Producto}]
                    </span>
                ) : (
                    <span className="text-gray-400 italic">
                        {inputValue && !loading && hasSearched ? 'Selecciona una opción de la lista' : ''}
                    </span>
                )}
            </div>
            
        </section>
    );
};

export default ProductoSearchSelect;