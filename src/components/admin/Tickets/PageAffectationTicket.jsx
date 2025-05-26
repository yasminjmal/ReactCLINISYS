// src/components/admin/Tickets/PageAffectationTicket.jsx
import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom'; // Supprimé

// Styles CSS (peuvent être externalisés)
const styles = `
  .page-affectation-container {
    margin: 20px; padding: 20px; background-color: #fff; border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1); font-family: Arial, sans-serif;
  }
  .dark .page-affectation-container { background-color: #1e293b; /* slate-800 */ color: #e2e8f0; /* slate-200 */ }
  .page-affectation-container h1 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
  .dark .page-affectation-container h1 { color: #f1f5f9; /* slate-100 */ border-bottom-color: #334155; /* slate-700 */ }
  .ticket-details-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; margin-bottom: 20px; }
  .detail-item { background-color: #f9f9f9; padding: 10px; border-radius: 4px; }
  .dark .detail-item { background-color: #334155; /* slate-700 */ color: #cbd5e1; /* slate-300 */ }
  .detail-item strong { display: block; margin-bottom: 5px; color: #555; }
  .dark .detail-item strong { color: #94a3b8; /* slate-400 */ }
  .affectation-section { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
  .dark .affectation-section { border-top-color: #334155; /* slate-700 */ }
  .affectation-section h3 { margin-bottom: 15px; }
  .form-group { margin-bottom: 15px; }
  .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
  .form-group select, .form-group textarea {
    width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;
    background-color: white; /* Default for light mode */ color: #333; /* Default for light mode */
  }
  .dark .form-group select, .dark .form-group textarea { background-color: #273244; border-color: #475569; color: #e2e8f0; }
  .dark .form-group select option { background-color: #273244; color: #e2e8f0; }
  .button-primary { background-color: #007bff; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; font-size: 1em; }
  .button-primary:hover { background-color: #0056b3; }
  .dark .button-primary { background-color: #2563eb; /* blue-600 */ }
  .dark .button-primary:hover { background-color: #1d4ed8; /* blue-700 */ }
  .button-secondary { background-color: #6c757d; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; font-size: 1em; margin-left: 10px; }
  .button-secondary:hover { background-color: #545b62; }
  .dark .button-secondary { background-color: #475569; /* slate-600 */ }
  .dark .button-secondary:hover { background-color: #334155; /* slate-700 */ }
  .loading-message, .error-message { text-align: center; padding: 20px; font-size: 1.2em; }
`;

// Ce composant reçoit 'ticketObject', 'isForSubTicket', 'onConfirmAffectation', 'onCancel' d'AdminInterface
const PageAffectationTicket = ({ 
    ticketObject, 
    isForSubTicket = false, 
    onConfirmAffectation, 
    onCancel,
    availableEquipes = [], // Ajout pour peupler le select d'équipes
    availableTechniciens = [] // Ajout pour peupler le select de techniciens
}) => {
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Changé pour gérer le chargement de la soumission
  const [error, setError] = useState(null); // Pour les erreurs de formulaire ou de chargement initial

  const [equipeAssigne, setEquipeAssigne] = useState('');
  const [technicienAssigne, setTechnicienAssigne] = useState('');
  const [notesAffectation, setNotesAffectation] = useState('');

  useEffect(() => {
    if (ticketObject) {
      setTicket(ticketObject);
      setEquipeAssigne(ticketObject.equipeAssigne || ''); // Pré-remplir si déjà affecté
      setTechnicienAssigne(ticketObject.technicienAssigne || '');
      setNotesAffectation(ticketObject.notesAffectation || '');
      setError(null);
    } else {
      setError("Aucun ticket fourni pour l'affectation.");
      setTicket(null);
    }
  }, [ticketObject]);

  const handleAffecterSubmit = async (e) => {
    e.preventDefault();
    if (!ticket || !onConfirmAffectation) {
        setError("Impossible de soumettre : ticket ou fonction de confirmation manquante.");
        return;
    }
    if (!isForSubTicket && !equipeAssigne) {
        setError("Veuillez sélectionner une équipe pour un ticket parent.");
        return;
    }
    
    setIsLoading(true);
    setError(null); // Réinitialiser les erreurs précédentes
    const affectationData = {
      equipe: equipeAssigne,
      technicien: technicienAssigne,
      notes: notesAffectation,
    };

    try {
        // La fonction onConfirmAffectation (venant d'AdminInterface) gère la logique de mise à jour
        // et le changement de page (activePage).
        await onConfirmAffectation(ticket.id, affectationData, isForSubTicket);
        // Pas besoin de navigate() ici, AdminInterface s'en charge.
    } catch (err) {
        console.error("Erreur lors de la tentative d'affectation:", err);
        setError("Une erreur est survenue lors de l'affectation.");
    } finally {
        setIsLoading(false);
    }
  };

  const nomDemandeurFormatted = ticket?.demandeur
    ? `${ticket.demandeur.prenom || ''} ${ticket.demandeur.nom || ''}`.trim()
    : 'N/A';
  const finalNomDemandeur = (ticket?.demandeur && nomDemandeurFormatted === '') ? 'Demandeur Incomplet' : nomDemandeurFormatted;

  if (!ticket && !error) return <div className="loading-message dark:text-slate-300">Chargement des informations du ticket...</div>;
  if (error && !ticket) return <div className="error-message text-red-500 dark:text-red-400">{error}</div>; // Afficher l'erreur si le ticket n'a pas pu être chargé
  if (!ticket) return null; // Ne rien rendre si le ticket est null et qu'il n'y a pas d'erreur (devrait être couvert par le dessus)


  return (
    <>
      <style>{styles}</style>
      <div className="page-affectation-container">
        <h1>
          {isForSubTicket ? 'Affecter le Sous-Ticket' : 'Détails et Affectation du Ticket'} : <span className="text-sky-600 dark:text-sky-400">{ticket.ref}</span>
        </h1>
        
        {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-700/30 dark:text-red-300" role="alert">{error}</div>}

        <div className="ticket-details-grid">
          <div className="detail-item"><strong>ID:</strong> {ticket.id}</div>
          <div className="detail-item"><strong>Titre:</strong> {ticket.titre}</div>
          <div className="detail-item"><strong>Priorité:</strong> {ticket.priorite}</div>
          <div className="detail-item"><strong>Statut Actuel:</strong> {ticket.statut}</div>
          <div className="detail-item"><strong>Demandeur:</strong> {finalNomDemandeur}</div>
          <div className="detail-item"><strong>Date de Création:</strong> {new Date(ticket.dateCreation).toLocaleString('fr-FR')}</div>
          {isForSubTicket && ticket.parentId && (
            <div className="detail-item"><strong>Ticket Parent ID:</strong> {ticket.parentId}</div>
          )}
        </div>
        {ticket.description && (
          <div className="detail-item mt-4" style={{gridColumn: '1 / -1', marginBottom: '20px'}}>
            <strong>Description:</strong>
            <p className="whitespace-pre-wrap mt-1">{ticket.description}</p>
          </div>
        )}

        <form onSubmit={handleAffecterSubmit} className="affectation-section">
          <h3>Affecter le ticket</h3>
          
          {!isForSubTicket && (
            <div className="form-group">
              <label htmlFor="equipe">Équipe d'intervention :</label>
              <select id="equipe" value={equipeAssigne} onChange={(e) => { setEquipeAssigne(e.target.value); setError(null); }} required={!isForSubTicket}>
                <option value="">Sélectionner une équipe</option>
                {/* Exemple statique, à remplacer par vos données d'équipes disponibles */}
                <option value="eq1">Équipe Alpha (Support N1)</option>
                <option value="eq2">Équipe Bravo (Support N2)</option>
                <option value="reseau">Équipe Réseau</option>
                <option value="systeme">Équipe Système</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="technicien">Technicien à assigner (optionnel) :</label>
            <select id="technicien" value={technicienAssigne} onChange={(e) => setTechnicienAssigne(e.target.value)}>
              <option value="">Non assigné / Sélectionner</option>
              {/* Exemple statique, à remplacer par vos données de techniciens disponibles */}
              <option value="user001">Yasmin Jmal</option>
              <option value="chef001">Amine Bahri</option>
              <option value="tech_autre">Autre Technicien</option>
            </select>
          </div>

          {!isForSubTicket && (
            <div className="form-group">
              <label htmlFor="notes">Notes d'affectation (optionnel) :</label>
              <textarea 
                id="notes" 
                rows="3" 
                value={notesAffectation} 
                onChange={(e) => setNotesAffectation(e.target.value)}
                placeholder="Instructions spécifiques, contexte pour l'équipe/technicien..."
              ></textarea>
            </div>
          )}
          
          {isForSubTicket && (
             <p className="text-sm italic dark:text-slate-400 mb-4"><em>L'affectation d'un sous-ticket est généralement liée à son ticket parent. Vous pouvez spécifier un technicien différent si nécessaire.</em></p>
          )}

          <div className="mt-6 flex items-center space-x-3">
            <button type="submit" className="button-primary" disabled={isLoading}>
              {isLoading ? 'Affectation en cours...' : `Confirmer l'Affectation`}
            </button>
            {onCancel && (
              <button type="button" className="button-secondary" onClick={onCancel} disabled={isLoading}>
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  );
};

export default PageAffectationTicket;
