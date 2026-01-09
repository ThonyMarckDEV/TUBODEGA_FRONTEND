import axios from 'axios';
import API_BASE_URL from 'js/urlHelper';

const login = async (username, password, rememberMe) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/login`,
    { username, password, remember_me: rememberMe },
    {
      headers: {
        'Content-Type': 'application/json',
      },
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

const authService = {
  login,
  forgotPassword,
};

export default authService;