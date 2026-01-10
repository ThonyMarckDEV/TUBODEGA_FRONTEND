import { fetchWithAuth } from 'js/authToken'; 
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse'; 

export const getComprobantes = async (page = 1, search = '') => {
  const url = `${API_BASE_URL}/api/comprobantes/index?page=${page}&search=${encodeURIComponent(search)}`;
  const response = await fetchWithAuth(url, { 
      method: 'GET',
      headers: { 'Accept': 'application/json' }
  });
  return handleResponse(response);
};

export const updateSunatStatus = async (id, status) => {
  const url = `${API_BASE_URL}/api/comprobantes/cambiar-estado/${id}`;
  const response = await fetchWithAuth(url, { 
      method: 'PATCH',
      headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' 
      },
      body: JSON.stringify({ sunat: status })
  });
  return handleResponse(response);
};