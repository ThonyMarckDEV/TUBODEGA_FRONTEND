import { fetchWithAuth } from 'js/authToken'; // Asumo que tienes estas utilidades
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse'; 

/**
 * Envía los datos de un nuevo cliente al backend para su creación.
 * @param {object} clienteData - El objeto anidado con todos los datos del formulario.
 * @returns {Promise<object>} - El resultado de la operación desde el backend.
 */
export const createCliente = async (clienteData) => {
  // El endpoint que crearemos en Laravel
  const url = `${API_BASE_URL}/api/clientes/store`;

  const response = await fetchWithAuth(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    // Convertimos el objeto de JS a una cadena JSON
    body: JSON.stringify(clienteData)
  });

  return handleResponse(response);
};


/**
 * Obtiene una lista paginada de clientes desde el backend.
 * @param {number} page - El número de página a solicitar.
 * @returns {Promise<object>} - La respuesta paginada del backend.
 */
export const getClientes = async (page = 1) => {
  const url = `${API_BASE_URL}/api/clientes/index?page=${page}`;

  const response = await fetchWithAuth(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    },
  });

  return handleResponse(response);
};


/**
 * Obtiene toda la información de un cliente por su ID.
 */
export const showCliente = async (id) => {
  const url = `${API_BASE_URL}/api/clientes/show/${id}`;
  const response = await fetchWithAuth(url, { method: 'GET' });
  return handleResponse(response);
};

/**
 * Envía los datos actualizados de un cliente al backend.
 */
export const updateCliente = async (id, clienteData) => {
  const url = `${API_BASE_URL}/api/clientes/update/${id}`;
  const response = await fetchWithAuth(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(clienteData)
  });
  return handleResponse(response);
};


/**
 * Cambia el estado de un cliente (a inactivo).
 * @param {number} id - El ID del cliente a actualizar.
 * @param {number} nuevoEstado - El nuevo valor de estado (0 para Inactivo, 1 para Activo).
 * @returns {Promise<object>} - El resultado de la operación.
 */
export const toggleClienteEstado = async (id, nuevoEstado) => {
    const url = `${API_BASE_URL}/api/clientes/cambiar-estado/${id}`;
    
    // Usamos PATCH para actualizar solo un campo
    const response = await fetchWithAuth(url, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        // Enviamos el nuevo estado
        body: JSON.stringify({ estado: nuevoEstado })
    });

    return handleResponse(response);
};