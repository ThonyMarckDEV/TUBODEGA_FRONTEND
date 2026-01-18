import { fetchWithAuth } from 'js/authToken'; 
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse'; 

export const getCajeroDashboardMetrics = async (startDate, endDate) => {
  // Apuntamos a la ruta específica del cajero
  let url = `${API_BASE_URL}/api/cajero/dashboard/metrics`;
  
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  
  // Si hay parámetros, los agregamos a la URL
  if (params.toString()) {
      url += `?${params.toString()}`;
  }

  const response = await fetchWithAuth(url, { 
    method: 'GET', 
    headers: { 'Accept': 'application/json' } 
  });
  return handleResponse(response);
};