import { fetchWithAuth } from 'js/authToken'; 
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse'; 

export const getCajas = async (page = 1, search = '') => {
  const url = `${API_BASE_URL}/api/cajas/index?page=${page}&search=${search}`;
  const response = await fetchWithAuth(url, { method: 'GET', headers: { 'Accept': 'application/json' } });
  return handleResponse(response);
};

export const createCaja = async (data) => {
  const url = `${API_BASE_URL}/api/cajas/store`;
  const response = await fetchWithAuth(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export const toggleCajaEstado = async (id) => {
    const url = `${API_BASE_URL}/api/cajas/cambiar-estado/${id}`;
    const response = await fetchWithAuth(url, {
        method: 'PATCH',
        headers: { 'Accept': 'application/json' }
    });
    return handleResponse(response);
};

export const getCajasDisponibles = async () => {
    const url = `${API_BASE_URL}/api/cajas/disponibles`;
    const response = await fetchWithAuth(url, { 
        method: 'GET', 
        headers: { 'Accept': 'application/json' } 
    });
    return handleResponse(response);
};