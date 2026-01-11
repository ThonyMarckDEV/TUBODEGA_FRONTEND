// src/services/configService.js
import { fetchWithAuth } from 'js/authToken'; 
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse'; 

export const getConfig = async () => {
  const url = `${API_BASE_URL}/api/config/show`;
  const response = await fetchWithAuth(url, { 
    method: 'GET', 
    headers: { 'Accept': 'application/json' } 
  });
  return handleResponse(response);
};

export const updateConfig = async (data) => {
  const url = `${API_BASE_URL}/api/config/update`;
  const response = await fetchWithAuth(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};