import React, { useEffect } from 'react';
import { FaRegSadCry } from 'react-icons/fa';

const ErrorPage = () => {
  // Efecto de animación al cargar la página
  useEffect(() => {
    const elementsToAnimate = document.querySelectorAll('.animate-in');
    
    elementsToAnimate.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add('animate-show');
      }, 200 * index);
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-white">

      {/* Contenido principal */}
      <div className="flex-grow flex justify-center items-center relative z-10">
        <div className="text-center p-6 md:p-12">
          {/* Ícono con animación */}
          <div className="animate-in opacity-0 transform translate-y-8 transition-all duration-700 ease-out">
            <FaRegSadCry className="text-8xl text-red-600 mb-8 mx-auto animate-bounce-slow" />
          </div>
          
          {/* Título "404" con efecto de glow */}
          <h1 className="animate-in opacity-0 transform translate-y-8 transition-all duration-700 ease-out text-9xl font-bold text-transparent bg-clip-text bg-red-700 mb-4 ">
            401
          </h1>
          
          {/* Texto con animación */}
          <p className="animate-in opacity-0 transform translate-y-8 transition-all duration-700 ease-out text-2xl text-black mb-8 max-w-2xl mx-auto">
             La página que buscas no existe o se ha movido. Verifica la URL o regresa al inicio.
          </p>
          
          {/* Botón con animación */}
          <div className="animate-in opacity-0 transform translate-y-8 transition-all duration-700 ease-out">
            <a
              href="/"
              className="inline-block px-8 py-4 bg-red-600 text-white text-lg font-semibold rounded-lg  transition-all duration-300 transform hover:scale-105"
            >
              Volver al inicio
            </a>
          </div>
        </div>
      </div>

      {/* Estilos CSS para las animaciones */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
          100% { transform: translateY(0) rotate(360deg); }
        }
        
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(-5%); }
          50% { transform: translateY(5%); }
        }
        
        .glow-text {
          text-shadow: 0 0 15px rgba(255, 0, 0, 0.5), 0 0 25px rgba(255, 200, 0, 0.3);
        }
        
        .shadow-red-glow {
          box-shadow: 0 0 15px rgba(255, 0, 0, 0.4);
        }
        
        .shadow-red-glow-intense {
          box-shadow: 0 0 25px rgba(255, 0, 0, 0.6), 0 0 15px rgba(255, 200, 0, 0.3);
        }
        
        .animate-in {
          transition-property: opacity, transform;
        }
        
        .animate-show {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </div>
  );
};

export default ErrorPage;