import axios from 'axios';
import API_BASE_URL from './urlHelper';
import jwtUtils from 'utilities/Token/jwtUtils';

let refreshPromise = null; // Variable para controlar la concurrencia

async function verificarYRenovarToken() {
  const access_token = jwtUtils.getAccessTokenFromCookie();
  const refresh_token = jwtUtils.getRefreshTokenFromCookie();

  if (!access_token || !refresh_token) {
    logout();
    throw new Error('Tokens no encontrados');
  }

  // SI YA HAY UNA VALIDACIÓN EN CURSO, ESPERAMOS A ESA
  if (refreshPromise) {
    console.log('[Token] Esperando a la validación en curso...');
    return refreshPromise;
  }

  // CREAMOS LA PROMESA DE VALIDACIÓN
  refreshPromise = (async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/validate-tokens`, {
        access_token,
        refresh_token
      });

      const { valid, access_token: newAccessToken } = response.data;

      if (!valid) {
        logout();
        throw new Error('Sesión no válida');
      }

      if (newAccessToken) {
        console.log('[Token] Access token renovado.');
        jwtUtils.setAccessTokenInCookie(newAccessToken);
        return newAccessToken;
      }

      return access_token;
    } catch (error) {
      console.error('[Token] Error en validación:', error.response?.data?.message);
      // Solo hacemos logout si es un error de autenticación real (401 o 400)
      if (error.response?.status === 401 || error.response?.status === 400) {
        logout();
      }
      throw error;
    } finally {
      refreshPromise = null; // Liberamos la promesa al terminar
    }
  })();

  return refreshPromise;
}

/**
 * Función wrapper para hacer fetch asegurando que el token es válido.
 */
async function fetchWithAuth(url, options = {}) {

  // Esta función se encarga de todo: validar, renovar si es necesario,
  // o hacer logout y lanzar un error si la sesión es inválida.
  const access_token = await verificarYRenovarToken();
  
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${access_token}`
  };
  
  return fetch(url, { ...options, headers });
}

/**
 * Cierra la sesión del usuario eliminando tokens y redirigiendo.
 */
function logout() {
  const refresh_token = jwtUtils.getRefreshTokenFromCookie();
  
  // Intenta notificar al backend sobre el logout si hay un refresh token
  if (refresh_token) {
    axios.post(`${API_BASE_URL}/api/logout`, { refresh_token })
      .catch(err => {
        console.warn('Error al notificar logout al backend:', err.message);
      });
  }

  jwtUtils.removeTokensFromCookie();
  window.location.href = '/'; // Redirigir a la página de login
}

export { fetchWithAuth, verificarYRenovarToken, logout };