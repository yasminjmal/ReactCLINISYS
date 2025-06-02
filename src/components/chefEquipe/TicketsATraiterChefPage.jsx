// src/components/chefEquipe/TicketsATraiterChefPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Filter, Search, ArrowUpDown, ChevronDown, ChevronUp, UserPlus, XCircle, Info, Package, CalendarDays, AlertTriangle, CheckCircle, Clock, Users as UsersIcon, User as UserIcon, Tag as TagIcon, FileText } from 'lucide-react';

// Données mockées pour les employés (pour la sélection lors de l'assignation)
const mockAllUsers = [
    { id: 'user001', prenom: 'Yasmin', nom: 'Jmal', poste: 'Développeur Front', equipeId: 'eq1', profileImage: 'https://placehold.co/100x100/E0E7FF/4F46E5?text=YJ' },
    { id: 'user002', prenom: 'Karim', nom: 'Bello', poste: 'Développeur Back', equipeId: 'eq1', profileImage: 'https://placehold.co/100x100/DBEAFE/1D4ED8?text=KB' },
    { id: 'user005', prenom: 'Sophie', nom: 'Durand', poste: 'Testeur QA', equipeId: 'eq1', profileImage: 'https://placehold.co/100x100/FEF3C7/D97706?text=SD' },
    { id: 'user003', prenom: 'Ali', nom: 'Ben Salah', poste: 'Spécialiste Support Applicatif', equipeId: 'eq3', profileImage: 'https://placehold.co/100x100/D1FAE5/059669?text=AB' },
    { id: 'user006', prenom: 'Linda', nom: 'Martin', poste: 'Développeur Fullstack', equipeId: 'eq3', profileImage: 'https://placehold.co/100x100/FCE7F3/DB2777?text=LM' },
    { id: 'user007', prenom: 'Marc', nom: 'Dupont', poste: 'Technicien Support N1', equipeId: 'eq4', profileImage: 'https://placehold.co/100x100/E0E7FF/4F46E5?text=MD' },
];


const TicketRowChef = ({ ticket, onAssigner, onRefuser, equipeMembres }) => {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEmployeId, setSelectedEmployeId] = useState('');
  const [showRefusModal, setShowRefusModal] = useState(false);
  const [motifRefus, setMotifRefus] = useState('');

  const getPriorityStyling = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'haute': return { badge: 'bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-300', icon: <AlertTriangle size={12} className="text-red-500 mr-1" /> };
      case 'moyenne': return { badge: 'bg-sky-100 text-sky-700 dark:bg-sky-700/20 dark:text-sky-300', icon: <AlertTriangle size={12} className="text-sky-500 mr-1" /> };
      case 'faible': return { badge: 'bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-300', icon: <CheckCircle size={12} className="text-green-500 mr-1" /> };
      default: return { badge: 'bg-slate-100 text-slate-700 dark:bg-slate-700/20 dark:text-slate-300', icon: null };
    }
  };
  const priorityStyle = getPriorityStyling(ticket.priorite);
  const dateCreationFormatted = ticket.dateCreation ? new Date(ticket.dateCreation).toLocaleDateString('fr-CA') : 'N/A';
  const demandeurNom = ticket.demandeur ? `${ticket.demandeur.prenom || ''} ${ticket.demandeur.nom || ''}`.trim() : 'N/A';


  const handleAssignSubmit = () => {
    if (!selectedEmployeId) {
      alert("Veuillez sélectionner un employé."); 
      return;
    }
    const employeSelectionne = equipeMembres.find(m => m.id === selectedEmployeId);
    onAssigner(ticket.id, employeSelectionne);
    setShowAssignModal(false);
    setSelectedEmployeId('');
  };

  const handleRefusSubmit = () => {
    if (!motifRefus.trim()) {
      alert("Veuillez entrer un motif de refus.");
      return;
    }
    onRefuser(ticket.id, motifRefus);
    setShowRefusModal(false);
    setMotifRefus('');
  };
  
  const cellClass = "px-3 py-3.5 text-sm text-slate-700 dark:text-slate-200 align-middle border-b border-r border-slate-200 dark:border-slate-700";
  const fixedWidthClass = "whitespace-nowrap";
  const wrappingCellClass = "break-words";

  return (
    <>
      <tr className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors duration-150">
        <td className={`${cellClass} ${fixedWidthClass} w-[8%]`}>{ticket.ref}</td>
        <td className={`${cellClass} ${wrappingCellClass} w-[22%]`}>
            <p className="font-semibold text-slate-800 dark:text-slate-100">{ticket.titre}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Client: {ticket.client}</p>
        </td>
        <td className={`${cellClass} ${fixedWidthClass} w-[12%]`}>
            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${priorityStyle.badge}`}>
              {priorityStyle.icon}
              {ticket.priorite ? ticket.priorite.charAt(0).toUpperCase() + ticket.priorite.slice(1) : 'N/A'}
            </span>
        </td>
        <td className={`${cellClass} ${wrappingCellClass} w-[18%]`}>
            {ticket.moduleAssigne ? (
                <div className="flex items-center">
                    <Package size={16} className="mr-2 text-indigo-500 dark:text-indigo-400 flex-shrink-0"/>
                    <span className="text-xs">{ticket.moduleAssigne.nom}</span>
                </div>
            ) : (
                <span className="text-xs italic text-slate-400 dark:text-slate-500">Non spécifié</span>
            )}
        </td>
        <td className={`${cellClass} ${wrappingCellClass} w-[15%]`}>
            <div className="flex items-center">
                <UserIcon size={16} className="mr-2 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                <span className="text-xs">{demandeurNom}</span>
            </div>
        </td>
        <td className={`${cellClass} ${fixedWidthClass} w-[10%]`}>{dateCreationFormatted}</td>
        <td className={`${cellClass} ${fixedWidthClass} w-[15%] text-center`}>
          <div className="flex items-center justify-center space-x-1.5">
            {/* Bouton Assigner avec texte */}
            <button
              onClick={() => setShowAssignModal(true)}
              className="btn btn-primary-outline btn-xs group flex items-center" // Changement de classe
              title="Assigner à un employé"
            >
              <UserPlus size={14} className="mr-1.5 group-hover:scale-110" /> {/* Ajustement marge */}
              <span>Assigner</span>
            </button>
            {/* Bouton Refuser avec texte */}
            <button
              onClick={() => setShowRefusModal(true)}
              className="btn btn-danger-outline btn-xs group flex items-center" // Changement de classe
              title="Refuser le ticket"
            >
              <XCircle size={14} className="mr-1.5 group-hover:rotate-12" /> {/* Ajustement marge */}
              <span>Refuser</span>
            </button>
          </div>
        </td>
      </tr>

      {/* Modal d'assignation améliorée */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-in-out scale-100">
            <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Assigner Ticket: <span className="text-sky-600 dark:text-sky-400">{ticket.ref}</span></h3>
                <button onClick={() => setShowAssignModal(false)} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400">
                    <XCircle size={22}/>
                </button>
            </div>
            <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-0.5">Titre: {ticket.titre}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Module: {ticket.moduleAssigne?.nom}</p>
            </div>
            
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Sélectionner un employé de l'équipe :</p>
            {equipeMembres && equipeMembres.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto p-1 custom-scrollbar">
                    {equipeMembres.map(membre => (
                        <button
                            key={membre.id}
                            onClick={() => setSelectedEmployeId(membre.id)}
                            className={`p-3 border rounded-lg text-left transition-all duration-200 flex items-center space-x-3 w-full
                                        ${selectedEmployeId === membre.id
                                            ? 'border-sky-500 bg-sky-50 dark:bg-sky-700/40 ring-2 ring-sky-500 shadow-md'
                                            : 'border-slate-300 dark:border-slate-600 hover:border-sky-400 dark:hover:border-sky-500 hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}
                        >
                            <img 
                                src={membre.profileImage || `https://placehold.co/60x60/E2E8F0/475569?text=${membre.prenom?.charAt(0)}${membre.nom?.charAt(0)}`} 
                                alt="" 
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                onError={(e) => { e.target.src = `https://placehold.co/60x60/CBD5E1/475569?text=??`; }}
                            />
                            <div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{membre.prenom} {membre.nom}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{membre.poste}</p>
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 italic py-4 text-center">Aucun employé disponible dans l'équipe associée à ce module.</p>
            )}

            <div className="flex justify-end space-x-3 mt-6 pt-5 border-t border-slate-200 dark:border-slate-700">
              <button onClick={() => setShowAssignModal(false)} className="btn btn-secondary-outline px-5 py-2 text-sm">Annuler</button>
              <button onClick={handleAssignSubmit} className="btn btn-primary px-5 py-2 text-sm" disabled={!selectedEmployeId}>Confirmer l'Assignation</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de refus */}
      {showRefusModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-md">
             <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Refuser Ticket: <span className="text-red-600 dark:text-red-400">{ticket.ref}</span></h3>
                <button onClick={() => setShowRefusModal(false)} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400">
                    <XCircle size={22}/>
                </button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">Titre: {ticket.titre}</p>
            <label htmlFor={`motifRefus-${ticket.id}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Motif du refus * :</label>
            <textarea
              id={`motifRefus-${ticket.id}`}
              value={motifRefus}
              onChange={(e) => setMotifRefus(e.target.value)}
              className="form-textarea w-full h-28 text-sm mb-4"
              placeholder="Expliquez pourquoi ce ticket est refusé..."
            />
            {motifRefus.trim() === '' && <p className="text-xs text-red-500 mb-3">Le motif est requis pour refuser un ticket.</p>}
            <div className="flex justify-end space-x-3 mt-2 pt-5 border-t border-slate-200 dark:border-slate-700">
              <button onClick={() => setShowRefusModal(false)} className="btn btn-secondary-outline px-5 py-2 text-sm">Annuler</button>
              <button onClick={handleRefusSubmit} className="btn btn-danger px-5 py-2 text-sm" disabled={!motifRefus.trim()}>Confirmer le Refus</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


const TicketsATraiterChefPage = ({ 
    ticketsNonAssignes, 
    equipesDuChef,      
    onAssignerTicketAEmploye, 
    onRefuserTicketParChef 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({ priorite: [], client: [] }); // Placeholder pour filtres
  const [activeSort, setActiveSort] = useState({ field: 'dateCreation', order: 'desc' });
  const [isFilterOpen, setIsFilterOpen] = useState(false); // Pour le dropdown des filtres

  const ticketsFiltresEtTries = useMemo(() => {
    let resultat = [...(ticketsNonAssignes || [])];
    if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        resultat = resultat.filter(t =>
            t.ref.toLowerCase().includes(lowerSearch) ||
            t.titre.toLowerCase().includes(lowerSearch) ||
            t.client.toLowerCase().includes(lowerSearch) ||
            (t.moduleAssigne && t.moduleAssigne.nom.toLowerCase().includes(lowerSearch))
        );
    }
    // Logique de filtre et de tri (peut être étendue)
    if (activeSort.field) {
        resultat.sort((a, b) => {
            const valA = a[activeSort.field];
            const valB = b[activeSort.field];
            let comp = 0;
            if (valA > valB) comp = 1;
            else if (valA < valB) comp = -1;
            return activeSort.order === 'asc' ? comp : comp * -1;
        });
    }
    return resultat;
  }, [ticketsNonAssignes, searchTerm, activeSort]);

  const getMembresEquipePourModule = (moduleId) => {
    if (!equipesDuChef || !moduleId) return [];
    for (const equipe of equipesDuChef) {
        if (equipe.modulesAssocies && equipe.modulesAssocies.some(m => m.id === moduleId)) {
            // Retourner les membres de cette équipe, en s'assurant qu'ils existent
            return equipe.membres ? equipe.membres.filter(m => m.statut === 'Actif') : []; // Filtrer pour n'afficher que les actifs pour l'assignation
        }
    }
    return [];
  };
  
  const tableHeaderClass = "px-3 py-3.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b-2 border-slate-300 dark:border-slate-600";

  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-100 dark:bg-slate-950 min-h-full">
      <div className="bg-white dark:bg-slate-800 p-4 md:p-5 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-5">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Tickets à Traiter</h1>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0 sm:w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                type="text"
                placeholder="Rechercher un ticket..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input-icon w-full py-2.5 text-sm pl-10"
                />
            </div>
             {/* Bouton Filtre (fonctionnalité à implémenter si besoin) */}
            {/* <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="btn btn-secondary-outline">
                <Filter size={16} className="mr-2"/> Filtrer {isFilterOpen ? <ChevronUp size={16} className="ml-1"/> : <ChevronDown size={16} className="ml-1"/>}
            </button> */}
          </div>
        </div>
        {/* Zone de filtres (à implémenter si besoin) */}
        {/* {isFilterOpen && ( <div className="p-4 border-t border-slate-200 dark:border-slate-700"> ... Filtres ... </div> )} */}
      </div>

      {ticketsFiltresEtTries.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
            <FileText size={56} className="mx-auto text-slate-400 dark:text-slate-500 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-1">
                {searchTerm ? "Aucun ticket ne correspond à votre recherche" : "Aucun nouveau ticket à traiter"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
                {searchTerm ? "Essayez d'ajuster vos termes de recherche." : "Revenez plus tard ou vérifiez les affectations de modules."}
            </p>
        </div>
      ) : (
        <div className="overflow-x-auto shadow-xl rounded-xl border border-slate-300 dark:border-slate-700">
          <table className="min-w-full">
            <thead className="bg-slate-200 dark:bg-slate-700">
              <tr>
                <th scope="col" className={`${tableHeaderClass} w-[8%]`}> <TagIcon size={14} className="inline-block mr-1.5 align-text-bottom"/>Réf.</th>
                <th scope="col" className={`${tableHeaderClass} w-[22%]`}> <Info size={14} className="inline-block mr-1.5 align-text-bottom"/>Titre / Client</th>
                <th scope="col" className={`${tableHeaderClass} w-[12%]`}> <AlertTriangle size={14} className="inline-block mr-1.5 align-text-bottom"/>Priorité</th>
                <th scope="col" className={`${tableHeaderClass} w-[18%]`}> <Package size={14} className="inline-block mr-1.5 align-text-bottom"/>Module Assigné</th>
                <th scope="col" className={`${tableHeaderClass} w-[15%]`}> <UserIcon size={14} className="inline-block mr-1.5 align-text-bottom"/>Demandeur</th>
                <th scope="col" className={`${tableHeaderClass} w-[10%]`}> <CalendarDays size={14} className="inline-block mr-1.5 align-text-bottom"/>Créé le</th>
                <th scope="col" className={`${tableHeaderClass} w-[15%] text-center`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {ticketsFiltresEtTries.map(ticket => (
                <TicketRowChef
                  key={ticket.id}
                  ticket={ticket}
                  onAssigner={onAssignerTicketAEmploye}
                  onRefuser={onRefuserTicketParChef}
                  equipeMembres={getMembresEquipePourModule(ticket.moduleAssigne?.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TicketsATraiterChefPage;
