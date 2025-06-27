// src/components/admin/Tickets/DocumentManager.jsx
import React, { useState } from 'react';
import { UploadCloud, FileText, Trash2, Download, XCircle } from 'lucide-react';
import documentService from '../../../services/documentService'; // Assurez-vous du chemin correct

const DocumentManager = ({ ticketId, documents, onDocumentChange, showTemporaryMessage }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileSelect = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            if (showTemporaryMessage) showTemporaryMessage('warning', 'Veuillez sélectionner un fichier à télécharger.');
            return;
        }
        if (!ticketId) {
            if (showTemporaryMessage) showTemporaryMessage('error', 'Impossible de télécharger le document: ID du ticket manquant.');
            return;
        }

        setIsUploading(true);
        try {
            await documentService.uploadDocument(selectedFile, ticketId);
            if (showTemporaryMessage) showTemporaryMessage('success', 'Document téléchargé avec succès.');
            setSelectedFile(null); // Réinitialiser le champ de fichier
            onDocumentChange(); // Demander au parent de rafraîchir les données
        } catch (error) {
            console.error("Erreur lors de l'upload du document:", error);
            const errorMessage = error.response?.data?.message || "Erreur lors du téléchargement du document.";
            if (showTemporaryMessage) showTemporaryMessage('error', errorMessage);
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
            if (showTemporaryMessage) showTemporaryMessage('success', 'Document supprimé avec succès.');
            onDocumentChange(); // Demander au parent de rafraîchir les données
        } catch (error) {
            console.error("Erreur lors de la suppression du document:", error);
            const errorMessage = error.response?.data?.message || "Erreur lors de la suppression du document.";
            if (showTemporaryMessage) showTemporaryMessage('error', errorMessage);
        }
    };

    const handleDownload = async (documentId, nomDocument, extension) => {
        try {
            await documentService.downloadDocument(documentId, `${nomDocument}.${extension}`);
        } catch (error) {
            console.error("Erreur lors du téléchargement du document:", error);
            if (showTemporaryMessage) showTemporaryMessage('error', 'Erreur lors du téléchargement du document.');
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
            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center">
                <FileText size={20} className="mr-2" /> Documents Joints ({documents?.length || 0})
            </h2>

            {/* Zone d'upload de fichier */}
            <div className="mb-6 border-dashed border-2 border-slate-300 dark:border-slate-700 rounded-lg p-4 text-center">
                <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={isUploading}
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 hover:text-sky-600">
                    <UploadCloud size={32} className="mb-2" />
                    <span className="font-medium">
                        {selectedFile ? selectedFile.name : "Glissez & déposez ou cliquez pour sélectionner un fichier"}
                    </span>
                    <span className="text-xs mt-1">Taille max: 5MB</span> {/* Vous pouvez ajuster cela */}
                </label>
                {selectedFile && (
                    <div className="mt-3 flex justify-center items-center space-x-2">
                        <button
                            onClick={handleUpload}
                            className="btn btn-primary-sm"
                            disabled={isUploading}
                        >
                            {isUploading ? 'Téléchargement...' : 'Télécharger le fichier'}
                        </button>
                        <button
                            onClick={() => setSelectedFile(null)}
                            className="btn btn-secondary-sm"
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
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-md border dark:border-slate-700">
                            <div className="flex items-center space-x-3">
                                <FileText size={20} className="text-sky-500" />
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-slate-100">{doc.nomDocument}.{doc.extension}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Ajouté le: {formatDate(doc.dateDocument)}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handleDownload(doc.id, doc.nomDocument, doc.extension)}
                                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full"
                                    title="Télécharger"
                                >
                                    <Download size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(doc.id)}
                                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full"
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
        </div>
    );
};

export default DocumentManager;