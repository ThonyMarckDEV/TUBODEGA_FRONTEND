import { fetchWithAuth } from 'js/authToken'; 
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse'; 

/**
 * Listar ventas con paginación y búsqueda opcional.
 * Endpoint: GET /api/ventas/index?page={page}&search={search}
 */
export const getVentas = async (page = 1, search = '') => {
  const url = `${API_BASE_URL}/api/ventas/index?page=${page}&search=${encodeURIComponent(search)}`;
  const response = await fetchWithAuth(url, { 
      method: 'GET',
      headers: { 'Accept': 'application/json' }
  });
  return handleResponse(response);
};

/**
 * Ver detalle de una venta específica (incluye sus productos).
 * Endpoint: GET /api/ventas/show/{id}
 */
export const showVenta = async (id) => {
  const url = `${API_BASE_URL}/api/ventas/show/${id}`;
  const response = await fetchWithAuth(url, { 
      method: 'GET',
      headers: { 'Accept': 'application/json' }
  });
  return handleResponse(response);
};

/**
 * Crea una nueva venta.
 * Endpoint: POST /api/ventas/store
 */
export const storeVenta = async (ventaData) => {
  const url = `${API_BASE_URL}/api/ventas/store`;

  const response = await fetchWithAuth(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(ventaData)
  });

  return handleResponse(response);
};

/**
 * Anular una venta (si tu sistema lo permite).
 * Endpoint: DELETE /api/ventas/destroy/{id}
 */
export const destroyVenta = async (id) => {
  const url = `${API_BASE_URL}/api/ventas/destroy/${id}`;
  const response = await fetchWithAuth(url, { 
      method: 'DELETE',
      headers: { 'Accept': 'application/json' }
  });
  return handleResponse(response);
};