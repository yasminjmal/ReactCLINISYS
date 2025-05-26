// src/components/admin/Tickets/PageDiffractionTicket.jsx
import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Send, XCircle, AlertTriangle } from 'lucide-react';

const PageDiffractionTicket = ({ 
    parentTicket, // Ticket parent pour lequel on crée des sous-tickets
    onConfirmDiffraction, // Callback pour envoyer les sous-tickets créés à AdminInterface
    onCancel // Callback pour annuler et retourner
}) => {
  const [subTickets, setSubTickets] = useState([]);
  const [currentSubTicket, setCurrentSubTicket] = useState({ titre: '', description: '', priorite: 'moyenne' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!parentTicket) {
      setError("Aucun ticket parent n'a été fourni pour la diffraction.");
    } else {
      setError(''); // Clear error if parentTicket becomes available
    }
  }, [parentTicket]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentSubTicket(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubTicket = () => {
    if (!currentSubTicket.titre.trim()) {
      setError("Le titre du sous-ticket ne peut pas être vide.");
      return;
    }
    setSubTickets(prev => [...prev, { ...currentSubTicket, id: `ST-${parentTicket.id}-${Date.now()}-${prev.length}` }]);
    setCurrentSubTicket({ titre: '', description: '', priorite: 'moyenne' }); // Reset form
    setError('');
  };

  const handleRemoveSubTicket = (indexToRemove) => {
    setSubTickets(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmitDiffraction = () => {
    if (subTickets.length === 0) {
      setError("Veuillez ajouter au moins un sous-ticket avant de confirmer.");
      return;
    }
    if (onConfirmDiffraction && parentTicket) {
      onConfirmDiffraction(parentTicket.id, subTickets);
    }
    setError('');
  };

  if (!parentTicket) {
    return (
      <div className="p-6 text-center text-red-600 dark:text-red-400 bg-white dark:bg-slate-800 rounded-lg shadow-md">
        <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
        <p className="text-xl font-semibold">Erreur : Ticket Parent Manquant</p>
        <p className="text-sm mt-2">Impossible de procéder à la diffraction sans un ticket parent sélectionné.</p>
        {onCancel && (
            <button onClick={onCancel} className="btn btn-secondary mt-6">
                Retour
            </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-950 min-h-full">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 p-5 md:p-8 rounded-xl shadow-xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Diffraction du Ticket : <span className="text-sky-600 dark:text-sky-400">{parentTicket.ref}</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Titre parent : {parentTicket.titre}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-300 rounded-md flex items-center">
            <AlertTriangle size={18} className="mr-2" />
            {error}
          </div>
        )}

        {/* Formulaire pour ajouter un sous-ticket */}
        <div className="mb-6 p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3">Ajouter un Sous-Ticket</h2>
          <div className="space-y-3">
            <div>
              <label htmlFor="titre" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Titre du sous-ticket *</label>
              <input
                type="text"
                name="titre"
                id="titre"
                value={currentSubTicket.titre}
                onChange={handleInputChange}
                className="form-input w-full text-sm"
                placeholder="Ex: Vérifier la configuration du serveur"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <textarea
                name="description"
                id="description"
                rows="3"
                value={currentSubTicket.description}
                onChange={handleInputChange}
                className="form-textarea w-full text-sm"
                placeholder="Détails supplémentaires pour ce sous-ticket..."
              />
            </div>
            <div>
              <label htmlFor="priorite" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priorité</label>
              <select
                name="priorite"
                id="priorite"
                value={currentSubTicket.priorite}
                onChange={handleInputChange}
                className="form-select w-full text-sm"
              >
                <option value="faible">Faible</option>
                <option value="moyenne">Moyenne</option>
                <option value="haute">Haute</option>
              </select>
            </div>
            <button
              type="button"
              onClick={handleAddSubTicket}
              className="btn btn-secondary group w-full sm:w-auto"
            >
              <PlusCircle size={18} className="mr-2 transition-transform duration-150 group-hover:rotate-90" />
              Ajouter ce sous-ticket à la liste
            </button>
          </div>
        </div>

        {/* Liste des sous-tickets à créer */}
        {subTickets.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3">Sous-tickets à créer ({subTickets.length})</h2>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {subTickets.map((st, index) => (
                <div key={st.id || index} className="p-3 border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-700/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{st.titre}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 break-words">{st.description || "Pas de description"}</p>
                      <span className={`mt-1 inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                        st.priorite === 'haute' ? 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400' :
                        st.priorite === 'moyenne' ? 'bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400' :
                        'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400'
                      }`}>
                        Priorité: {st.priorite}
                      </span>
                    </div>
                    <button 
                        onClick={() => handleRemoveSubTicket(index)} 
                        className="p-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"
                        title="Supprimer ce sous-ticket de la liste"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions principales */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-slate-200 dark:border-slate-700">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary-outline group w-full sm:w-auto"
            >
              <XCircle size={18} className="mr-2" />
              Annuler
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmitDiffraction}
            disabled={subTickets.length === 0}
            className="btn btn-primary group w-full sm:w-auto disabled:opacity-50"
          >
            <Send size={18} className="mr-2 transition-transform duration-150 group-hover:translate-x-0.5" />
            Confirmer et Créer les Sous-tickets
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageDiffractionTicket;
