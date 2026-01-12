import { fetchWithAuth } from 'js/authToken'; 
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse'; 

/**
 * Crea un nuevo producto.
 * Endpoint: POST /api/productos
 */
export const createProducto = async (productoData) => {
  const url = `${API_BASE_URL}/api/productos/store`;

  const response = await fetchWithAuth(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(productoData)
  });

  return handleResponse(response);
};

/**
 * Obtiene lista paginada de productos.
 * Endpoint: GET /api/productos/index?page={page}&search={search}&estado={estado}
 */
export const getProductos = async (page = 1, search = '', estado = '') => {
  const term = encodeURIComponent(search);

  const url = `${API_BASE_URL}/api/productos/index?page=${page}&search=${term}&estado=${estado}`;

  const response = await fetchWithAuth(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  return handleResponse(response);
};

/**
 * Obtiene un producto por ID.
 * Endpoint: GET /api/productos/{id}
 */
export const showProducto = async (id) => {
  const url = `${API_BASE_URL}/api/productos/show/${id}`;
  const response = await fetchWithAuth(url, { method: 'GET' });
  return handleResponse(response);
};

/**
 * Actualiza un producto.
 * Endpoint: PUT /api/productos/{id}
 */
export const updateProducto = async (id, productoData) => {
  const url = `${API_BASE_URL}/api/productos/update/${id}`;
  const response = await fetchWithAuth(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(productoData)
  });
  return handleResponse(response);
};

/**
 * Cambia el estado (Activo/Inactivo).
 * Endpoint: PATCH /api/productos/{id}/toggle
 */
export const toggleProductoEstado = async (id, nuevoEstado) => {
    const url = `${API_BASE_URL}/api/productos/cambiar-estado/${id}`; 
    
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