import React, { useState, useEffect, useRef } from 'react';
import { getCategorias } from 'services/categoriaService';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const CategoriaSearchSelect = ({ form, setForm, disabled }) => {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const wrapperRef = useRef(null);

    const fetchCategorias = async (searchTerm = '') => {
        setLoading(true);
        try {
            const response = await getCategorias(1, searchTerm);
            
            const lista = response.data?.data || response.data || [];
            
            setSuggestions(lista);
            setShowSuggestions(true);
            setHasSearched(true);
        } catch (error) {
            console.error("Error al buscar categorías", error);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (form && form.categoriaNombre) {
            setInputValue(form.categoriaNombre);
        } else if (form && !form.id_Categoria) {
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

        if (form.id_Categoria) {
            setForm(prev => ({ ...prev, id_Categoria: null, categoriaNombre: '' }));
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            fetchCategorias(inputValue);
        }
    };

    const handleSelect = (categoria) => {
        setInputValue(categoria.nombre);
        setForm(prev => ({ 
            ...prev, 
            id_Categoria: categoria.id, 
            categoriaNombre: categoria.nombre 
        }));
        setShowSuggestions(false);
    };

    const handleSearchClick = () => {
        fetchCategorias(inputValue);
    };

    const handleInputClick = () => {
        if (!showSuggestions && !hasSearched) {
            fetchCategorias('');
        } else {
            setShowSuggestions(true);
        }
    };

    return (
        <section className="relative" ref={wrapperRef}>
            <label className="block text-sm font-medium text-slate-700 mb-1">
                Buscar Categoría <span className="text-red-500">*</span>
            </label>
            
            <div className="relative flex items-center">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onClick={handleInputClick}
                    disabled={disabled || loading}
                    placeholder="Escribe y presiona Enter..."
                    className="w-full border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 border focus:border-black focus:ring-black"
                    autoComplete="off"
                />

                <button
                    type="button"
                    onClick={handleSearchClick}
                    className="absolute right-2 text-gray-400 hover:text-black"
                    disabled={loading}
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                    ) : (
                        <MagnifyingGlassIcon className="w-5 h-5" />
                    )}
                </button>

                {showSuggestions && (
                    <ul className="absolute z-50 top-full left-0 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-xl">
                        {suggestions.length > 0 ? (
                            suggestions.map((cat) => (
                                <li
                                    key={cat.id}
                                    onClick={() => handleSelect(cat)}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-none"
                                >
                                    {cat.nombre}
                                </li>
                            ))
                        ) : (
                            <li className="px-4 py-2 text-gray-500 text-sm italic">
                                {loading ? 'Buscando...' : 'No se encontraron resultados.'}
                            </li>
                        )}
                    </ul>
                )}
            </div>

            <div className="mt-1 text-xs h-4">
                {form.id_Categoria ? (
                    <span className="text-green-600 font-semibold flex items-center gap-1">
                        ✓ Seleccionado: {form.categoriaNombre} (ID: {form.id_Categoria})
                    </span>
                ) : (
                    <span className="text-gray-400">
                        {inputValue && !loading && hasSearched ? 'Selecciona una opción de la lista' : ''}
                    </span>
                )}
            </div>
        </section>
    );
};

export default CategoriaSearchSelect;