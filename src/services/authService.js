import axios from 'axios';
import API_BASE_URL from 'js/urlHelper';
import { fetchWithAuth } from 'js/authToken';
import { handleResponse } from 'utilities/Responses/handleResponse'; 

const login = async (username, password, rememberMe) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/login`,
    { username, password, remember_me: rememberMe },
    {
      withCredentials: true, 
      headers: { 'Content-Type': 'application/json' },
    }
  );
  return response.data;
};

const forgotPassword = async (dni) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/forgot-password`,
    { dni },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
};

/**
 * Validar sesión y obtener datos reales del usuario (Ruta PROTEGIDA).
 * Aquí SÍ usamos fetchWithAuth para que inyecte el token y maneje la renovación.
 */
const verifySession = async () => {
  // fetchWithAuth se encarga de poner el Header: Authorization Bearer ...
  const response = await fetchWithAuth(`${API_BASE_URL}/api/me`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  // handleResponse procesará si es 200 (OK) o 401 (Token inválido/expiro)
  return handleResponse(response);
};

const authService = {
  login,
  forgotPassword,
  verifySession
};

export default authService;