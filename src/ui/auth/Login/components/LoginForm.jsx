import React from 'react';

const LoginForm = ({
  username,
  setUsername,
  password,
  setPassword,
  handleLogin,
  rememberMe,
  setRememberMe
}) => {
  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-lg font-medium text-gray-800 uppercase tracking-wider">
          Acceso al Sistema
        </h2>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 uppercase ml-1">
          Usuario
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:border-black transition-colors duration-300"
          placeholder="Ingrese usuario"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 uppercase ml-1">
          Contraseña
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:border-black transition-colors duration-300"
          placeholder="••••••••"
          required
        />
      </div>

      <div className="flex items-center">
        <input
          id="remember-me"
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="h-4 w-4 accent-black border-gray-300 rounded-none"
        />
        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
          Mantener sesión iniciada
        </label>
      </div>

      <button
        type="submit"
        className="w-full py-4 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-all duration-300 shadow-lg active:scale-[0.98]"
      >
        Entrar
      </button>
    </form>
  );
};

export default LoginForm;