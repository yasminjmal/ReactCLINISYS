// src/components/shared/Modal.jsx
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import './Modal.css'; // <-- AJOUTEZ CETTE LIGNE : Importez le fichier CSS créé

const Modal = ({ isOpen, onClose, title, children, footerActions, size = 'md' }) => {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className={`bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full ${sizeClasses[size] || sizeClasses.md} flex flex-col animate-scaleUp max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête du Modal */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            aria-label="Fermer le modal"
          >
            <X size={22} />
          </button>
        </div>

        {/* Contenu du Modal */}
        <div className="p-5 md:p-6 overflow-y-auto flex-grow">
          {children}
        </div>

        {/* Pied de page du Modal (pour les boutons d'action) */}
        {footerActions && (
          <div className="flex items-center justify-end p-4 border-t border-slate-200 dark:border-slate-700 space-x-3">
            {footerActions}
          </div>
        )}
      </div>
      {/* <style jsx>...</style> <-- LIGNE SUPPRIMÉE */}
    </div>
  );
};

export default Modal;