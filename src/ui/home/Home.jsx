import React, { useEffect, useState } from "react";
import jwtUtils from "utilities/Token/jwtUtils";

const Home = () => {
  const [rol, setRol] = useState(null);

  useEffect(() => {
    const token = jwtUtils.getAccessTokenFromCookie();

    if (token) {
      try {
        const rol = jwtUtils.getUserRole(token);
        setRol(rol);
      } catch (error) {
        console.error("Error decodificando token:", error);
      }
    }
  }, []);

  return (
    <div className="flex-1 p-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Bienvenido al Home
      </h1>

      {rol === "admin" && (
        <p className="mt-4 text-green-600 font-semibold">
          Panel exclusivo para administradores.
        </p>
      )}

      {rol === "cajero" && (
        <p className="mt-4 text-pink-500 font-semibold">
          Herramientas de caja.
        </p>
      )}

      {!rol && (
        <p className="mt-4 text-red-600 font-semibold">
          No se encontró un rol válido.
        </p>
      )}
    </div>
  );
};

export default Home;
