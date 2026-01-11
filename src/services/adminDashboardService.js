import { fetchWithAuth } from 'js/authToken'; 
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse'; 

export const getDashboardMetrics = async (startDate, endDate) => {
  // Construimos la URL con query params si existen
  let url = `${API_BASE_URL}/api/admin/dashboard/metrics`;
  
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  
  if (params.toString()) {
      url += `?${params.toString()}`;
  }

  const response = await fetchWithAuth(url, { 
    method: 'GET', 
    headers: { 'Accept': 'application/json' } 
  });
  return handleResponse(response);
};