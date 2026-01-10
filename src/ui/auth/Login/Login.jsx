import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import jwtUtils from 'utilities/Token/jwtUtils';
import LoadingScreen from 'components/Shared/LoadingScreen';
import LoginForm from './components/LoginForm';
import authService from 'services/authService';

// Importa aquí tu logo
import LogoTuBodega from 'assets/img/logo_TU_BODEGA.png'; 

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await authService.login(username, password, rememberMe);
      const { access_token, refresh_token } = result;

      // Configuración de Cookies
      const baseCookie = "; path=/; Secure; SameSite=Strict";
      const refreshExp = rememberMe 
        ? `; expires=${new Date(Date.now() + 7*24*60*60*1000).toUTCString()}` 
        : "";

      document.cookie = `access_token=${access_token}${baseCookie}`;
      document.cookie = `refresh_token=${refresh_token}${refreshExp}${baseCookie}`;

      const rol = jwtUtils.getUserRole(access_token);
      toast.success(`Acceso concedido`);
      setTimeout(() => navigate(`/${rol}`), 1000);

    } catch (error) {
      toast.error(error.response?.data?.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6]">
      <div className="w-full max-w-md px-6">
        
        {/* Contenedor del Logo */}
        <div className="flex justify-center mb-10">
          <img 
            src={LogoTuBodega} 
            alt="Tu Bodega Logo" 
            className="h-24 w-auto object-contain drop-shadow-md" 
          />
        </div>

        {/* Card de Login */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="p-10">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingScreen />
              </div>
            ) : (
              <LoginForm
                username={username}
                setUsername={setUsername}
                password={password}
                setPassword={setPassword}
                handleLogin={handleLogin}
                rememberMe={rememberMe}
                setRememberMe={setRememberMe}
              />
            )}
          </div>
          
          {/* Barra decorativa inferior (Toque elegante negro) */}
          <div className="h-2 bg-black w-full"></div>
        </div>
        
        <p className="text-center mt-6 text-[10px] text-gray-400 uppercase tracking-[0.2em]">
          Powered by ThonyMarckDEV v1.0
        </p>
      </div>
    </div>
  );
};

export default Login;