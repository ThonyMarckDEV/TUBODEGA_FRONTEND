import React, { useState, useEffect, useRef } from 'react';
import { getProveedores } from 'services/proveedorService'; // Asegúrate de que la ruta sea correcta
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const ProveedorSearchSelect = ({ form, setForm, disabled }) => {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const wrapperRef = useRef(null);

    // 1. Función para buscar en el Backend
    const fetchProveedores = async (searchTerm = '') => {
        setLoading(true);
        try {
            // Llamamos al servicio con la página 1 y el término de búsqueda
            const response = await getProveedores(1, searchTerm);
            
            // Manejamos la estructura de respuesta de Laravel (paginada o directa)
            const lista = response.data?.data || response.data || [];
            
            setSuggestions(lista);
            setShowSuggestions(true);
            setHasSearched(true);
        } catch (error) {
            console.error("Error al buscar proveedores", error);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    // 2. Sincronizar input si el formulario padre ya tiene datos (ej. Editar)
    useEffect(() => {
        // Asumimos que en el form usas 'proveedorNombre' o 'proveedorRazonSocial' para mostrar el texto
        if (form && form.proveedorNombre) {
            setInputValue(form.proveedorNombre);
        } else if (form && !form.id_Proveedor) {
            setInputValue('');
        }
    }, [form]);

    // 3. Cerrar lista al hacer clic fuera
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    // Manejar escritura en el input
    const handleChange = (e) => {
        const texto = e.target.value;
        setInputValue(texto);
        setHasSearched(false); // Reiniciamos el estado de "buscado"

        // Si el usuario cambia el texto, limpiamos el ID seleccionado para evitar inconsistencias
        if (form.id_Proveedor) {
            setForm(prev => ({ 
                ...prev, 
                id_Proveedor: null, 
                proveedorNombre: '' 
            }));
        }
    };

    // Buscar al presionar Enter
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Evita submit del form principal
            fetchProveedores(inputValue);
        }
    };

    // Seleccionar un proveedor de la lista
    const handleSelect = (proveedor) => {
        setInputValue(proveedor.razon_social);
        setForm(prev => ({ 
            ...prev, 
            id_Proveedor: proveedor.id, 
            proveedorNombre: proveedor.razon_social 
        }));
        setShowSuggestions(false);
    };

    // Buscar al hacer clic en la lupa
    const handleSearchClick = () => {
        fetchProveedores(inputValue);
    };

    // Abrir lista al hacer clic en el input (carga inicial si está vacío)
    const handleInputClick = () => {
        if (!showSuggestions && !hasSearched) {
            fetchProveedores(''); // Trae los primeros 10 por defecto
        } else {
            setShowSuggestions(true);
        }
    };

    return (
        <section className="relative" ref={wrapperRef}>
            <label className="block text-sm font-medium text-slate-700 mb-1">
                Buscar Proveedor <span className="text-red-500">*</span>
            </label>
            
            <div className="relative flex items-center">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onClick={handleInputClick}
                    disabled={disabled || loading}
                    placeholder="Razón Social o RUC..."
                    className="w-full border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 border focus:border-black focus:ring-black"
                    autoComplete="off"
                />

                {/* Botón Lupa / Loading */}
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

                {/* Dropdown de Resultados */}
                {showSuggestions && (
                    <ul className="absolute z-50 top-full left-0 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-xl">
                        {suggestions.length > 0 ? (
                            suggestions.map((prov) => (
                                <li
                                    key={prov.id}
                                    onClick={() => handleSelect(prov)}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-none"
                                >
                                    <div className="font-medium text-gray-900">{prov.razon_social}</div>
                                    {prov.ruc && (
                                        <div className="text-xs text-gray-500">RUC: {prov.ruc}</div>
                                    )}
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

            {/* Feedback de Selección */}
            <div className="mt-1 text-xs h-4">
                {form.id_Proveedor ? (
                    <span className="text-green-600 font-semibold flex items-center gap-1">
                        ✓ Seleccionado: {form.proveedorNombre} (ID: {form.id_Proveedor})
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

export default ProveedorSearchSelect;