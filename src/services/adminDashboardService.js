import { fetchWithAuth } from 'js/authToken'; // Asumiendo que usas esta utilidad
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';

export const getDashboardMetrics = async () => {
  const url = `${API_BASE_URL}/api/admin/dashboard/metrics`;
  const response = await fetchWithAuth(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });
  return handleResponse(response);
};