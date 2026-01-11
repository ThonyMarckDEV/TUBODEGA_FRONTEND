import React from 'react';
import SedeFloatingBadge from 'components/Shared/Badges/SedeFloatingBadge';

const SedeLayout = ({ children }) => {
    return (
        <>
            {/* Renderizamos el contenido principal (Sidebar + Páginas) */}
            {children}

            {/* Renderizamos la burbuja flotante encima de todo */}
            <SedeFloatingBadge />
        </>
    );
};

export default SedeLayout;