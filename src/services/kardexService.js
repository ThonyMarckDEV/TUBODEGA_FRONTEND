import { fetchWithAuth } from 'js/authToken'; 
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse'; 

/**
 * Obtiene el reporte de Kardex con filtros.
 * Endpoint: GET /api/kardex
 */
export const getKardex = async (page = 1, filters = {}) => {
  // Construimos query string dinámico
  const params = new URLSearchParams();
  params.append('page', page);

  if (filters.producto_id) params.append('producto_id', filters.producto_id);
  if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
  if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
  if (filters.tipo) params.append('tipo', filters.tipo);

  const response = await fetchWithAuth(`${API_BASE_URL}/api/kardex?${params.toString()}`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  return handleResponse(response);
};