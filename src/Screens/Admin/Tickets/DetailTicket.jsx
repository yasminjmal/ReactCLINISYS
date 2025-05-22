import React, { useState } from 'react';
import './DetailTicket.css';
import { FaArrowLeft } from 'react-icons/fa';
import AffecterTicket from './AffecterTicket'; // Nous allons créer ce composant

const DetailTicket = ({ ticket, onBack  }) => {
  const [showAffecter, setShowAffecter] = useState(false);

  return (
    <div className="detail-container">
      {!showAffecter ? (
        <>
          <button className="back-button" onClick={onBack}>
        <FaArrowLeft style={{ marginRight: '8px' }} />
        Retour aux tickets
      </button>

          <div className="ticket-header">
            <h1>#{ticket.référence}</h1>
            <h2>{ticket.designation}</h2>
          </div>

          <div className="ticket-details">
            <p><strong>Créé par :</strong> {ticket.collaborateur}</p>
            <p><strong>Date création :</strong> {ticket.date_creation}</p>
            <p className="due-date">
              <strong>Date échéance :</strong> 
              <span style={{ color: 'red' }}> {ticket.date_echance}</span>
            </p>
            
            <div className={`priority-badge ${ticket.priorité.toLowerCase()}`}>
              Priorité: {ticket.priorité}
            </div>
          </div>

          <div className="action-buttons">
            <button 
              onClick={() => setShowAffecter(true)} 
              className="assign-btn"
            >
              Affecter
            </button>
            <button className="split-btn">Diffracter</button>
          </div>
        </>
      ) : (
        <AffecterTicket 
          ticket={ticket} 
          onBack={() => setShowAffecter(false)}
          onSuccess={() => {
            setShowAffecter(false);
            // Tu peux ajouter ici une notification ou un rafraîchissement des données
          }}
        />
      )}
    </div>
  );
};

export default DetailTicket;