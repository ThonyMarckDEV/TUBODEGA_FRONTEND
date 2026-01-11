import { jwtDecode } from "jwt-decode";

// ==========================================
// 1. GESTIÓN DE COOKIES (Internas y Públicas)
// ==========================================

// Función interna para obtener el valor de una cookie por su nombre
const getCookie = (name) => {
  const cookieString = document.cookie;
  const cookies = cookieString.split(';').map(cookie => cookie.trim());

  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split('=');
    if (cookieName === name) {
      return decodeURIComponent(cookieValue); // Decodifica el valor de la cookie
    }
  }

  return null; // Si no se encuentra la cookie, devuelve null
};

// Función para obtener el token JWT de acceso de la cookie
export const getAccessTokenFromCookie = () => {
  const access_token = 'access_token';
  return getCookie(access_token);
};

// Función para obtener el token JWT de refresco de la cookie
export const getRefreshTokenFromCookie = () => {
  const refresh_token = 'refresh_token';
  return getCookie(refresh_token);
};

// Función para guardar el Access Token en cookie
export const setAccessTokenInCookie = (token) => {
  if (!token) return;

  // Configurar opciones de cookies
  const cookieOptions = '; Path=/; Secure; SameSite=Strict'; 

  // Establecer la cookie con el token
  document.cookie = `access_token=${token}${cookieOptions}`;
};

// Función para eliminar tokens (Logout)
export const removeTokensFromCookie = () => {
  document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

// ==========================================
// 2. GETTERS DE INFORMACIÓN DEL TOKEN
// ==========================================

export const getClaims = (token) => {
  try {
    return jwtDecode(token) ?? null;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export const getUsername = (token) => jwtDecode(token)?.username ?? null;

export const getFullName = (token) => jwtDecode(token)?.fullName ?? null;

export const getUserRole = (token) => jwtDecode(token)?.rol ?? null;

export const getEmail = (token) => jwtDecode(token)?.email ?? null;

export const getUserID = (token) => jwtDecode(token)?.sub ?? null;

export const getTrialDays = (token) => jwtDecode(token)?.trial_days ?? null;

export const getNombreSede = (token) => jwtDecode(token)?.nombre_sede ?? null;

export const isConfigurado = (token) => {
    try {
        const decoded = jwtDecode(token);
        return decoded?.configurado === 1;
    } catch (error) {
        return false;
    }
};

export const getCreatedAt = (token) => {
  try {
    const decodedToken = jwtDecode(token);
    return decodedToken?.createdAt 
      ? new Date(decodedToken.createdAt).toLocaleDateString('es', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }) 
      : "Usuario desde 2023";
  } catch (error) {
    console.error("Error decoding token for createdAt:", error);
    return "Usuario desde 2023";
  }
};

// ==========================================
// 3. VALIDACIONES Y FECHAS
// ==========================================

// Función para obtener la fecha de expiración
export const getTokenExpirationDate = (token) => {
  const exp = jwtDecode(token)?.exp;
  return exp ? new Date(exp * 1000) : null;
};

// Función para verificar si el token está expirado
export const isTokenExpired = (token) => {
  const decodedToken = jwtDecode(token);
  if (decodedToken?.exp) {
    const currentTime = Date.now() / 1000; // Tiempo actual en segundos
    return decodedToken.exp < currentTime;
  }
  return true; // Si no hay exp, considera el token como expirado
};

// Función para verificar el token de manera general
export const verifyToken = (token) => {
  if (!token) {
    return { valid: false, message: "Token no proporcionado" };
  }
  
  if (isTokenExpired(token)) {
    return { valid: false, message: "Token expirado" };
  }
  
  return { valid: true, message: "Token válido" };
};

// ==========================================
// 4. EXPORT POR DEFECTO
// ==========================================

const jwtUtils = {
  getClaims,
  getUsername,
  getFullName,
  getUserRole,
  isTokenExpired,
  getTokenExpirationDate,
  verifyToken,
  removeTokensFromCookie,
  getEmail,
  getCreatedAt,
  getAccessTokenFromCookie,
  getRefreshTokenFromCookie,
  setAccessTokenInCookie,
  getUserID,
  isConfigurado,
  getTrialDays,
  getNombreSede
};

export default jwtUtils;