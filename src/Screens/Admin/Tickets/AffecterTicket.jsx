import React, { useState } from 'react';
import './AffecterTicket.css'; // Nous allons créer ce fichier CSS aussi
import { FaArrowLeft } from 'react-icons/fa';

const AffecterTicket = ({ ticket, onBack, onSuccess }) => {
  const [selectedModule, setSelectedModule] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Exemple de données de modules
  const modules = [
    { id: 1, name: "Module Frontend", team: "Équipe React" },
    { id: 2, name: "Module Backend", team: "Équipe Node.js" },
    { id: 3, name: "Module Base de données", team: "Équipe SQL" },
    { id: 4, name: "Module Sécurité", team: "Équipe Cybersecurité" },
    { id: 5, name: "Module DevOps", team: "Équipe Infrastructure" },
  ];

  const handleAffectation = () => {
  setIsLoading(true);
  // Simulation d'une requête API
  setTimeout(() => {
    setIsLoading(false);
    setIsSuccess(true);
    // Supprime ceci si tu veux juste voir le message :
    // setTimeout(onSuccess, 1500);
  }, 1000);
};

  return (
    <div className="affecter-container">
      {!isSuccess && (
        <button onClick={onBack} className="back-button">
            &larr; Retour au ticket
        </button>
        )}
         <div className="retour-icon" onClick={onBack} style={{ cursor: 'pointer', marginBottom: '10px' }}>
        <FaArrowLeft size={20} /> Retour
      </div>
      <div className="affecter-header">
        <h1>Affecter le ticket #{ticket.référence}</h1>
        <h2>{ticket.designation}</h2>
      </div>

      {isSuccess ? (
        <div className="success-message">
          <svg viewBox="0 0 24 24" className="success-icon">
            <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" />
          </svg>
          <p>Ticket affecté avec succès !</p>
        </div>
      ) : (
        <>
          <p className="instruction">Sélectionnez un module pour affectation :</p>
          
          <div className="modules-grid">
            {modules.map(module => (
              <div
                key={module.id}
                className={`module-card ${selectedModule === module.id ? 'selected' : ''}`}
                onClick={() => setSelectedModule(module.id)}
              >
                <h3>{module.name}</h3>
                <p>{module.team}</p>
                {selectedModule === module.id && (
                  <button
                    onClick={handleAffectation}
                    disabled={isLoading}
                    className="confirm-button"
                  >
                    {isLoading ? 'Traitement...' : 'Confirmer'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AffecterTicket;