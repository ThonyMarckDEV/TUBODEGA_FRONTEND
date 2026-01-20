import { fetchWithAuth } from 'js/authToken'; 
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse'; 

export const getSesionesCaja = async (page = 1, search = '') => {
  const url = `${API_BASE_URL}/api/caja-sesiones/index?page=${page}&search=${search}`;
  const response = await fetchWithAuth(url, { 
      method: 'GET', 
      headers: { 'Accept': 'application/json' } 
  });
  return handleResponse(response);
};