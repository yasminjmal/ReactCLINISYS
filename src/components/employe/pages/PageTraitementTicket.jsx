// src/components/employe/pages/PageTraitementTicket.jsx
import React, { useState, useEffect } from 'react';
import { FileText, MessageSquare, CheckCircle, Clock, Info, Paperclip, Send, User, CalendarDays, Tag, Layers, AlertTriangle, Save, Eye, XCircle as XCircleIcon } from 'lucide-react'; // XCircle importé et renommé pour éviter conflit si XCircle est aussi un nom de variable/fonction
import Modal from '../../shared/Modal';

const PageTraitementTicket = ({ ticket, user, onAjouterCommentaire, onTerminerTicket, onRetourListe, onUpdateEcheance, isReadOnly = false }) => {
  const [nouveauCommentaire, setNouveauCommentaire] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dateEcheanceInput, setDateEcheanceInput] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInput, setModalInput] = useState('');

  useEffect(() => {
    setNouveauCommentaire('');
    if (ticket) {
      setDateEcheanceInput(ticket.dateEcheance ? new Date(ticket.dateEcheance).toISOString().split('T')[0] : '');
      setModalInput(ticket.notesResolutionEmploye || '');
    }
  }, [ticket]);

  if (!ticket) {
    return (
      <div className="p-6 md:p-10 text-center bg-slate-50 dark:bg-slate-800/50 rounded-lg shadow-inner m-4">
        <Info size={48} className="mx-auto mb-4 text-sky-500" />
        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-3">Aucun ticket sélectionné</h2>
        <p className="text-slate-500 dark:text-slate-400">Veuillez sélectionner un ticket.</p>
        {onRetourListe && (
            <button onClick={onRetourListe} className="btn btn-primary mt-6 py-2 text-sm">
                Retour aux listes
            </button>
        )}
      </div>
    );
  }

  const openTerminerModal = () => {
    setModalInput(ticket.notesResolutionEmploye || '');
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleTerminerModalConfirm = () => {
    if (isReadOnly) return;
    setIsLoading(true);
    setTimeout(() => {
      const notes = modalInput.trim() || "Ticket résolu.";
      onTerminerTicket(ticket.id, notes);
      setIsLoading(false);
      closeModal();
    }, 500);
  };
  
  const handleSubmitCommentaire = (e) => {
    e.preventDefault();
    if (isReadOnly || !nouveauCommentaire.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      onAjouterCommentaire(ticket.id, nouveauCommentaire);
      setNouveauCommentaire('');
      setIsLoading(false);
    }, 500);
  };

  const handleSaveEcheance = () => {
    if (isReadOnly || !dateEcheanceInput) return;
    onUpdateEcheance(ticket.id, dateEcheanceInput);
  };
  
  const getPriorityPillStyle = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'haute': return 'bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-400';
      case 'moyenne': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700/30 dark:text-yellow-400';
      case 'basse': return 'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-400';
      default: return 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
  };
  
  const getStatusPillStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'en cours': return 'bg-blue-100 text-blue-700 dark:bg-blue-700/30 dark:text-blue-400';
      case 'terminé': return 'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-400';
      case 'refusé par employé': return 'bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-400'; // Style pour refusé
      default: return 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  return (
    <>
      <div className={`p-4 md:p-6 bg-white dark:bg-slate-800 rounded-lg shadow-xl m-2 md:m-4 animate-fadeIn ${isReadOnly ? 'border-2 border-sky-500' : ''}`}>
        {isReadOnly && (
            <div className="mb-4 p-2 bg-sky-50 dark:bg-sky-700/30 text-sky-700 dark:text-sky-300 rounded-md text-sm flex items-center">
                <Eye size={18} className="mr-2"/> Mode lecture seule. Ce ticket est {ticket.statut?.toLowerCase()}.
            </div>
        )}
        {/* En-tête du ticket */}
        <div className="border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
              <h2 className="text-xl lg:text-2xl font-bold text-sky-700 dark:text-sky-400 flex items-center">
                  <FileText size={28} className="mr-3 flex-shrink-0" />
                  {ticket.titre}
              </h2>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${getStatusPillStyle(ticket.statut)}`}>
                  Statut: {ticket.statut}
              </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
              <span className="flex items-center"><Tag size={13} className="mr-1"/>ID: {ticket.id}</span>
              <span className={`flex items-center font-medium px-2 py-0.5 rounded-full text-xs ${getPriorityPillStyle(ticket.priorite)}`}>
                  Priorité: {ticket.priorite}
              </span>
              <span className="flex items-center"><CalendarDays size={13} className="mr-1"/>Créé le: {new Date(ticket.dateCreation).toLocaleDateString()}</span>
              {ticket.datePriseEnCharge && <span className="flex items-center"><CalendarDays size={13} className="mr-1"/>Pris en charge le: {new Date(ticket.datePriseEnCharge).toLocaleDateString()}</span>}
              {ticket.dateResolutionEmploye && ticket.statut === "Terminé" && <span className="flex items-center"><CalendarDays size={13} className="mr-1"/>Terminé le: {new Date(ticket.dateResolutionEmploye).toLocaleDateString()}</span>}
              {ticket.dateRefusEmploye && ticket.statut === "Refusé par employé" && <span className="flex items-center"><CalendarDays size={13} className="mr-1"/>Refusé le: {new Date(ticket.dateRefusEmploye).toLocaleDateString()}</span>}
          </div>
        </div>

        {/* Détails et Description */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
            <h3 className="text-md font-semibold text-slate-700 dark:text-slate-200 mb-2">Description du problème</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
              {ticket.description || "Aucune description détaillée fournie."}
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg space-y-2">
            <h3 className="text-md font-semibold text-slate-700 dark:text-slate-200 mb-2">Informations Clés</h3>
            <div className="text-sm">
              <p className="flex items-center text-slate-600 dark:text-slate-300"><User size={14} className="mr-2 text-sky-600 dark:text-sky-500"/><strong>Demandeur:</strong></p>
              <p className="ml-6 text-slate-500 dark:text-slate-400">{ticket.demandeur?.prenom} {ticket.demandeur?.nom} ({ticket.demandeur?.service || 'N/A'})</p>
            </div>
             <div className="text-sm">
              <p className="flex items-center text-slate-600 dark:text-slate-300"><User size={14} className="mr-2 text-sky-600 dark:text-sky-500"/><strong>Client:</strong></p>
              <p className="ml-6 text-slate-500 dark:text-slate-400">{ticket.client || 'Non spécifié'}</p>
            </div>
            <div className="text-sm">
              <p className="flex items-center text-slate-600 dark:text-slate-300"><Layers size={14} className="mr-2 text-sky-600 dark:text-sky-500"/><strong>Module concerné:</strong></p>
              <p className="ml-6 text-slate-500 dark:text-slate-400">{ticket.moduleConcerne || 'Non spécifié'}</p>
            </div>
            {/* Section Date d'échéance */}
            <div className="text-sm pt-2 border-t border-slate-200 dark:border-slate-700 mt-2">
                <label htmlFor="date-echeance" className={`flex items-center mb-1.5 font-medium ${isReadOnly ? 'text-slate-500 dark:text-slate-400' : 'text-slate-600 dark:text-slate-300'}`}>
                    <CalendarDays size={14} className="mr-2 text-sky-600 dark:text-sky-500"/>Date d'échéance:
                </label>
                <div className="flex gap-2 items-center ml-6">
                  <input 
                    type="date"
                    id="date-echeance"
                    value={dateEcheanceInput}
                    onChange={(e) => setDateEcheanceInput(e.target.value)}
                    className="form-input py-1.5 text-sm w-full rounded-md border-slate-300 dark:border-slate-600 focus:ring-sky-500 focus:border-sky-500 disabled:bg-slate-100 dark:disabled:bg-slate-700 disabled:text-slate-400"
                    disabled={isReadOnly || isLoading}
                  />
                  {!isReadOnly && (
                    <button 
                        onClick={handleSaveEcheance} 
                        className="btn btn-secondary-outline p-2.5 rounded-md hover:bg-sky-50 dark:hover:bg-slate-700" 
                        title="Sauvegarder la date d'échéance"
                        disabled={isLoading}
                    >
                        <Save size={16} />
                    </button>
                  )}
                </div>
            </div>
             {ticket.notesResolutionEmploye && ticket.statut === "Terminé" && (
                <div className="text-sm pt-2 border-t border-slate-200 dark:border-slate-700 mt-2">
                    <p className="flex items-center text-green-600 dark:text-green-400"><CheckCircle size={14} className="mr-2"/><strong>Notes de résolution:</strong></p>
                    <p className="ml-6 text-slate-500 dark:text-slate-400 whitespace-pre-line">{ticket.notesResolutionEmploye}</p>
                </div>
            )}
            {ticket.motifRefusEmploye && ticket.statut === "Refusé par employé" && (
                <div className="text-sm pt-2 border-t border-slate-200 dark:border-slate-700 mt-2">
                    <p className="flex items-center text-red-600 dark:text-red-400"><XCircleIcon size={14} className="mr-2"/><strong>Motif du refus:</strong></p> {/* Utilisation de XCircleIcon */}
                    <p className="ml-6 text-slate-500 dark:text-slate-400 whitespace-pre-line">{ticket.motifRefusEmploye}</p>
                </div>
            )}
          </div>
        </div>
        
        {/* Section Commentaires */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center">
              <MessageSquare size={20} className="mr-2 text-sky-600 dark:text-sky-500"/>Commentaires ({ticket.commentaires?.length || 0})
          </h3>
          <div className="space-y-4 max-h-96 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            {(ticket.commentaires && ticket.commentaires.length > 0) ? (
              ticket.commentaires.slice().sort((a,b) => new Date(b.date) - new Date(a.date)).map(comm => (
                <div key={comm.id || comm.date} className="p-3 bg-white dark:bg-slate-700 rounded-md shadow">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs font-semibold text-sky-700 dark:text-sky-400">{comm.auteur}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{new Date(comm.date).toLocaleString()}</p>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line">{comm.texte}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 italic text-center py-4">Aucun commentaire pour le moment.</p>
            )}
          </div>
        </div>

        {/* Formulaire pour ajouter un commentaire (masqué en lecture seule ou si ticket non "En cours") */}
        {!isReadOnly && ticket.statut === 'En cours' && (
          <form onSubmit={handleSubmitCommentaire} className="mb-8">
            <h4 className="text-md font-semibold text-slate-700 dark:text-slate-200 mb-2">Ajouter un commentaire / Note de travail</h4>
            <textarea
              value={nouveauCommentaire}
              onChange={(e) => setNouveauCommentaire(e.target.value)}
              placeholder="Saisissez votre commentaire, les actions effectuées, les informations recueillies..."
              rows="4"
              className="form-input w-full text-sm p-3 border-slate-300 dark:border-slate-600 focus:ring-sky-500 focus:border-sky-500"
              required
              disabled={isLoading && !!nouveauCommentaire}
            />
            <div className="mt-3 flex justify-end items-center gap-3">
               <button type="button" className="btn btn-secondary-outline py-2 text-xs flex items-center" disabled={isLoading}>
                  <Paperclip size={14} className="mr-1.5" /> Joindre un fichier (Bientôt)
              </button>
              <button type="submit" className="btn btn-primary py-2 text-sm flex items-center" disabled={isLoading && !!nouveauCommentaire}>
                {isLoading && !!nouveauCommentaire ? <Clock size={16} className="animate-spin mr-1.5" /> : <Send size={16} className="mr-1.5" />}
                {isLoading && !!nouveauCommentaire ? 'Envoi...' : 'Ajouter le commentaire'}
              </button>
            </div>
          </form>
        )}

        {/* Actions sur le ticket (masquées en lecture seule ou si ticket non "En cours") */}
        {!isReadOnly && ticket.statut === 'En cours' && (
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-wrap justify-start gap-3">
            <button 
              onClick={openTerminerModal} 
              className="btn bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 py-2.5 px-5 text-sm flex items-center"
              disabled={isLoading}
            >
              <CheckCircle size={18} className="mr-2" /> Marquer comme Terminé
            </button>
          </div>
        )}
        
         {onRetourListe && (
              <div className="mt-8">
                   <button onClick={onRetourListe} className="btn btn-secondary-outline py-2 text-sm">
                      {isReadOnly ? 'Retour à la liste précédente' : 'Retour à la liste des travaux en cours'}
                  </button>
              </div>
          )}

        {/* Correction de la balise style jsx */}
        <style jsx="true">{`
          .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        `}</style>
      </div>

      {/* Modal pour terminer le ticket (uniquement si pas en lecture seule) */}
      {!isReadOnly && (
        <Modal
            isOpen={isModalOpen}
            onClose={closeModal}
            title={'Terminer le ticket'}
            footerActions={
            <>
                <button onClick={closeModal} className="btn btn-secondary py-2 text-sm" disabled={isLoading}>
                Annuler
                </button>
                <button 
                onClick={handleTerminerModalConfirm} 
                className={`btn btn-primary bg-green-600 hover:bg-green-700 py-2 text-sm`} 
                disabled={isLoading}
                >
                {isLoading ? 'Confirmation...' : 'Confirmer'}
                </button>
            </>
            }
        >
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
            Veuillez ajouter des notes de résolution. Celles-ci seront visibles dans l'historique du ticket.
            </p>
            <textarea
            value={modalInput}
            onChange={(e) => setModalInput(e.target.value)}
            placeholder={'Notes de résolution (optionnel)...'}
            rows="5"
            className="form-input w-full text-sm p-3 border-slate-300 dark:border-slate-600 focus:ring-sky-500 focus:border-sky-500"
            autoFocus
            />
        </Modal>
      )}
    </>
  );
};

export default PageTraitementTicket;
