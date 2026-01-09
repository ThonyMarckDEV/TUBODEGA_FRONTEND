// src/services/rolService.js

import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse'; 

/**
 * Obtiene una lista paginada de roles desde el backend.
 * @param {number} page - El número de página a solicitar.
 * @returns {Promise<object>} - La respuesta paginada del backend.
 */
export const getRoles = async (page = 1) => {
  const url = `${API_BASE_URL}/api/roles/index?page=${page}`;

  const response = await fetchWithAuth(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    },
  });

  return handleResponse(response);
};