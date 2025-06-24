// src/components/admin/Tickets/TicketDetailPage.jsx
import React, { useState, useEffect } from 'react';
import ticketService from '../../../services/ticketService';
// --- MODIFICATION : Ajout de l'icône "Package" et autres icônes nécessaires ---
import { X, Calendar, User, Tag, Info, Loader, AlertTriangle, ChevronsRight, ChevronDown, CheckCircle, Package, Shield, Clock } from 'lucide-react';

// --- Petits composants pour les badges de statut et priorité ---

const PriorityBadge = ({ priority }) => {
  const styles = {
    HAUTE: { className: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300', icon: <AlertTriangle size={14} className="mr-1.5" /> },
    MOYENNE: { className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300', icon: <ChevronsRight size={14} className="mr-1.5" /> },
    BASSE: { className: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300', icon: <ChevronDown size={14} className="mr-1.5" /> },
  };
  const info = styles[priority?.toUpperCase()] || { className: 'bg-slate-100', icon: null };
  return <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${info.className}`}>{info.icon}{priority}</span>;
};

const StatusBadge = ({ status }) => {
  const statusInfo = {
    EN_ATTENTE: { text: 'En attente', style: 'text-slate-600 dark:text-slate-300 font-medium' },
    EN_COURS: { text: 'En cours', style: 'text-orange-600 dark:text-orange-400 font-medium' },
    ACCEPTE: { text: 'Accepté', style: 'text-green-600 dark:text-green-400 font-medium' },
    TERMINE: { text: 'Terminé', style: 'text-sky-600 dark:text-sky-400 font-medium' },
    REFUSE: { text: 'Refusé', style: 'text-red-600 dark:text-red-400 font-medium' },
  };
  const info = statusInfo[status?.toUpperCase()] || { text: status, style: 'text-slate-500 font-medium' };
  return <span className={`text-sm ${info.style}`}>{info.text}</span>;
};

const DetailItem = ({ icon, label, value }) => (
  <div>
    <dt className="text-xs text-slate-500 dark:text-slate-400 flex items-center mb-1">{icon}{label}</dt>
    <dd className="text-sm font-medium text-slate-800 dark:text-slate-100">{value || <span className="italic text-slate-400">N/A</span>}</dd>
  </div>
);

// --- Composant principal de la page de détails ---

const TicketDetailPage = ({ ticketId, onClose }) => {
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      if (!ticketId) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await ticketService.getTicketById(ticketId);
        console.log(data)
        setTicket(data);
      } catch (err) {
        setError("Impossible de charger les détails du ticket.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTicket();
  }, [ticketId]);

  const formatDate = (dateArray) => {
    if (!dateArray) return null;
    try {
      return new Date(dateArray[0], dateArray[1] - 1, dateArray[2]).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric'
      });
    } catch (e) {
      return "Date invalide";
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-full"><Loader className="animate-spin text-sky-500" size={48} /></div>;
    }
    if (error) {
      return <div className="flex justify-center items-center h-full text-red-500">{error}</div>;
    }
    if (!ticket) {
      return <div className="flex justify-center items-center h-full text-slate-500">Aucun ticket sélectionné.</div>;
    }

    const { titre, description, userCreation, dateCreation, date_echeance, priorite, statue, idClient, idModule, idUtilisateur, actif, childTickets } = ticket;

    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <header className="flex-shrink-0 p-4 border-b dark:border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{titre}</h2>
            <p className="text-xs text-slate-500">Créé par {userCreation} le {formatDate(dateCreation)}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
            <X size={24} />
          </button>
        </header>

        {/* Body */}
        <div className="flex-grow p-6 overflow-y-auto space-y-8">
          {/* Section des détails principaux */}
          <section>
            <h3 className="text-sm font-semibold uppercase text-slate-400 mb-4">Détails</h3>
            <dl className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <DetailItem icon={<User size={14} className="mr-2"/>} label="Client" value={idClient?.nomComplet} />
              <DetailItem icon={<Tag size={14} className="mr-2"/>} label="Priorité" value={<PriorityBadge priority={priorite} />} />
              <DetailItem icon={<Info size={14} className="mr-2"/>} label="Statut" value={<StatusBadge status={statue} />} />
              <DetailItem icon={<Package size={14} className="mr-2"/>} label="Module" value={idModule?.designation} />
              <DetailItem icon={<User size={14} className="mr-2"/>} label="Affecté à" value={idUtilisateur ? `${idUtilisateur.prenom} ${idUtilisateur.nom}` : ''} />
              <DetailItem icon={<Shield size={14} className="mr-2"/>} label="Actif" value={actif ? 'Oui' : 'Non'} />
              <DetailItem icon={<Calendar size={14} className="mr-2"/>} label="Date d'échéance" value={formatDate(date_echeance)} />
            </dl>
          </section>

          {/* Section description */}
          <section>
             <h3 className="text-sm font-semibold uppercase text-slate-400 mb-3">Description</h3>
             <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap bg-slate-50 dark:bg-slate-800/50 p-4 rounded-md">
                {description || "Aucune description fournie."}
             </p>
          </section>

          {/* Section sous-tickets */}
          {childTickets && childTickets.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold uppercase text-slate-400 mb-4">Sous-tickets ({childTickets.length})</h3>
              <div className="overflow-x-auto border dark:border-slate-700 rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Titre</th>
                      <th className="px-4 py-2 text-left font-medium">Priorité</th>
                      <th className="px-4 py-2 text-left font-medium">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-slate-700">
                    {childTickets.map(sub => (
                      <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                        <td className="px-4 py-2">{sub.titre}</td>
                        <td className="px-4 py-2"><PriorityBadge priority={sub.priorite} /></td>
                        <td className="px-4 py-2"><StatusBadge status={sub.statue} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}>
      <div 
        className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out" 
        onClick={(e) => e.stopPropagation()}
        style={{ transform: ticketId ? 'translateX(0)' : 'translateX(100%)' }}
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default TicketDetailPage;
