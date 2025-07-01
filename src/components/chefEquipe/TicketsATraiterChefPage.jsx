// src/components/chefEquipe/TicketsATraiterChefPage.jsx

import React, { useState, useMemo } from 'react';
import { Search, Info } from 'lucide-react';
// ✅ ÉTAPE 1: IMPORTER LE COMPOSANT TicketRowChef
import TicketRowChef from './TicketRowChef'; // Assurez-vous que le chemin est correct

const TicketsATraiterChefPage = ({ 
    ticketsNonAssignes, 
    equipesDuChef,      
    onAssignerTicketAEmploye, 
    onRefuserTicketParChef 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const ticketsFiltresEtTries = useMemo(() => {
    let resultat = [...(ticketsNonAssignes || [])];
    if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        resultat = resultat.filter(t =>
            (t.ref && t.ref.toLowerCase().includes(lowerSearch)) ||
            (t.titre && t.titre.toLowerCase().includes(lowerSearch)) ||
            (t.idClient && t.idClient.nomComplet.toLowerCase().includes(lowerSearch)) ||
            (t.idModule && t.idModule.designation.toLowerCase().includes(lowerSearch))
        );
    }
    resultat.sort((a,b) => new Date(b.dateCreation) - new Date(a.dateCreation));
    return resultat;
  }, [ticketsNonAssignes, searchTerm]);
  
  const tableHeaderClass = "px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider";

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Tickets à Traiter</h1>
        <div className="relative">
            <Search className="h-5 w-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
            <input 

              type="text" 
              placeholder="Rechercher un ticket..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="form-input pl-10 w-full" 
            />
        </div>
      </div>

      {ticketsFiltresEtTries.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
            <Info size={40} className="mx-auto text-slate-400 mb-3" />
            <p className="text-slate-500 dark:text-slate-400">
                {searchTerm ? "Aucun ticket ne correspond à votre recherche." : "Aucun nouveau ticket à traiter."}
            </p>
        </div>
      ) : (
        <div className="overflow-x-auto shadow-xl rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="min-w-full">
            <thead className="bg-slate-100 dark:bg-slate-700">
              <tr>
                <th scope="col" className={tableHeaderClass}>Réf.</th>
                <th scope="col" className={tableHeaderClass}>Titre / Client</th>
                <th scope="col" className={tableHeaderClass}>Priorité</th>
                <th scope="col" className={tableHeaderClass}>Module</th>
                <th scope="col" className={tableHeaderClass}>statut</th>
                <th scope="col" className={tableHeaderClass}>Demandeur</th>
                <th scope="col" className={tableHeaderClass}>Créé le</th>
                <th scope="col" className={`${tableHeaderClass} text-center`}>Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {ticketsFiltresEtTries.map(ticket => {
                  const equipeDuModule = equipesDuChef.find(eq => eq.id === ticket.idModule?.equipe?.id);
                  // La variable "membresEquipe" est bien définie ici.
                  const membresEquipe = equipeDuModule ? (equipeDuModule.utilisateurs || []).filter(m => m.actif === true) : [];

                  return (
                    // On utilise le composant TicketRowChef importé
                    <TicketRowChef
                      key={ticket.id}
                      ticket={ticket}
                      onAssigner={onAssignerTicketAEmploye}
                      onRefuser={onRefuserTicketParChef}
                      equipeMembres={membresEquipe} // On passe la variable en prop
                    />
                  );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TicketsATraiterChefPage;