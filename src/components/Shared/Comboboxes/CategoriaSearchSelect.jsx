import React, { useState, useEffect, useRef } from 'react';
import { getCategorias } from 'services/categoriaService';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'; // Asegúrate de tener heroicons

const CategoriaSearchSelect = ({ form, setForm, disabled }) => {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const wrapperRef = useRef(null);

    // 1. Cargar datos iniciales (o buscar cuando el usuario lo pida)
    const fetchCategorias = async (searchTerm = '') => {
        setLoading(true);
        try {
            // Llamamos al servicio pasando el término de búsqueda
            // Esto activará el filtro WHERE LIKE en el backend
            const response = await getCategorias(1, searchTerm);
            
            // Extraemos los datos
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

    // 2. Sincronizar input si viene un valor del formulario (ej. al Editar)
    useEffect(() => {
        if (form && form.categoriaNombre) {
            setInputValue(form.categoriaNombre);
        } else if (form && !form.id_Categoria) {
            setInputValue('');
        }
    }, [form]);

    // 3. Detectar clic fuera para cerrar la lista
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    // Al escribir en el input
    const handleChange = (e) => {
        const texto = e.target.value;
        setInputValue(texto);
        setHasSearched(false); // Reiniciamos estado de búsqueda

        // Si el usuario modifica el texto, borramos la selección previa
        if (form.id_Categoria) {
            setForm(prev => ({ ...prev, id_Categoria: null, categoriaNombre: '' }));
        }
    };

    // Al presionar Enter
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Evita enviar el formulario principal
            fetchCategorias(inputValue);
        }
    };

    // Al seleccionar una opción
    const handleSelect = (categoria) => {
        setInputValue(categoria.nombre);
        setForm(prev => ({ 
            ...prev, 
            id_Categoria: categoria.id, 
            categoriaNombre: categoria.nombre 
        }));
        setShowSuggestions(false);
    };

    // Al hacer clic en el botón de buscar
    const handleSearchClick = () => {
        fetchCategorias(inputValue);
    };

    // Al hacer clic para abrir (carga las default si está vacío)
    const handleInputClick = () => {
        if (!showSuggestions && !hasSearched) {
            fetchCategorias(''); // Carga inicial
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

                {/* Botón de Acción (Lupa o Loading) */}
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

                {/* Lista Flotante */}
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

            {/* Estado de selección */}
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