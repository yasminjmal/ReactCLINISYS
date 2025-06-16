// // src/components/admin/Tickets/ListeTicketsAcceptes.jsx
// import React, { useState, useEffect } from 'react';
// import TicketAccepteRow from './TicketAccepteRow'; // Assurez-vous que le chemin est correct
// // import { fetchTicketsAcceptesAPI } from '../../../services/apiService'; // Exemple d'appel API

// // Styles CSS (peuvent être dans un fichier CSS séparé)
// const styles = `
//   .tickets-table-container {
//     margin: 20px;
//     font-family: Arial, sans-serif;
//   }
//   .tickets-table {
//     width: 100%;
//     border-collapse: collapse;
//     box-shadow: 0 2px 15px rgba(0,0,0,0.1);
//     background-color: white;
//   }
//   .tickets-table th, .tickets-table td {
//     border: 1px solid #ddd;
//     padding: 10px 12px;
//     text-align: left;
//   }
//   .tickets-table th {
//     background-color: #f2f6fc;
//     color: #333;
//     font-weight: bold;
//   }
//   .tickets-table tr:nth-child(even) .ticket-row:not(.sub-ticket-row) {
//     background-color: #f9f9f9;
//   }
//   .tickets-table tr:hover .ticket-row:not(.sub-ticket-row) {
//     background-color: #f1f1f1;
//   }
//   .ticket-row.sub-ticket-row td {
//     background-color: #e9eff7; /* Couleur de fond pour distinguer les sous-tickets */
//   }
//   .ticket-row.sub-ticket-row:hover td {
//     background-color: #dce5f0;
//   }
//   .expand-button {
//     margin-right: 5px;
//   }
//   .icon-button {
//     background: none;
//     border: none;
//     cursor: pointer;
//     padding: 5px;
//     font-size: 1.1em;
//     color: #007bff;
//   }
//   .icon-button:hover {
//     color: #0056b3;
//   }
//   .actions-column {
//     text-align: center;
//   }
//   .loading-message, .error-message {
//     text-align: center;
//     padding: 20px;
//     font-size: 1.2em;
//   }
// `;

// // Données mockées pour l'exemple (simule un appel API)
// const mockTicketsData = [
//   {
//     id: 'T001', titre: 'Problème imprimante bureau A', priorite: 'Haute', statut: 'Accepté', demandeur: 'Alice Dupont', dateCreation: '2024-05-20T10:00:00Z',
//     subTickets: [
//       { id: 'ST001-A', titre: 'Vérifier niveau de toner', priorite: 'Haute', statut: 'Ouvert', demandeur: 'Alice Dupont', dateCreation: '2024-05-20T10:05:00Z', subTickets: [] },
//       { id: 'ST001-B', titre: 'Contrôler connexion réseau imprimante', priorite: 'Moyenne', statut: 'Ouvert', demandeur: 'Alice Dupont', dateCreation: '2024-05-20T10:06:00Z', subTickets: [] },
//     ]
//   },
//   {
//     id: 'T002', titre: 'Accès impossible au logiciel CRM', priorite: 'Moyenne', statut: 'Accepté', demandeur: 'Bob Martin', dateCreation: '2024-05-21T11:30:00Z',
//     subTickets: []
//   },
//   {
//     id: 'T003', titre: 'Demande de nouveau matériel (écran)', priorite: 'Basse', statut: 'Accepté', demandeur: 'Carole Lima', dateCreation: '2024-05-22T14:15:00Z',
//     subTickets: [
//         { id: 'ST003-A', titre: 'Valider budget pour écran', priorite: 'Basse', statut: 'Ouvert', demandeur: 'Carole Lima', dateCreation: '2024-05-22T14:20:00Z', subTickets: [] },
//     ]
//   },
// ];

// const ListeTicketsAcceptes = () => {
//   const [tickets, setTickets] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const loadTickets = async () => {
//       try {
//         setLoading(true);
//         // Remplacer par votre appel API réel
//         // const data = await fetchTicketsAcceptesAPI(); 
//         // setTickets(data);
        
//         // Simulation d'un délai API avec les données mockées
//         setTimeout(() => {
//           setTickets(mockTicketsData);
//           setLoading(false);
//         }, 1000);
//         setError(null);
//       } catch (err) {
//         console.error("Erreur lors du chargement des tickets:", err);
//         setError('Erreur lors du chargement des tickets. Veuillez réessayer.');
//         setLoading(false);
//       }
//     };
//     loadTickets();
//   }, []);

//   if (loading) return <div className="loading-message">Chargement des tickets...</div>;
//   if (error) return <div className="error-message">{error}</div>;
//   if (!tickets.length) return <div className="loading-message">Aucun ticket accepté à afficher.</div>;

//   return (
//     <>
//       <style>{styles}</style>
//       <div className="tickets-table-container">
//         <h2>Tickets Acceptés en attente d'affectation</h2>
//         <table className="tickets-table">
//           <thead>
//             <tr>
//               <th style={{width: '5%'}}></th> {/* Colonne pour l'icône d'expansion et indicateur */}
//               <th style={{width: '10%'}}>ID</th>
//               <th style={{width: '30%'}}>Titre</th>
//               <th style={{width: '10%'}}>Priorité</th>
//               <th style={{width: '10%'}}>Statut</th>
//               <th style={{width: '15%'}}>Demandeur</th>
//               <th style={{width: '10%'}}>Créé le</th>
//               <th style={{width: '10%'}} className="actions-column">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {tickets.map(ticket => (
//               <TicketAccepteRow key={ticket.id} ticket={ticket} isSubTicket={false} depth={0} />
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </>
//   );
// };

// export default ListeTicketsAcceptes;
