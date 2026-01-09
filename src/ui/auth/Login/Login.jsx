import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

import jwtUtils from 'utilities/Token/jwtUtils';
import LoadingScreen from 'components/Shared/LoadingScreen';
import LoginForm from './components/LoginForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import authService from 'services/authService';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [dni, setDni] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();

  // --- La lógica de las funciones permanece sin cambios ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await authService.login(username, password, rememberMe);
      const { access_token, refresh_token} = result;

      const accessTokenExpiration = '; path=/; Secure; SameSite=Strict';
      const refreshTokenExpiration = rememberMe
        ? `; expires=${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()}; path=/; Secure; SameSite=Strict`
        : '; path=/; Secure; SameSite=Strict';

      document.cookie = `access_token=${access_token}${accessTokenExpiration}`;
      document.cookie = `refresh_token=${refresh_token}${refreshTokenExpiration}`;

      const rol = jwtUtils.getUserRole(access_token);

      switch (rol) {
        case 'admin':
          toast.success(`Login exitoso!!`);
          setTimeout(() => navigate('/admin'), 1500);
          break;
        case 'cliente':
          toast.success(`Login exitoso!!`);
          setTimeout(() => navigate('/cliente'), 1500);
          break;
        default:
          console.error('Rol no reconocido:', rol);
          toast.error(`Rol no reconocido: ${rol}`);
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message || 'Error al iniciar sesión');
      } else {
        console.error('Error al intentar iniciar sesión:', error);
        toast.error('Error interno del servidor. Por favor, inténtelo de nuevo más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.forgotPassword(dni);
      toast.success('Se ha enviado un enlace de restablecimiento a tu correo.');
      setTimeout(() => setShowForgotPassword(false), 1500);
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message || 'Error al solicitar restablecimiento de contraseña');
      } else {
        console.error('Error al solicitar restablecimiento de contraseña:', error);
        toast.error('Error interno del servidor. Por favor, inténtelo de nuevo más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-gray-100">
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 sm:p-12">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="h-16 w-16 bg-amber-500 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl font-bold text-white">T</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Front End</h1>
          <p className="text-slate-500 mt-2 text-sm">Acceso seguro a tu plataforma</p>
        </div>

        <div>
          {loading ? (
             <div className="flex justify-center items-center h-48">
              <LoadingScreen />
            </div>
          ) : showForgotPassword ? (
            <ForgotPasswordForm
              dni={dni}
              setDni={setDni}
              handleForgotPassword={handleForgotPassword}
              setShowForgotPassword={setShowForgotPassword}
            />
          ) : (
            <LoginForm
              username={username}
              setUsername={setUsername}
              password={password}
              setPassword={setPassword}
              handleLogin={handleLogin}
              rememberMe={rememberMe}
              setRememberMe={setRememberMe}
              setShowForgotPassword={setShowForgotPassword}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;