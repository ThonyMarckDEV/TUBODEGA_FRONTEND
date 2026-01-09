import { fetchWithAuth } from 'js/authToken'; 
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse'; 

/**
 * Crea un nuevo proveedor.
 * Endpoint: POST /api/proveedores/store
 */
export const createProveedor = async (proveedorData) => {
  const url = `${API_BASE_URL}/api/proveedores/store`;

  const response = await fetchWithAuth(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(proveedorData)
  });

  return handleResponse(response);
};

/**
 * Obtiene lista paginada de proveedores con búsqueda.
 * Endpoint: GET /api/proveedores/index?page={page}&search={search}
 */
export const getProveedores = async (page = 1, search = '') => {
  // Aseguramos que caracteres especiales viajen bien
  const term = encodeURIComponent(search);
  const url = `${API_BASE_URL}/api/proveedores/index?page=${page}&search=${term}`;

  const response = await fetchWithAuth(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  return handleResponse(response);
};

/**
 * Obtiene un proveedor por ID.
 * Endpoint: GET /api/proveedores/show/{id}
 */
export const showProveedor = async (id) => {
  const url = `${API_BASE_URL}/api/proveedores/show/${id}`;
  const response = await fetchWithAuth(url, { method: 'GET' });
  return handleResponse(response);
};

/**
 * Actualiza un proveedor.
 * Endpoint: PUT /api/proveedores/update/{id}
 */
export const updateProveedor = async (id, proveedorData) => {
  const url = `${API_BASE_URL}/api/proveedores/update/${id}`;
  const response = await fetchWithAuth(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(proveedorData)
  });
  return handleResponse(response);
};

/**
 * Cambia el estado (Activo/Inactivo).
 * Endpoint: PATCH /api/proveedores/cambiar-estado/{id}
 */
export const toggleProveedorEstado = async (id, nuevoEstado) => {
    // Nota: Asegúrate de haber corregido la ruta en api.php si usaste 'toggle' o 'cambiar-estado'
    const url = `${API_BASE_URL}/api/proveedores/${id}/toggle`; 
    
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