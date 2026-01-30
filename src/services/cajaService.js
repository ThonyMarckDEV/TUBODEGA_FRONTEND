import { fetchWithAuth } from 'js/authToken'; 
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse'; 

export const getCajas = async (page = 1, search = '' , estado = '') => {
  const url = `${API_BASE_URL}/api/cajas/index?page=${page}&search=${search}&estado=${estado}`;
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

// --- METODO PARA CAJERO ---

// 1. CHECKEAR SI HAY UNA SESION ABIERTA
export const verificarSesionActiva = async () => {
    const url = `${API_BASE_URL}/api/caja-sesiones/estado-actual`;
    const response = await fetchWithAuth(url, { 
        method: 'GET', 
        headers: { 'Accept': 'application/json' } 
    });
    return handleResponse(response);
};

// 2. ABRIR CAJA
export const abrirCaja = async (data) => {
    const url = `${API_BASE_URL}/api/caja-sesiones/abrir`;
    const response = await fetchWithAuth(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
    });
    return handleResponse(response);
};

// 3. CERRAR CAJA
export const cerrarCaja = async (data) => {
    const url = `${API_BASE_URL}/api/caja-sesiones/cerrar`;
    const response = await fetchWithAuth(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
    });
    return handleResponse(response);
};