// src/components/chefEquipe/TicketsRefuse.jsx
import React from 'react';
import { Info } from 'lucide-react';
import TicketRowChef from './TicketRowChef';

const TicketsRefuse = ({ ticketRefuse }) => {
  const tableHeaderClass = "p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider";

  return (
    <div>
        <header className="mb-8">
            <h1 className="text-3xl font-bold">Tickets Refusés</h1>
            <p className="text-slate-500 mt-1">Liste des tickets qui ont été refusés.</p>
        </header>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                {!ticketRefuse || ticketRefuse.length === 0 ? (
                    <div className="text-center py-16">
                        <Info size={48} className="mx-auto text-slate-400 mb-4" />
                        <p className="text-slate-500">Aucun ticket refusé à afficher.</p>
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
                            {ticketRefuse.map((ticket) => (
                                <TicketRowChef
                                    key={ticket.id}
                                    ticket={ticket}
                                    actions="none"
                                />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    </div>
  );
};

export default TicketsRefuse;