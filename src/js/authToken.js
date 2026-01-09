import axios from 'axios';
import API_BASE_URL from './urlHelper';
import jwtUtils from 'utilities/Token/jwtUtils';

/**
 * Valida la sesión actual contra el backend.
 * Envía ambos tokens. El backend decide si son válidos.
 * Si el access_token está expirado, el backend lo renovará
 * y lo devolverá en la respuesta.
 */
async function verificarYRenovarToken() {
  console.log('[Token] Verificando sesión con el backend...');
  
  const access_token = jwtUtils.getAccessTokenFromCookie();
  const refresh_token = jwtUtils.getRefreshTokenFromCookie();

  // Si faltan tokens localmente, no llama al backend.
  if (!access_token || !refresh_token) {
    console.log('[Token] No se encontraron tokens locales. Sesión finalizada.');
    logout(); // Ejecuta el logout
    throw new Error('Tokens no encontrados');
  }

  try {
    // Única llamada al backend para validar y/o refrescar
    const response = await axios.post(`${API_BASE_URL}/api/validate-tokens`, {
      access_token,
      refresh_token
    });

    const { valid, access_token: newAccessToken } = response.data;

    // Si el backend dice que no es válido
    if (!valid) {
      console.log('[Token] Backend reportó sesión no válida.');
      logout();
      throw new Error('Sesión no válida reportada por el backend');
    }

    // Si el backend nos dio un nuevo access token, lo guardamos
    if (newAccessToken) {
      console.log('[Token] Access token renovado por el backend.');
      jwtUtils.setAccessTokenInCookie(newAccessToken);
      return newAccessToken; // Devolvemos el nuevo
    }

    // Si no vino uno nuevo, el original sigue siendo válido
    console.log('[Token] Sesión validada. Access token sigue vigente.');
    return access_token; // Devolvemos el original

  } catch (error) {
    // Cualquier error (401, 403, 500) significa que la sesión es inválida
    console.error('[Token] Error al validar tokens con backend:', error.response?.data?.message || error.message);
    logout();
    throw new Error('Sesión inválida o expirada');
  }
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