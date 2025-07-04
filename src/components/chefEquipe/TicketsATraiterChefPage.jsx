// src/components/chefEquipe/TicketsATraiterChefPage.jsx
import React, { useState, useMemo } from 'react';
import { Search, Info } from 'lucide-react';
import TicketRowChef from './TicketRowChef';

const TicketsATraiterChefPage = ({ ticketsNonAssignes, equipesDuChef, onAssignerTicketAEmploye, onRefuserTicketParChef }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTickets = useMemo(() => {
    let resultat = [...(ticketsNonAssignes || [])];
    if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        resultat = resultat.filter(t =>
            (t.ref && t.ref.toLowerCase().includes(lowerSearch)) ||
            (t.titre && t.titre.toLowerCase().includes(lowerSearch)) ||
            (t.idClient?.nomComplet.toLowerCase().includes(lowerSearch))
        );
    }
    resultat.sort((a,b) => new Date(b.dateCreation) - new Date(a.dateCreation));
    return resultat;
  }, [ticketsNonAssignes, searchTerm]);
  
  const tableHeaderClass = "p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider";

  return (
    <div>
        <header className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold">Tickets à Traiter</h1>
                <p className="text-slate-500 mt-1">Assignez ou refusez les nouveaux tickets.</p>
            </div>
            <div className="relative w-full sm:w-72">
                <Search className="h-5 w-5 text-slate-400 absolute inset-y-0 left-4 flex items-center" />
                <input type="text" placeholder="Rechercher un ticket..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input w-full pl-11" />
            </div>
        </header>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
             <div className="overflow-x-auto">
                {filteredTickets.length === 0 ? (
                    <div className="text-center py-16">
                        <Info size={48} className="mx-auto text-slate-400 mb-4" />
                        <p className="text-slate-500">{searchTerm ? "Aucun ticket trouvé." : "Aucun nouveau ticket."}</p>
                    </div>
                ) : (
                    <table className="min-w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className={tableHeaderClass}>Client / Réf.</th>
                                <th className={tableHeaderClass}>Demandeur</th>
                                <th className={tableHeaderClass}>Titre</th>
                                <th className={tableHeaderClass}>Module</th>
                                <th className={tableHeaderClass}>Affecté à</th>
                                <th className={tableHeaderClass}>Créé le</th>
                                <th className={tableHeaderClass}>Priorité</th>
                                <th className={tableHeaderClass}>Statut</th>
                                <th className={`${tableHeaderClass} text-center`}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                        {filteredTickets.map(ticket => {
                            const equipeDuModule = equipesDuChef.find(eq => eq.id === ticket.idModule?.equipe?.id);
                            const membresEquipe = equipeDuModule ? (equipeDuModule.utilisateurs || []).filter(m => m.actif === true) : [];
                            return (
                                <TicketRowChef
                                    key={ticket.id}
                                    ticket={ticket}
                                    equipeMembres={membresEquipe}
                                    actions="assign"
                                    onAssigner={onAssignerTicketAEmploye}
                                    onRefuser={onRefuserTicketParChef}
                                />
                            );
                        })}
                        </tbody>
                    </table>
                )}
             </div>
        </div>
    </div>
  );
};

export default TicketsATraiterChefPage;