import React from 'react';

import { HashLoader } from 'react-spinners';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 transition-all duration-300">
      

      <HashLoader 
        color="#000000" 
        size={60}
        speedMultiplier={1.5}
      />
      

      <p className="mt-6 text-gray-500 text-sm font-medium tracking-widest uppercase animate-pulse">
        Cargando ...
      </p>
    </div>
  );
};

export default LoadingScreen;