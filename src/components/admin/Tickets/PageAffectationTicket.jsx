// src/components/admin/Tickets/PageAffectationTicket.jsx
import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, Paperclip, Trash2, Send, XCircle, AlertTriangle, CheckSquare, Square } from 'lucide-react';

const PageAffectationTicket = ({
    ticketObject,
    isForSubTicket = false,
    onConfirmAffectation,
    onCancel,
    availableModules = []
}) => {
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (ticketObject) {
      setTicket(ticketObject);
      // Correction de la ligne 24 :
      // S'assurer que moduleAssigne est un objet et non null avant d'accéder à .id
      if (ticketObject.moduleAssigne && typeof ticketObject.moduleAssigne === 'object' && ticketObject.moduleAssigne.id) {
        setSelectedModuleId(ticketObject.moduleAssigne.id);
      } else if (typeof ticketObject.moduleAssigne === 'string') {
        // Si moduleAssigne est déjà un ID (chaîne), l'utiliser directement
        setSelectedModuleId(ticketObject.moduleAssigne);
      } else {
        setSelectedModuleId(''); // Sinon, pas de module présélectionné
      }
      setAttachedFiles([]);
      setError('');
    } else {
      setError("Aucun ticket fourni pour l'affectation.");
      setTicket(null);
    }
  }, [ticketObject]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        fileObject: file
    }));
    setAttachedFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (fileName) => {
    setAttachedFiles(prev => prev.filter(file => file.name !== fileName));
  };

  const handleModuleSelect = (moduleId) => {
    setSelectedModuleId(prevId => prevId === moduleId ? '' : moduleId);
    setError('');
  };

  const handleSubmitAffectation = async (e) => {
    e.preventDefault();
    if (!ticket || !onConfirmAffectation) {
        setError("Impossible de soumettre : ticket ou fonction de confirmation manquante.");
        return;
    }
    if (!selectedModuleId) {
        setError("Veuillez sélectionner un module pour l'affectation.");
        return;
    }

    setIsLoading(true);
    setError('');

    const affectationData = {
      module: availableModules.find(m => m.id === selectedModuleId),
    };

    const nouveauxDocumentsPourSauvegarde = attachedFiles.map(f => ({ name: f.name, type: f.type, size: f.size, url: `#placeholder-url-for-${f.name}` }));

    try {
        // Passer ticketId, affectationData, isForSubTicket, et nouveauxDocuments
        await onConfirmAffectation(ticket.id, affectationData, isForSubTicket, nouveauxDocumentsPourSauvegarde);
        // La redirection et le message de succès sont gérés dans InterfaceAdmin
    } catch (err) {
        console.error("Erreur lors de la tentative d'affectation:", err);
        setError("Une erreur est survenue lors de l'affectation. Veuillez réessayer.");
    } finally {
        setIsLoading(false);
    }
  };

  const nomDemandeurFormatted = ticket?.demandeur ? `${ticket.demandeur.prenom || ''} ${ticket.demandeur.nom || ''}`.trim() : 'N/A';
  const finalNomDemandeur = (ticket?.demandeur && nomDemandeurFormatted === '') ? 'Demandeur Incomplet' : nomDemandeurFormatted;

  if (!ticket && !error && !isLoading) return <div className="p-6 text-center dark:text-slate-300">Chargement des informations du ticket...</div>;
  if (error && !ticket) return <div className="p-6 text-center text-red-500 dark:text-red-400">{error}</div>;
  if (!ticket) return null; // Ne rien rendre si le ticket n'est pas encore là et qu'il n'y a pas d'erreur de chargement initiale

  return (
    <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-950 min-h-full">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 p-5 md:p-8 rounded-xl shadow-xl">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          Affectation du {isForSubTicket ? "Sous-Ticket" : "Ticket"} : <span className="text-sky-600 dark:text-sky-400">{ticket.ref}</span>
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Titre : {ticket.titre}</p>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-300 rounded-md flex items-center">
            <AlertTriangle size={18} className="mr-2" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmitAffectation} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">Documents Joints</h3>
            <div className="p-4 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-center">
              <UploadCloud className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-500 mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Glissez-déposez des fichiers ici ou cliquez pour sélectionner.</p>
              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                id="file-upload-affectation"
              />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-secondary-outline btn-sm">
                Parcourir les fichiers
              </button>
            </div>
            {attachedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Fichiers à joindre :</p>
                {attachedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md text-xs">
                    <div className="flex items-center truncate">
                      <Paperclip size={14} className="mr-2 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-200 truncate" title={file.name}>{file.name}</span>
                      <span className="ml-2 text-slate-400 dark:text-slate-500">({(file.size / 1024).toFixed(1)} Ko)</span>
                    </div>
                    <button type="button" onClick={() => handleRemoveFile(file.name)} className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
             {ticket.documentsJoints && ticket.documentsJoints.length > 0 && (
                <div className="mt-4">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Documents déjà joints au ticket :</p>
                    {ticket.documentsJoints.map((doc, index) => (
                        <div key={`existing-${index}`} className="flex items-center p-2 bg-slate-100 dark:bg-slate-700 rounded-md text-xs mb-1">
                             <Paperclip size={14} className="mr-2 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                             <span className="text-slate-700 dark:text-slate-200 truncate" title={doc.name}>{doc.name}</span>
                        </div>
                    ))}
                </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">Assigner à un Module *</h3>
            {availableModules.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {availableModules.map(module => (
                        <button
                            type="button"
                            key={module.id}
                            onClick={() => handleModuleSelect(module.id)}
                            className={`p-3 border rounded-lg text-left transition-all duration-200 flex items-start space-x-3
                                        ${selectedModuleId === module.id
                                            ? 'border-sky-500 bg-sky-50 dark:bg-sky-700/30 ring-2 ring-sky-500'
                                            : 'border-slate-300 dark:border-slate-600 hover:border-sky-400 dark:hover:border-sky-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                        >
                            {selectedModuleId === module.id ? <CheckSquare size={18} className="text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" /> : <Square size={18} className="text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />}
                            <div>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{module.nom}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{module.description || "Pas de description"}</p>
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">Aucun module disponible pour l'affectation.</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-slate-200 dark:border-slate-700">
            {onCancel && (
              <button type="button" onClick={onCancel} className="btn btn-secondary-outline group w-full sm:w-auto" disabled={isLoading}>
                <XCircle size={18} className="mr-2" /> Annuler
              </button>
            )}
            <button type="submit" className="btn btn-primary group w-full sm:w-auto" disabled={isLoading || !selectedModuleId}>
              <Send size={18} className="mr-2" />
              {isLoading ? "Affectation en cours..." : "Confirmer l'Affectation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PageAffectationTicket;
