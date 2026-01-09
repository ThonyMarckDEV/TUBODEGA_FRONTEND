import React, { useState, useEffect } from 'react';
import { showCategoria, getCategorias } from 'services/categoriaService';

const CategoriaSearchSelect = ({ form, setForm, setAlert, setErrors, disabled }) => {
    const [loading, setLoading] = useState(false);
    const [searchInput, setSearchInput] = useState(form.categoriaSearch || '');

    // Sincronizar input si el formulario se limpia externamente
    useEffect(() => {
        if (form.id_Categoria === null && !form.categoriaNombre) {
            setSearchInput('');
        }
    }, [form.id_Categoria, form.categoriaNombre]);

    const handleInputChange = (e) => {
        const { value } = e.target;
        setSearchInput(value);
        
        // Si el usuario cambia el input después de haber seleccionado, reseteamos la selección
        if (form.id_Categoria && form.categoriaNombre !== value) {
            setForm(prev => ({ 
                ...prev, 
                id_Categoria: null, 
                categoriaNombre: ''
            }));
        }
    };

    const handleSearch = async () => {
        const term = searchInput.trim();
        
        if (!term) { 
            setErrors(prev => ({ ...prev, categoriaSearch: 'Ingrese un ID o Nombre para buscar.' }));
            return;
        }

        setLoading(true);
        // Limpiamos selección previa
        setForm(prev => ({ ...prev, id_Categoria: null, categoriaNombre: '' }));
        setAlert(null);
        setErrors(prev => ({ ...prev, categoriaSearch: null }));
        
        try {
            let categoriaEncontrada = null;

            // LÓGICA DE BÚSQUEDA MIXTA
            
            // CASO 1: Si es un número, asumimos que es una búsqueda por ID
            if (!isNaN(term)) {
                try {
                    const response = await showCategoria(term);
                    // El backend devuelve { type: 'success', data: {...} }
                    if (response.data) {
                        categoriaEncontrada = response.data;
                    }
                } catch (e) {
                    // Si falla por ID (404), no lanzamos error aún, podríamos intentar buscar por nombre si fuera texto mixto
                    console.log("No encontrado por ID, intentando otras vías...");
                }
            } 
            
            // CASO 2: Si no se encontró por ID o es texto, buscamos en la lista (Nombre)
            // NOTA: Esto busca en la primera página. Para una búsqueda profunda idealmente el backend debe filtrar.
            if (!categoriaEncontrada) {
                const response = await getCategorias(1); // Traemos la página 1
                const lista = response.data?.data || [];
                
                // Buscamos coincidencia de nombre (insensible a mayúsculas)
                categoriaEncontrada = lista.find(c => 
                    c.nombre.toLowerCase().includes(term.toLowerCase()) || 
                    c.nombre.toLowerCase() === term.toLowerCase()
                );
            }

            // RESULTADO FINAL
            if (categoriaEncontrada) {
                setForm(prev => ({ 
                    ...prev, 
                    id_Categoria: categoriaEncontrada.id, 
                    categoriaNombre: categoriaEncontrada.nombre,
                    // Guardamos el término que usó para buscar para mantener consistencia visual
                    categoriaSearch: term 
                }));
                setAlert({ type: 'success', message: `Categoría "${categoriaEncontrada.nombre}" seleccionada.` });
            } else {
                throw new Error('Categoría no encontrada.');
            }

        } catch (err) {
            setAlert({ type: 'error', message: 'No se encontró la categoría.' });
            setErrors(prev => ({ ...prev, categoriaSearch: 'Verifique el ID o el Nombre.' }));
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setSearchInput('');
        setAlert(null);
        setErrors(prev => ({...prev, categoriaSearch: null}));
        setForm(prev => ({
            ...prev,
            id_Categoria: null,
            categoriaNombre: '',
            categoriaSearch: ''
        }));
    };

    return (
        <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Selección de Categoría</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                
                {/* INPUT DE BÚSQUEDA */}
                <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID o Nombre</label>
                    <input 
                        type="text" 
                        name="searchInput"
                        value={searchInput}
                        onChange={handleInputChange}
                        placeholder="Ej. 1 o 'Bebidas'"
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-amber-500 focus:ring-amber-500 disabled:bg-gray-100 p-2 border"
                        disabled={disabled}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                    />
                    {form.errors?.categoriaSearch && <p className="text-red-500 text-xs mt-1">{form.errors.categoriaSearch}</p>}
                </div>
                
                {/* BOTONES */}
                <div className="flex gap-2">
                    <button 
                        type="button" 
                        onClick={handleSearch}
                        disabled={loading || !searchInput || disabled}
                        className="w-full bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-md transition duration-150 disabled:bg-gray-400"
                    >
                        {loading ? '...' : 'Buscar'}
                    </button>
                    
                    <button 
                        type="button" 
                        onClick={handleClear}
                        disabled={disabled}
                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-md transition duration-150 disabled:bg-gray-100"
                    >
                        Limpiar
                    </button>
                </div>
                
                {/* RESULTADO SELECCIONADO */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría Seleccionada</label>
                    <div className={`p-2 border rounded-md truncate ${form.id_Categoria ? 'bg-green-50 border-green-200 text-green-800 font-medium' : 'bg-gray-100 border-gray-300 text-gray-500'}`}>
                        {form.categoriaNombre || 'Ninguna seleccionada'}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CategoriaSearchSelect;