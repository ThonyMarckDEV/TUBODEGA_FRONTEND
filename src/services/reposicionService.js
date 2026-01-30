import { fetchWithAuth } from 'js/authToken'; 
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse'; 

/**
 * Crea una nueva reposición.
 * Endpoint: POST /api/reposiciones
 */
export const createReposicion = async (reposicionData) => {
  const url = `${API_BASE_URL}/api/reposiciones/store`;

  const response = await fetchWithAuth(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(reposicionData)
  });

  return handleResponse(response);
};

/**
 * Listar reposiciones con filtros de fecha.
 */
export const getReposiciones = async (page = 1, filters = {}) => {
  // Usamos URLSearchParams para construir la query string de forma limpia
  const params = new URLSearchParams({
    page: page,
    fecha_inicio: filters.fecha_inicio || '',
    fecha_fin: filters.fecha_fin || '',
    fecha: filters.fecha || '' 
  });

  const url = `${API_BASE_URL}/api/reposiciones/index?${params.toString()}`;
  
  const response = await fetchWithAuth(url, { 
      method: 'GET', 
      headers: { 'Accept': 'application/json' } 
  });
  
  return handleResponse(response);
};

/**
 * Ver detalle de reposición.
 * Endpoint: GET /api/reposiciones/{id}
 */
export const showReposicion = async (id) => {
  const url = `${API_BASE_URL}/api/reposiciones/show/${id}`;
  const response = await fetchWithAuth(url, { method: 'GET' });
  return handleResponse(response);
};

/**
 * Actualizar reposición.
 * Endpoint: PUT /api/reposiciones/{id}
 */
export const updateReposicion = async (id, reposicionData) => {
  const url = `${API_BASE_URL}/api/reposiciones/update/${id}`;
  const response = await fetchWithAuth(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(reposicionData)
  });
  return handleResponse(response);
};