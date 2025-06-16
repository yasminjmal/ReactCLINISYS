// src/components/admin/Tickets/TicketTableRow.jsx
import React from 'react';
import { Edit, Trash2, Info, PlusCircle, CheckCircle, XCircle, Clock, AlertTriangle, Package, Calendar, Shield, ChevronsRight, ChevronDown } from 'lucide-react';

// --- Petits composants pour les badges de statut et priorité ---

const PriorityBadge = ({ priority }) => {
  // --- MODIFICATION ICI ---
  // Correction de la clé pour la priorité "Basse"
  const styles = {
    HAUTE: { 
      className: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300', 
      icon: <AlertTriangle size={14} className="mr-1.5" /> 
    },
    MOYENNE: { 
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
      icon: <ChevronsRight size={14} className="mr-1.5" />
    },
    // La clé 'FAIBLE' a été remplacée par 'BASSE' pour correspondre à vos données.
    BASSE: { 
      className: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
      icon: <ChevronDown size={14} className="mr-1.5" />
    },
  };
  const priorityInfo = styles[priority?.toUpperCase()] || { className: 'bg-slate-100', icon: null };
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ${priorityInfo.className}`}>
      {priorityInfo.icon}
      {priority}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const statusInfo = {
    EN_ATTENTE: { text: 'En attente', style: 'text-slate-600 dark:text-slate-300' },
    EN_COURS: { text: 'En cours', style: 'text-orange-600 dark:text-orange-400' },
    ACCEPTE: { text: 'Accepté', style: 'text-green-600 dark:text-green-400' },
    TERMINE: { text: 'Terminé', style: 'text-sky-600 dark:text-sky-400' },
    REFUSE: { text: 'Refusé', style: 'text-red-600 dark:text-red-400' },
  };
  const info = statusInfo[status?.toUpperCase()] || { text: status, style: 'text-slate-500' };
  
  return <span className={`text-xs font-semibold ${info.style}`}>{info.text}</span>;
};

const ActifBadge = ({ actif }) => {
  const isActif = actif === true;
  return (
    <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isActif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      {isActif ? <CheckCircle size={14} className="mr-1" /> : <XCircle size={14} className="mr-1" />}
      {isActif ? 'Actif' : 'Inactif'}
    </div>
  );
};

// --- Composant principal de la ligne du tableau ---

const TicketTableRow = ({ ticket }) => {
  const isTicketActif = true; 

  const clientNom = ticket.idClient?.nomComplet || 'N/A';
  const demandeurNom = ticket.userCreation || 'N/A';
  const moduleNom = ticket.idModule?.nom || 'N/A';
  const employeNom = ticket.idUtilisateur ? `${ticket.idUtilisateur.prenom} ${ticket.idUtilisateur.nom}` : 'N/A';
  const dateCreation = ticket.dateCreation ? new Date(ticket.dateCreation).toLocaleDateString('fr-CA') : 'N/A';

  const renderModuleCell = () => {
    switch (ticket.statue?.toUpperCase()) {
      case 'EN_ATTENTE':
        return <span className="text-slate-400 italic">Vide</span>;
      case 'ACCEPTE':
        return (
          <button className="btn btn-secondary-outline btn-xs p-1">
            <PlusCircle size={16} className="text-slate-500" />
          </button>
        );
      case 'REFUSE':
        return <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-sm striped-bg"></div>;
      case 'EN_COURS':
        return (
          <div className="flex items-center justify-between">
            <span>{moduleNom}</span>
            <div className="flex">
              <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full"><Edit size={14} /></button>
              <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full"><Trash2 size={14} /></button>
            </div>
          </div>
        );
      case 'TERMINE':
        return <span>{moduleNom}</span>;
      default:
        return <span>{moduleNom}</span>;
    }
  };

  return (
    <tr className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
      <td className="px-4 py-3 text-sm">
        <div className="font-semibold text-slate-800 dark:text-slate-100">{clientNom}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400">{demandeurNom}</div>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 break-words max-w-xs">
        {ticket.titre}
      </td>
      <td className="px-4 py-3 text-sm">
        <div className="flex flex-col space-y-1.5 items-start">
          <PriorityBadge priority={ticket.priorite} />
          <StatusBadge status={ticket.statue} />
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
        {renderModuleCell()}
      </td>
      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
        {employeNom}
      </td>
      <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
        {dateCreation}
      </td>
      <td className="px-4 py-3">
        <ActifBadge actif={isTicketActif} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center space-x-1">
          <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full" title="Modifier"><Edit size={16}/></button>
          <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full" title="Supprimer"><Trash2 size={16}/></button>
          <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full" title="Détails"><Info size={16}/></button>
        </div>
      </td>
    </tr>
  );
};

export default TicketTableRow;