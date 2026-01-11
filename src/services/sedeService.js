import { fetchWithAuth } from 'js/authToken'; 
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse'; 

export const createSede = async (data) => {
  const url = `${API_BASE_URL}/api/sedes/store`;
  const response = await fetchWithAuth(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export const getSedes = async (page = 1, search = '') => {
  const term = encodeURIComponent(search);
  const url = `${API_BASE_URL}/api/sedes/index?page=${page}&search=${term}`;
  const response = await fetchWithAuth(url, { method: 'GET', headers: { 'Accept': 'application/json' } });
  return handleResponse(response);
};

export const showSede = async (id) => {
  const url = `${API_BASE_URL}/api/sedes/show/${id}`;
  const response = await fetchWithAuth(url, { method: 'GET' });
  return handleResponse(response);
};

export const updateSede = async (id, data) => {
  const url = `${API_BASE_URL}/api/sedes/update/${id}`;
  const response = await fetchWithAuth(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export const toggleSedeEstado = async (id, nuevoEstado) => {
    const url = `${API_BASE_URL}/api/sedes/toggle-estado/${id}`;
    const response = await fetchWithAuth(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
    });
    return handleResponse(response);
};