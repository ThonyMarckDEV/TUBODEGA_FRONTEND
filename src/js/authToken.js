import axios from 'axios';
import API_BASE_URL from 'js/urlHelper';
import jwtUtils from 'utilities/Token/jwtUtils';

let refreshPromise = null;

async function verificarYRenovarToken() {
  const access_token = jwtUtils.getAccessTokenFromCookie();
  const refresh_token = jwtUtils.getRefreshTokenFromCookie();

  if (!access_token || !refresh_token) {
    logout();
    throw new Error('Tokens no encontrados');
  }

  if (refreshPromise) {
    console.log('[Token] Esperando a la validación en curso...');
    return refreshPromise;
  }

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

      if (error.response?.status === 401 || error.response?.status === 400) {
        logout();
      }
      throw error;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Función wrapper para hacer fetch asegurando que el token es válido.
 */
async function fetchWithAuth(url, options = {}) {

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