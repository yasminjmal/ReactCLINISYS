// src/components/admin/Tickets/DocumentManager.jsx
import React, { useState } from 'react';
import { UploadCloud, FileText, Trash2, Download, XCircle, ChevronDown, ChevronUp, AlertTriangle, CheckCircle } from 'lucide-react'; // Ajout AlertTriangle, CheckCircle pour ToastMessage
import documentService from '../../../services/documentService';

// Composant Spinner (au cas où il ne serait pas globalement défini)
const Spinner = () => <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>; // Couleur ajustée

// Composant de message de notification (Toast) - Réutilisé pour être cohérent
const ToastMessage = ({ message, type, onClose }) => {
    let bgColor, icon, titleColor, borderColor;
    switch (type) {
        case 'success':
            bgColor = 'bg-green-500';
            titleColor = 'text-white';
            borderColor = 'border-green-600';
            icon = <CheckCircle size={20} className="text-white" />;
            break;
        case 'error':
            bgColor = 'bg-red-500';
            titleColor = 'text-white';
            borderColor = 'border-red-600';
            icon = <AlertTriangle size={20} className="text-white" />;
            break;
        case 'info':
            bgColor = 'bg-blue-500';
            titleColor = 'text-white';
            borderColor = 'border-blue-600';
            icon = <Info size={20} className="text-white" />; // Si Info n'est pas importé, ajoutez-le ici
            break;
        default:
            bgColor = 'bg-gray-500';
            titleColor = 'text-white';
            borderColor = 'border-gray-600';
            icon = null;
    }

    return (
        <div className={`fixed bottom-4 right-4 ${bgColor} ${titleColor} px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 transform transition-transform duration-300 ease-out translate-y-0 opacity-100 border-2 ${borderColor} font-semibold`}>
            {icon}
            <span>{message}</span>
            <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors duration-200">
                <X size={16} />
            </button>
        </div>
    );
};


const DocumentManager = ({ ticketId, documents, onDocumentChange, setToast }) => { // showTemporaryMessage remplacé par setToast
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleFileSelect = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setToast({ type: 'warning', message: 'Veuillez sélectionner un fichier à télécharger.' });
            return;
        }
        if (!ticketId) {
            setToast({ type: 'error', message: 'Impossible de télécharger le document: ID du ticket manquant.' });
            return;
        }

        setIsUploading(true);
        try {
            await documentService.uploadDocument(selectedFile, ticketId);
            setToast({ type: 'success', message: 'Document téléchargé avec succès.' });
            setSelectedFile(null);
            onDocumentChange();
        } catch (error) {
            console.error("Erreur lors de l'upload du document:", error);
            const errorMessage = error.response?.data?.message || "Erreur lors du téléchargement du document.";
            setToast({ type: 'error', message: errorMessage });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (documentId) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
            return;
        }
        try {
            await documentService.deleteDocument(documentId);
            setToast({ type: 'success', message: 'Document supprimé avec succès.' });
            onDocumentChange();
        } catch (error) {
            console.error("Erreur lors de la suppression du document:", error);
            const errorMessage = error.response?.data?.message || "Erreur lors de la suppression du document.";
            setToast({ type: 'error', message: errorMessage });
        }
    };

    const handleDownload = async (documentId, nomDocument, extension) => {
        try {
            await documentService.downloadDocument(documentId, `${nomDocument}.${extension}`);
            // setToast({ type: 'success', message: 'Téléchargement lancé.' }); // Optionnel: notifier le début du téléchargement
        } catch (error) {
            console.error("Erreur lors du téléchargement du document:", error);
            setToast({ type: 'error', message: 'Erreur lors du téléchargement du document.' });
        }
    };

    const formatDate = (dateArray) => {
        if (!dateArray) return 'N/A';
        try {
            const date = new Date(dateArray[0], dateArray[1] - 1, dateArray[2], dateArray[3] || 0, dateArray[4] || 0, dateArray[5] || 0);
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit', month: 'short', year: 'numeric'
            });
        } catch (e) {
            return "Date invalide";
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg mb-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 flex items-center">
                    <FileText size={20} className="mr-2" /> Documents Joints ({documents?.length || 0})
                </h2>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
                    title={isCollapsed ? "Afficher les documents" : "Masquer les documents"}
                >
                    {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                </button>
            </div>

            {!isCollapsed && (
                <>
                    {/* Zone d'upload de fichier */}
                    <div className="mb-6 border-dashed border-2 border-slate-300 dark:border-slate-700 rounded-lg p-4 text-center">
                        <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            onChange={handleFileSelect}
                            disabled={isUploading}
                        />
                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors"> {/* Changé sky à blue */}
                            <UploadCloud size={32} className="mb-2" />
                            <span className="font-medium">
                                {selectedFile ? selectedFile.name : "Glissez & déposez ou cliquez pour sélectionner un fichier"}
                            </span>
                            <span className="text-xs mt-1">Taille max: 5MB</span>
                        </label>
                        {selectedFile && (
                            <div className="mt-3 flex justify-center items-center space-x-2">
                                <button
                                    onClick={handleUpload}
                                    className="btn btn-primary-sm" // Styles standardisés
                                    disabled={isUploading}
                                >
                                    {isUploading ? <Spinner /> : 'Télécharger le fichier'}
                                </button>
                                <button
                                    onClick={() => setSelectedFile(null)}
                                    className="btn btn-secondary-sm" // Styles standardisés
                                    disabled={isUploading}
                                >
                                    <XCircle size={16} className="mr-1"/> Annuler
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Liste des documents existants */}
                    {documents && documents.length > 0 ? (
                        <div className="space-y-3">
                            {documents.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-md border border-slate-200 dark:border-slate-700"> {/* Ajout de dark mode classes */}
                                    <div className="flex items-center space-x-3">
                                        <FileText size={20} className="text-blue-500" /> {/* Couleur d'icône ajustée */}
                                        <div>
                                            <p className="font-medium text-slate-800 dark:text-slate-100">{doc.nomDocument}.{doc.extension}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Ajouté le: {formatDate(doc.dateDocument)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleDownload(doc.id, doc.nomDocument, doc.extension)}
                                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full transition-colors" // Styles standardisés
                                            title="Télécharger"
                                        >
                                            <Download size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(doc.id)}
                                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors" // Styles standardisés
                                            title="Supprimer"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-slate-500 dark:text-slate-400 italic">Aucun document joint pour ce ticket.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default DocumentManager;