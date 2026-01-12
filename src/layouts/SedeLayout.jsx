import React from 'react';
import SedeFloatingBadge from 'components/Shared/Badges/SedeFloatingBadge';

const SedeLayout = ({ children }) => {
    return (
        <>
            {children}

            <SedeFloatingBadge />
        </>
    );
};

export default SedeLayout;