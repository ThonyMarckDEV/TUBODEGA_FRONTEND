import React, { useRef } from 'react';
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const PdfModal = ({ isOpen, onClose, title, pdfUrl }) => {
    // Referencia para acceder al contenido del iframe
    const iframeRef = useRef(null);

    if (!isOpen) return null;

    const handlePrint = () => {
        if (iframeRef.current) {
            const iframeWindow = iframeRef.current.contentWindow;
            iframeWindow.focus();
            iframeWindow.print();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl h-[95vh] flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                        <p className="text-xs text-slate-500 uppercase tracking-widest">Vista Previa del Comprobante</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <a 
                            href={pdfUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-2 text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
                            title="Descargar PDF"
                        >
                            <ArrowDownTrayIcon className="w-6 h-6" />
                        </a>
                        
                        <button 
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        >
                            <XMarkIcon className="w-7 h-7" />
                        </button>
                    </div>
                </div>

                {/* Body - El iframe ahora tiene una ref */}
                <div className="flex-1 bg-slate-200 overflow-hidden relative">
                    <iframe 
                        ref={iframeRef}
                        src={`${pdfUrl}#toolbar=0`} 
                        className="w-full h-full"
                        title="PDF Viewer"
                    />
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t bg-slate-50 flex justify-end gap-3">
                    <button 
                        onClick={handlePrint}
                        className="px-6 py-2 bg-slate-800 text-white rounded font-bold hover:bg-black transition-colors"
                    >
                        Imprimir Ahora
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PdfModal;