import { fetchWithAuth } from 'js/authToken'; 
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse'; 

/**
 * Crea una nueva categoría.
 * Endpoint: POST /api/categorias
 */
export const createCategoria = async (categoriaData) => {
  const url = `${API_BASE_URL}/api/categorias/store`;

  const response = await fetchWithAuth(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(categoriaData)
  });

  return handleResponse(response);
};

/**
 * Obtiene lista paginada de categorías con filtros.
 * Endpoint: GET /api/categorias/index?page={page}&search={search}&estado={estado}
 */
export const getCategorias = async (page = 1, search = '', estado = '') => {
  const term = encodeURIComponent(search);
  const url = `${API_BASE_URL}/api/categorias/index?page=${page}&search=${term}&estado=${estado}`;

  const response = await fetchWithAuth(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  return handleResponse(response);
};

/**
 * Obtiene una categoría por ID.
 * Endpoint: GET /api/categorias/{id}
 */
export const showCategoria = async (id) => {
  const url = `${API_BASE_URL}/api/categorias/show/${id}`;
  const response = await fetchWithAuth(url, { method: 'GET' });
  return handleResponse(response);
};

/**
 * Actualiza una categoría.
 * Endpoint: PUT /api/categorias/{id}
 */
export const updateCategoria = async (id, categoriaData) => {
  const url = `${API_BASE_URL}/api/categorias/update/${id}`;
  const response = await fetchWithAuth(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(categoriaData)
  });
  return handleResponse(response);
};

/**
 * Cambia el estado (Eliminado lógico o Reactivación).
 * Endpoint: PATCH /api/categorias/{id}/toggle
 */
export const toggleCategoriaEstado = async (id, nuevoEstado) => {
    const url = `${API_BASE_URL}/api/categorias/cambiar-estado/${id}`;
    
    const response = await fetchWithAuth(url, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ estado: nuevoEstado })
    });

    return handleResponse(response);
};