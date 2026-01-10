import React, { useState, useEffect, useRef } from 'react';
import { getClientes } from 'services/clienteService';
import { MagnifyingGlassIcon, BuildingOfficeIcon, UserIcon } from '@heroicons/react/24/outline';

const ClienteSearchSelect = ({ form, setForm, disabled }) => {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const wrapperRef = useRef(null);

    const fetchClientes = async (searchTerm = '') => {
        setLoading(true);
        try {
            const response = await getClientes(1, searchTerm);
            const lista = response.data || [];
            setSuggestions(lista);
            setShowSuggestions(true);
            setHasSearched(true);
        } catch (error) {
            console.error("Error al buscar clientes", error);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (form && form.clienteNombre) {
            setInputValue(form.clienteNombre);
        } else if (form && !form.id_Cliente) {
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

        if (form.id_Cliente) {
            setForm(prev => ({ 
                ...prev, 
                id_Cliente: null, 
                clienteNombre: '' 
            }));
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            fetchClientes(inputValue);
        }
    };

    const handleSelect = (cliente) => {
        // Lógica de nombre: Si es empresa (tiene RUC), usamos solo el nombre comercial.
        // Si no, concatenamos los apellidos.
        const esEmpresa = !!cliente.datos.ruc && cliente.datos.ruc !== '';
        
        const nombreMostrar = esEmpresa 
            ? cliente.datos.nombre 
            : `${cliente.datos.nombre} ${cliente.datos.apellidoPaterno} ${cliente.datos.apellidoMaterno}`;
        
        setInputValue(nombreMostrar);
        setForm(prev => ({ 
            ...prev, 
            id_Cliente: cliente.id, 
            clienteNombre: nombreMostrar,
            clienteData: cliente.datos // Guardamos los datos para saber si es B o F en el service
        }));
        setShowSuggestions(false);
    };

    const handleSearchClick = () => fetchClientes(inputValue);

    const handleInputClick = () => {
        if (!showSuggestions && !hasSearched) {
            fetchClientes('');
        } else {
            setShowSuggestions(true);
        }
    };

    return (
        <section className="relative" ref={wrapperRef}>
            <label className="block text-sm font-medium text-slate-700 mb-1">
                Buscar Cliente <span className="text-red-500">*</span>
            </label>
            
            <div className="relative flex items-center">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onClick={handleInputClick}
                    disabled={disabled || loading}
                    placeholder="Buscar por DNI, RUC o Nombre..."
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
                    <ul className="absolute z-50 top-full left-0 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-64 overflow-y-auto shadow-xl">
                        {suggestions.length > 0 ? (
                            suggestions.map((cli) => {
                                const esEmpresa = !!cli.datos.ruc && cli.datos.ruc !== '';
                                return (
                                    <li
                                        key={cli.id}
                                        onClick={() => handleSelect(cli)}
                                        className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm border-b border-gray-100 last:border-none flex items-start gap-3"
                                    >
                                        <div className="mt-1">
                                            {esEmpresa ? (
                                                <BuildingOfficeIcon className="w-5 h-5 text-blue-500" />
                                            ) : (
                                                <UserIcon className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-900 uppercase">
                                                {esEmpresa 
                                                    ? cli.datos.nombre 
                                                    : `${cli.datos.nombre} ${cli.datos.apellidoPaterno} ${cli.datos.apellidoMaterno}`}
                                            </div>
                                            <div className="text-xs text-gray-500 flex gap-2 mt-0.5">
                                                {esEmpresa ? (
                                                    <span className="bg-blue-50 text-blue-700 px-1.5 rounded font-medium">RUC: {cli.datos.ruc}</span>
                                                ) : (
                                                    <span className="bg-gray-100 text-gray-700 px-1.5 rounded font-medium">DNI: {cli.datos.dni}</span>
                                                )}
                                                <span className="text-gray-400">| {esEmpresa ? 'Empresa' : 'Cliente'}</span>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })
                        ) : (
                            <li className="px-4 py-3 text-gray-500 text-sm italic">
                                {loading ? 'Buscando...' : 'No se encontraron resultados.'}
                            </li>
                        )}
                    </ul>
                )}
            </div>

            <div className="mt-1 text-xs h-4">
                {form.id_Cliente ? (
                    <span className="text-green-600 font-semibold flex items-center gap-1">
                        ✓ Seleccionado: {form.clienteNombre}
                    </span>
                ) : (
                    <span className="text-gray-400 italic">
                        {inputValue && !loading && hasSearched ? '⚠️ Selecciona un resultado de la lista' : 'Ingresa datos para buscar'}
                    </span>
                )}
            </div>
        </section>
    );
};

export default ClienteSearchSelect;