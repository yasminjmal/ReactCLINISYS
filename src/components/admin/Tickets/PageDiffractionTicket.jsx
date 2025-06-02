// src/components/admin/Tickets/PageDiffractionTicket.jsx
import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Send, XCircle, AlertTriangle, FileText } from 'lucide-react';

const SubTicketForm = ({ subTicketData, index, onSubTicketChange, onRemoveSubTicket, parentPriority }) => {
  const handleLocalInputChange = (e) => {
    onSubTicketChange(index, e.target.name, e.target.value);
  };

  return (
    <div className="p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/30 mb-3">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Sous-ticket #{index + 1}</h4>
        <button
            type="button"
            onClick={() => onRemoveSubTicket(index)}
            className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
            title="Supprimer ce sous-ticket"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <div className="space-y-2">
        <div>
          <label htmlFor={`titre-st-${index}`} className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-0.5">Titre *</label>
          <input
            type="text"
            name="titre"
            id={`titre-st-${index}`}
            value={subTicketData.titre}
            onChange={handleLocalInputChange}
            className="form-input w-full text-sm py-1.5"
            placeholder="Titre du sous-ticket"
            required
          />
        </div>
        <div>
          <label htmlFor={`description-st-${index}`} className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-0.5">Description</label>
          <textarea
            name="description"
            id={`description-st-${index}`}
            rows="2"
            value={subTicketData.description}
            onChange={handleLocalInputChange}
            className="form-textarea w-full text-sm py-1.5"
            placeholder="Description (optionnel)"
          />
        </div>
         <p className="text-xs text-slate-500 dark:text-slate-400">Priorité héritée : <span className="font-medium">{parentPriority}</span></p>
      </div>
    </div>
  );
};


const PageDiffractionTicket = ({
    parentTicket,
    onConfirmDiffraction,
    onCancel // Cette fonction sera maintenant appelée pour retourner à 'tickets_affecter_acceptes'
}) => {
  const [numberOfSubTicketsToDisplay, setNumberOfSubTicketsToDisplay] = useState(1);
  const [subTicketForms, setSubTicketForms] = useState([]);
  const [error, setError] = useState('');
  const [globalError, setGlobalError] = useState('');


  useEffect(() => {
    if (!parentTicket) {
      setGlobalError("Aucun ticket parent n'a été fourni pour la diffraction.");
      setSubTicketForms([]);
    } else {
      setGlobalError('');
      if (subTicketForms.length === 0 && numberOfSubTicketsToDisplay > 0) {
        const initialForms = Array.from({ length: numberOfSubTicketsToDisplay }, () => ({
          titre: '',
          description: '',
        }));
        setSubTicketForms(initialForms);
      } else if (subTicketForms.length !== numberOfSubTicketsToDisplay) {
          const currentFormsCount = subTicketForms.length;
          if (numberOfSubTicketsToDisplay > currentFormsCount) {
              const newFormsToAdd = Array.from({ length: numberOfSubTicketsToDisplay - currentFormsCount }, () => ({
                  titre: '', description: '',
              }));
              setSubTicketForms(prev => [...prev, ...newFormsToAdd]);
          } else if (numberOfSubTicketsToDisplay < currentFormsCount) {
              setSubTicketForms(prev => prev.slice(0, numberOfSubTicketsToDisplay));
          }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentTicket, numberOfSubTicketsToDisplay]);

  const handleNumberOfSubTicketsChange = (e) => {
    let count = parseInt(e.target.value, 10);
    if (isNaN(count) || count < 1) {
      count = 1;
    } else if (count > 10) {
      count = 10;
      setError("Le nombre maximum de sous-tickets est de 10 à la fois.");
    } else {
      setError("");
    }
    setNumberOfSubTicketsToDisplay(count);
  };

  const handleSubTicketFormChange = (index, fieldName, value) => {
    setSubTicketForms(prevForms =>
      prevForms.map((form, i) =>
        i === index ? { ...form, [fieldName]: value } : form
      )
    );
    if (fieldName === 'titre' && value.trim() !== '') {
        setError('');
    }
  };

  const handleRemoveSubTicketForm = (indexToRemove) => {
    setSubTicketForms(prevForms => prevForms.filter((_, index) => index !== indexToRemove));
    setNumberOfSubTicketsToDisplay(prevCount => Math.max(1, prevCount - 1));
  };

  const handleAddOneMoreSubTicketForm = () => {
    if (numberOfSubTicketsToDisplay < 10) {
        setNumberOfSubTicketsToDisplay(prev => prev + 1);
    } else {
        setError("Le nombre maximum de sous-tickets est de 10 à la fois.");
    }
  };


  const handleSubmitDiffraction = () => {
    setError('');
    const validSubTicketsData = subTicketForms
        .map(form => ({ titre: form.titre.trim(), description: form.description.trim() }))
        .filter(st => st.titre !== '');

    if (validSubTicketsData.length === 0) {
      setError("Veuillez remplir au moins un sous-ticket avec un titre.");
      return;
    }

    const allFormsHaveTitles = subTicketForms.every(form => form.titre.trim() !== '');
    if (!allFormsHaveTitles) {
        setError("Certains sous-tickets ont un titre vide. Veuillez les compléter ou les supprimer avant de confirmer.");
        return;
    }

    if (onConfirmDiffraction && parentTicket) {
      onConfirmDiffraction(parentTicket.id, validSubTicketsData);
    }
  };

  if (globalError) {
    return (
      <div className="p-6 text-center text-red-600 dark:text-red-400 bg-white dark:bg-slate-800 rounded-lg shadow-md">
        <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
        <p className="text-xl font-semibold">{globalError}</p>
        {/* Le bouton Annuler ici utilisera la prop onCancel fournie par InterfaceAdmin */}
        {onCancel && ( <button onClick={onCancel} className="btn btn-secondary mt-6"> Retour </button> )}
      </div>
    );
  }
  if (!parentTicket) return <div className="p-6 text-center">Chargement du ticket parent...</div>;

  return (
    <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-950 min-h-full">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 p-5 md:p-8 rounded-xl shadow-xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Diffraction du Ticket : <span className="text-sky-600 dark:text-sky-400">{parentTicket.ref}</span>
          </h1>
          <div className="text-sm text-slate-600 dark:text-slate-400 mt-1 flex items-center">
            <FileText size={14} className="mr-1.5 text-slate-400 dark:text-slate-500" />
            Titre parent : {parentTicket.titre}
          </div>
           <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Priorité du parent : <span className="font-medium">{parentTicket.priorite?.charAt(0).toUpperCase() + parentTicket.priorite?.slice(1)}</span>. Les sous-tickets hériteront de cette priorité et auront le statut "Accepté".
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-300 rounded-md flex items-center">
            <AlertTriangle size={18} className="mr-2" /> {error}
          </div>
        )}

        <div className="mb-6 p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <label htmlFor="numberOfSubTicketsToDisplay" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Nombre de sous-tickets à créer :
            </label>
            <input
              type="number"
              id="numberOfSubTicketsToDisplay"
              name="numberOfSubTicketsToDisplay"
              value={numberOfSubTicketsToDisplay}
              onChange={handleNumberOfSubTicketsChange}
              min="1"
              max="10"
              className="form-input w-20 text-sm py-1.5 text-center"
            />
          </div>

          {subTicketForms.map((formData, index) => (
            <SubTicketForm
              key={`st-form-${index}`}
              index={index}
              subTicketData={formData}
              onSubTicketChange={handleSubTicketFormChange}
              onRemoveSubTicket={handleRemoveSubTicketForm}
              parentPriority={parentTicket.priorite?.charAt(0).toUpperCase() + parentTicket.priorite?.slice(1)}
            />
          ))}
           {numberOfSubTicketsToDisplay < 10 && (
             <button
                type="button"
                onClick={handleAddOneMoreSubTicketForm}
                className="btn btn-secondary-outline btn-sm mt-3 group w-full"
            >
                <PlusCircle size={16} className="mr-1.5 transition-transform duration-150 group-hover:rotate-90" />
                Ajouter un autre sous-ticket
            </button>
           )}
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-slate-200 dark:border-slate-700">
          {/* Le bouton Annuler ici utilisera la prop onCancel fournie par InterfaceAdmin, qui a été mise à jour */}
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn btn-secondary-outline group w-full sm:w-auto">
              <XCircle size={18} className="mr-2" /> Annuler
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmitDiffraction}
            disabled={subTicketForms.length === 0 || subTicketForms.some(st => !st.titre.trim())}
            className="btn btn-primary group w-full sm:w-auto disabled:opacity-60"
          >
            <Send size={18} className="mr-2" />
            Confirmer la Diffraction
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageDiffractionTicket;
