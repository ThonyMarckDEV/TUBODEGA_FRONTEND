import React, { useEffect, useState } from "react";
import jwtUtils from "utilities/Token/jwtUtils";
import { ClockIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";

import AdminDashboard from "ui/Administrador/dashboard/AdminDashboard";
import CajeroDashboard from "ui/Cajero/dashboard/CajeroDashboard";

const Home = () => {
  const [rol, setRol] = useState(null);
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    const token = jwtUtils.getAccessTokenFromCookie();

    if (token) {
      const rol = jwtUtils.getUserRole(token);
      const nombre = jwtUtils.getUsername(token);
      
      setRol(rol);
      setNombre(nombre || "Usuario");
    }
  }, []);

  return (
    <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto">
    
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Hola, <span className="text-slate-900">{nombre}</span> 👋
          </h1>
          <p className="text-slate-500 mt-2">
            Bienvenido al panel de control de <strong>Tu Bodega</strong>.
          </p>
        </div>
        
        <div className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider flex items-center gap-2 
          ${rol === 'admin' ? 'bg-slate-900 text-white' : 'bg-pink-100 text-pink-600'}`}>
          {rol === 'admin' ? <CheckBadgeIcon className="w-5 h-5"/> : <ClockIcon className="w-5 h-5"/>}
          {rol === 'admin' ? 'Administrador' : 'Cajero'}
        </div>
      </div>

      {rol === 'admin' && (
        <AdminDashboard />
      )}
      
      {rol === 'cajero' && (
         <CajeroDashboard />
      )}

    </div>
  );
};

export default Home;