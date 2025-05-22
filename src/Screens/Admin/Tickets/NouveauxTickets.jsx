import React, { useState } from 'react';
import { FiFilter, FiChevronDown } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './NouveauxTickets.css'; // Assurez-vous d'importer le fichier CSS pour le styl
import DetailTicket from './DetailTicket'; // Import du composant

const NouveauxTickets = () => {
  const [showFilter, setShowFilter] = useState(false);
  const [sortBy, setSortBy] = useState('priorité');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [affectingTicket, setAffectingTicket] = useState(false);

  

  const navigate = useNavigate();

  // Données temporaires pour les tickets
  const [tickets, setTickets] = useState([
  {
    id: 1,
    référence: 'TICK-2023-001',
    designation: 'Intégration module gestion des rendez-vous',
    collaborateur: 'Marie Lambert',
    date_creation: '10/05/2023',
    date_echance: '25/05/2023',
    priorité: 'haute'
  },
  {
    id: 2,
    référence: 'TICK-2023-002',
    designation: 'Correction bug export PDF',
    collaborateur: 'Thomas Durand',
    date_creation: '12/05/2023',
    date_echance: '30/05/2023',
    priorité: 'moyenne'
  },
  {
    id: 3,
    référence: 'TICK-2023-003',
    designation: 'Mise à jour documentation API',
    collaborateur: 'Sophie Martin',
    date_creation: '14/05/2023',
    date_echance: '28/05/2023',
    priorité: 'faible'
  },
  {
    id: 4,
    référence: 'TICK-2023-004',
    designation: 'Optimisation temps de chargement dashboard',
    collaborateur: 'Alexandre Petit',
    date_creation: '15/05/2023',
    date_echance: '20/05/2023', // Date déjà passée pour tester le visuel
    priorité: 'haute'
  },
  {
    id: 5,
    référence: 'TICK-2023-005',
    designation: 'Ajout filtre avancé dans le reporting',
    collaborateur: 'Élodie Fernandez',
    date_creation: '16/05/2023',
    date_echance: '01/06/2023',
    priorité: 'moyenne'
  },
  {
    id: 6,
    référence: 'TICK-2023-006',
    designation: 'Migration base de données PostgreSQL',
    collaborateur: 'Nicolas Rousseau',
    date_creation: '18/05/2023',
    date_echance: '15/06/2023',
    priorité: 'haute'
  },
  {
    id: 7,
    référence: 'TICK-2023-007',
    designation: 'Revue interface tableau de bord',
    collaborateur: 'Laura Muller',
    date_creation: '20/05/2023',
    date_echance: '10/06/2023',
    priorité: 'faible'
  }
]);

  // Gestion du clic sur un ticket
  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
  };

  return (
    <div className="nouveaux-tickets-container">
        {selectedTicket ? (
        <DetailTicket 
          ticket={selectedTicket}
          onBack={() => setSelectedTicket(null)}
        />
      ) : (
        <>
      {/* Barre de filtres et tri */}
            <div className="filters-sort-container">
                <div className="sort-options">
                <span>Trier par:</span>
                <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sort-select"
                >
                    <option value="priorité">Priorité</option>
                    <option value="date-création">Date Création</option>
                    <option value="date-échéance">Date Échéance</option>
                </select>
                </div>
                
                <div className="filter-container">
                <button 
                    className="filter-button"
                    onClick={() => setShowFilter(!showFilter)}
                >
                    <FiFilter className="filter-icon" />
                    Filtrer
                </button>
                
                {showFilter && (
                    <div className="filter-dropdown">
                    <div className="filter-option">
                        <div className="option-header">Option1 <FiChevronDown /></div>
                        <div className="sub-options">
                        <div className="sub-option">Sous-option1.1</div>
                        <div className="sub-option">Sous-option1.2</div>
                        </div>
                    </div>
                    
                    <div className="filter-option">
                        <div className="option-header">Option2 <FiChevronDown /></div>
                        <div className="sub-options">
                        <div className="sub-option">Sous-option2.1</div>
                        <div className="sub-option">Sous-option2.2</div>
                        </div>
                    </div>
                    
                    <div className="filter-option">
                        <div className="option-header">Option3</div>
                    </div>
                    </div>
                )}
                </div>
            </div>

            {/* Titre */}
            <h2 className="tickets-title">Les nouvelles Tickets</h2>

            {/* Grille de tickets */}
            <div className="tickets-grid">
                {tickets.map((ticket) => (
                <div 
                    key={ticket.id}
                    className="ticket-block"
                    onClick={() => setSelectedTicket(ticket)}
                >
                    <div className="ticket-reference">#{ticket.référence}</div>
                    <div className="ticket-designation">{ticket.designation}</div>
                    
                    <div className="ticket-info">
                    <span>Créé par: {ticket.collaborateur}</span>
                    <span>Créé le: {ticket.date_creation}</span>
                    <span className="ticket-date">Date échéance: 
                        <span style={{ color: 'red' }}> {ticket.date_echance}</span>
                    </span>
                    </div>
                    
                    <div className="ticket-priority">
                    Priorité: {ticket.priorité}
                    <span 
                        className="priority-dot"
                        style={{
                        backgroundColor: 
                            ticket.priorité === 'haute' ? 'red' :
                            ticket.priorité === 'moyenne' ? 'blue' : 'green'
                        }}
                    />
                    </div>
                    
                </div>
                ))}
            </div>
            </>
            )}
    </div>
  );
};

export default NouveauxTickets;