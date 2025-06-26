import React, { useState } from 'react';
import { LayoutGrid, File, FileSpreadsheet, Printer, Mic, LogOut, X } from 'lucide-react';
import { useExport } from '../context/ExportContext';

const FloatingActionButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const { currentExportPdfFunction, currentExportExcelFunction, currentPrintFunction } = useExport(); 

    const toggleOpen = () => setIsOpen(!isOpen);

    const handleClose = () => {
        setIsOpen(false);
        setIsVisible(true);
    };

    const handleMainButtonClick = () => {
        setIsOpen(true);
        setIsVisible(false);
    };

    const handleExportPdf = () => {
        if (currentExportPdfFunction) {
            currentExportPdfFunction();
            console.log("Exportation PDF déclenchée pour la page active !");
        } else {
            console.warn("Aucune fonction d'exportation PDF définie pour la page actuelle.");
        }
        handleClose();
    };

    const handleExportExcel = () => {
        if (currentExportExcelFunction) {
            currentExportExcelFunction();
            console.log("Exportation Excel déclenchée pour la page active !");
        } else {
            console.warn("Aucune fonction d'exportation Excel définie pour la page actuelle.");
        }
        handleClose();
    };

    const handlePrint = () => {
        if (currentPrintFunction) {
            currentPrintFunction();
            console.log("Impression déclenchée pour la page active !");
        } else {
            console.warn("Aucune fonction d'impression définie pour la page actuelle.");
        }
        handleClose();
    };

    const handleVoiceAssistant = () => {
        console.log("Assistance Vocale déclenchée ! (À implémenter)");
        handleClose();
    };

    const handleLogout = () => {
        console.log("Déconnexion déclenchée ! (À implémenter)");
        handleClose();
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Bouton principal */}
            {isVisible && (
                <button
                    onClick={handleMainButtonClick}
                    className="bg-blue-500 dark:bg-blue-400 text-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center transition-transform duration-300 focus:outline-none"
                    style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                >
                    <div className="grid grid-cols-3 gap-0.5">
                        <div className="w-0.5 h-0.5 bg-white rounded-sm"></div>
                        <div className="w-0.5 h-0.5 bg-white rounded-sm"></div>
                        <div className="w-0.5 h-0.5 bg-white rounded-sm"></div>
                        <div className="w-0.5 h-0.5 bg-white rounded-sm"></div>
                        <div className="w-0.5 h-0.5 bg-white rounded-sm"></div>
                        <div className="w-0.5 h-0.5 bg-white rounded-sm"></div>
                        <div className="w-0.5 h-0.5 bg-white rounded-sm"></div>
                        <div className="w-0.5 h-0.5 bg-white rounded-sm"></div>
                        <div className="w-0.5 h-0.5 bg-white rounded-sm"></div>
                    </div>
                </button>
            )}

            {/* Icônes flottantes */}
            {isOpen && (
                <div className="absolute bottom-0 right-2 space-y-2 w-10">
                    <button 
                        onClick={handleExportPdf} 
                        className={`bg-sky-100 dark:bg-blue-200 text-slate-600 dark:text-slate-300 shadow-md rounded-full w-10 h-10 flex items-center justify-center focus:outline-none 
                        ${!currentExportPdfFunction ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Exporter en PDF"
                        disabled={!currentExportPdfFunction}
                    >
                        <File size={18} />
                    </button>
                    <button 
                        onClick={handleExportExcel} 
                        className={`bg-sky-100 dark:bg-blue-200 text-slate-600 dark:text-slate-300 shadow-md rounded-full w-10 h-10 flex items-center justify-center focus:outline-none 
                        ${!currentExportExcelFunction ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Exporter en Excel"
                        disabled={!currentExportExcelFunction}
                    >
                        <FileSpreadsheet size={18} />
                    </button>
                    <button 
                        onClick={handlePrint} 
                        className={`bg-sky-100 dark:bg-blue-200 text-slate-600 dark:text-slate-300 shadow-md rounded-full w-10 h-10 flex items-center justify-center focus:outline-none 
                        ${!currentPrintFunction ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Imprimer"
                        disabled={!currentPrintFunction}
                    >
                        <Printer size={18} />
                    </button>
                    <button onClick={handleVoiceAssistant} className="bg-sky-100 dark:bg-blue-200 text-slate-600 dark:text-slate-300 shadow-md rounded-full w-10 h-10 flex items-center justify-center focus:outline-none" title="Assistance Vocale">
                        <Mic size={18} />
                    </button>
                    <button onClick={handleLogout} className="bg-sky-100 dark:bg-blue-200 text-slate-600 dark:text-slate-300 shadow-md rounded-full w-10 h-10 flex items-center justify-center focus:outline-none" title="Déconnexion">
                        <LogOut size={18} />
                    </button>
                    <button onClick={handleClose} className="bg-sky-100 dark:bg-blue-200 text-slate-600 dark:text-slate-300 shadow-md rounded-full w-10 h-10 flex items-center justify-center focus:outline-none" title="Masquer">
                        <X size={18} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default FloatingActionButton;