import React, { useState, useEffect, useRef } from 'react';
import { getCategorias } from 'services/categoriaService';

const CategoriaSearchSelect = ({ form, setForm, disabled }) => {
    const [inputValue, setInputValue] = useState('');
    const [allCategorias, setAllCategorias] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);

    const wrapperRef = useRef(null);

    // 1. Cargar todas las categorías al iniciar
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const response = await getCategorias(1);
                // Extraemos el array ya sea paginado o directo
                const lista = response.data?.data || response.data || [];
                setAllCategorias(lista);
            } catch (error) {
                console.error("Error al cargar categorías", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

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

        // Si el usuario escribe, borramos el ID seleccionado porque ya no coincide
        if (form.id_Categoria) {
            setForm(prev => ({ ...prev, id_Categoria: null, categoriaNombre: '' }));
        }

        if (texto.length > 0) {
            // Filtrar localmente
            const filtrado = allCategorias.filter(cat => 
                cat.nombre.toLowerCase().includes(texto.toLowerCase())
            );
            setSuggestions(filtrado);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    // Al seleccionar una opción de la lista
    const handleSelect = (categoria) => {
        setInputValue(categoria.nombre);
        setForm(prev => ({ 
            ...prev, 
            id_Categoria: categoria.id, 
            categoriaNombre: categoria.nombre 
        }));
        setShowSuggestions(false);
    };

    // Al hacer clic en el input (para ver opciones si está vacío o lleno)
    const handleInputClick = () => {
        if (allCategorias.length > 0) {
            // Si el input está vacío mostramos todo, si tiene texto filtramos
            if (inputValue.trim() === '') {
                setSuggestions(allCategorias);
            } else {
                const filtrado = allCategorias.filter(cat => 
                    cat.nombre.toLowerCase().includes(inputValue.toLowerCase())
                );
                setSuggestions(filtrado);
            }
            setShowSuggestions(true);
        }
    };

    return (
        <section className="relative" ref={wrapperRef}>
            <label className="block text-sm font-medium text-slate-700 mb-1">
                Buscar Categoría
            </label>
            
            <div className="relative">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleChange}
                    onClick={handleInputClick}
                    disabled={disabled || loading}
                    placeholder={loading ? "Cargando..." : "Escribe para buscar..."}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:border-black focus:ring-black"
                    autoComplete="off"
                />

                {/* Lista Flotante */}
                {showSuggestions && (
                    <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-xl">
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
                                No se encontraron resultados.
                            </li>
                        )}
                    </ul>
                )}
            </div>

            {/* Texto de ayuda / Estado */}
            <div className="mt-1 text-xs">
                {form.id_Categoria ? (
                    <span className="text-green-600 font-semibold">✓ Seleccionado: ID {form.id_Categoria}</span>
                ) : (
                    <span className="text-gray-400">Selecciona una opción de la lista</span>
                )}
            </div>
        </section>
    );
};

export default CategoriaSearchSelect;