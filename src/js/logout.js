import React from 'react';
import { createRoot } from 'react-dom/client';
import jwtUtils from 'utilities/Token/jwtUtils';
import API_BASE_URL from 'js/urlHelper';
import LoadingScreen from 'components/Shared/LoadingScreen';

export async function logout() {
  // Crear el contenedor
  const container = document.createElement('div');
  
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100vw';
  container.style.height = '100vh';
  container.style.zIndex = '99999';
  container.style.backgroundColor = 'rgba(0,0,0,0.5)';

  document.body.appendChild(container);
  const root = createRoot(container);

  try {
    // Renderizar LoadingScreen
    root.render(<LoadingScreen />);

    await fetch(`${API_BASE_URL}/api/logout`, {
        method: 'POST',
        credentials: 'include' 
    });

  } catch (error) {
    console.warn('[Logout] Error notificando al backend (igual cerramos localmente):', error);
  } finally {
    jwtUtils.removeTokensFromCookie();

    setTimeout(() => {
        root.unmount();
        if (document.body.contains(container)) {
            document.body.removeChild(container);
        }
        window.location.href = '/';
    }, 500);
  }
}

window.logout = logout;