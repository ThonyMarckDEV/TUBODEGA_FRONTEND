import { fetchWithAuth } from 'js/authToken'; 
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse'; 

/**
 * Crea una nueva compra.
 * Endpoint: POST /api/compras
 */
export const createCompra = async (compraData) => {
  const url = `${API_BASE_URL}/api/compras/store`;

  const response = await fetchWithAuth(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(compraData)
  });

  return handleResponse(response);
};

/**
 * Obtiene lista paginada de compras.
 * Endpoint: GET /api/compras?page={page}&search={search}
 */
export const getCompras = async (page = 1, search = '') => {
  const term = encodeURIComponent(search);
  const url = `${API_BASE_URL}/api/compras/index?page=${page}&search=${term}`;

  const response = await fetchWithAuth(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  return handleResponse(response);
};

/**
 * Obtiene una compra por ID (con detalles).
 * Endpoint: GET /api/compras/{id}
 */
export const showCompra = async (id) => {
  const url = `${API_BASE_URL}/api/compras/show/${id}`;
  const response = await fetchWithAuth(url, { method: 'GET' });
  return handleResponse(response);
};

/**
 * Actualiza una compra.
 * Endpoint: PUT /api/compras/{id}
 */
export const updateCompra = async (id, compraData) => {
  const url = `${API_BASE_URL}/api/compras/update/${id}`;
  const response = await fetchWithAuth(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(compraData)
  });
  return handleResponse(response);
};