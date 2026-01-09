// src/components/Shared/Modals/ConfirmModal.jsx

import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ConfirmModal = ({ 
    message, 
    onConfirm, 
    onCancel, 
    confirmText = 'Sí, continuar', 
    cancelText = 'Cancelar',
    title = '¿Estás seguro?'
}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm transition-opacity">
            
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm transform transition-all scale-100 overflow-hidden border border-gray-100">
                
                <div className="p-6">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 mb-5">
                        <ExclamationTriangleIcon className="h-7 w-7 text-red-600" aria-hidden="true" />
                    </div>

                    <div className="text-center">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {title}
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            {message}
                        </p>
                    </div>
                </div>

                {/* CORRECCIÓN AQUÍ: Eliminé 'sm:justify-end' y dejé 'justify-center' */}
                <div className="bg-gray-50 px-6 py-4 flex flex-col-reverse sm:flex-row gap-3 justify-center border-t border-gray-100">
                    
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full sm:w-auto inline-flex justify-center rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors duration-200"
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        className="w-full sm:w-auto inline-flex justify-center rounded-xl border border-transparent bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;