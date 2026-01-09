import React from 'react';
import loaderGif from '../../assets/gif/loading.gif'; // asegúrate de que el nombre sea correcto

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <img 
        src={loaderGif} 
        alt="Loading..." 
        className="w-22 h-22 object-contain" 
      />
    </div>
  );
};

export default LoadingScreen;
