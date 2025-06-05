import React, { useEffect, useRef } from 'react';

interface ModalProps {
    children: React.ReactNode;
    onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ children, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Prevenir scroll del body cuando el modal está abierto
        document.body.style.overflow = 'hidden';

        // Función para manejar clics fuera del modal
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        // Función para manejar tecla Escape
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        // Agregar event listeners
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscKey);

        // Cleanup
        return () => {
            document.body.style.overflow = 'unset';
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div 
                ref={modalRef} 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
                {children}
            </div>
        </div>
    );
};

export default Modal;