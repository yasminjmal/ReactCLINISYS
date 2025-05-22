import React, { useEffect, useState } from 'react';
import { 
  FaTh, 
  FaChartLine, 
  FaMapMarkerAlt, 
  FaBell, 
  FaTable, 
  FaFont, 
  FaCrown,
  FaGlobe,
  FaTicketAlt,
  FaUsers, FaUser, FaThLarge, FaBriefcase,FaUserPlus, FaList,FaChevronDown , FaHome
} from 'react-icons/fa';
import './interface_admin.css';
import logo from '../../assets/logoTRANSPARENT.png';
import TEST from '../../assets/test.png';
import HomeContent from './HomeContent';
import TotalShipmentsDashboard from './TotalShipmentsDashboard';


import NouveauxTickets from './Tickets/NouveauxTickets';
import TicketsEnCours from './Tickets/TicketsEnCours';
import TicketsTermines from './Tickets/TicketsTermines';
import TicketsValides from './Tickets/TicketsValides';
import DetailTicket from './Tickets/DetailTicket';
import util from '../../Service/util';
import authService from '../../Service/authService';



const Admin_Interface = () => {
  const [activeMenu, setActiveMenu] = useState('HOME');
  const [language, setLanguage] = useState('English');
  const [user,setUser]=useState({});
  const [userName, setUserName] = useState(localStorage.getItem('username'));
  const [notifications, setNotifications] = useState([
    'Yasmin ajouté avec succés','Ticket #1234 créé','Ahmed a posté un nouvel avancement'
  ]);
  const [dashboardView, setDashboardView] = useState('ANALYTICS'); // Nouveau state

  useEffect(()=>{
    try {
      email=localStorage.getItem("email")
      const data=  authService.getUtilisateurbyemail(email)
      console.log(email)
    } catch (error) {
      console.error("erreur  while fethcing data")
    }
  },[])
  

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <img src={logo} alt="Logo" className="logo" />
        </div>
        
        <div className="sidebar-menu">
            <div 
            className={`menu-item ${activeMenu === 'HOME' ? 'active' : ''}`}
            onClick={() => setActiveMenu('HOME')}
          >
            <FaHome className="menu-icon" />
            <span>HOME</span>
          </div>
          <div 
            className={`menu-item ${activeMenu === 'DASHBOARD' ? 'active' : ''}`}
            onClick={() => setActiveMenu('DASHBOARD')}
          >
            <FaTh className="menu-icon" />
            <span>DASHBOARDS</span>
          </div>
          
         <div className={`menu-parent ${activeMenu.startsWith('TICKETS') ? 'open' : ''}`}>
                <div 
                    className="menu-header"
                    onClick={() => {
                    setActiveMenu(activeMenu === 'TICKETS' ? 'TICKETS-NOUVEAUX' : 'TICKETS-NOUVEAUX'); // Par défaut, ouvre "Nouveaux tickets"
                    }}
                    >
                    <div className="menu-title">
                    <FaTicketAlt className="menu-icon" />
                    <span>TICKETS</span>
                    <div className="menu-badge">4</div> {/* À mettre à jour dynamiquement */}
                    </div>
                    <FaChevronDown className="menu-arrow" />
                </div>
                <div className="submenu-container">
                    <div 
                    className={`submenu-item ${activeMenu === 'TICKETS-NOUVEAUX' ? 'active' : ''}`}
                    onClick={() => setActiveMenu('TICKETS-NOUVEAUX')}
                    >
                    <div className="circle-indicator"></div>
                    <span>Nouveaux tickets</span>
                    </div>
                    <div 
                    className={`submenu-item ${activeMenu === 'TICKETS-EN-COURS' ? 'active' : ''}`}
                    onClick={() => setActiveMenu('TICKETS-EN-COURS')}
                    >
                    <div className="circle-indicator"></div>
                    <span>Tickets en cours</span>
                    </div>
                    <div 
                    className={`submenu-item ${activeMenu === 'TICKETS-TERMINES' ? 'active' : ''}`}
                    onClick={() => setActiveMenu('TICKETS-TERMINES')}
                    >
                    <div className="circle-indicator"></div>
                    <span>Tickets terminés</span>
                    </div>
                    <div 
                    className={`submenu-item ${activeMenu === 'TICKETS-VALIDES' ? 'active' : ''}`}
                    onClick={() => setActiveMenu('TICKETS-VALIDES')}
                    >
                    <div className="circle-indicator"></div>
                    <span>Tickets validés</span>
                    </div>
                </div>
            </div>
          
          <div className={`menu-parent ${activeMenu.startsWith('EQUIPES') ? 'open' : ''}`}>
            <div 
                className="menu-header"
                onClick={() => setActiveMenu(activeMenu === 'EQUIPES' ? '' : 'EQUIPES')}
            >
                <div className="menu-title">
                <FaUsers className="menu-icon" />
                <span>EQUIPES</span>
                <div className="menu-badge">2</div>
                </div>
                <FaChevronDown className="menu-arrow" />
            </div>

            <div className="submenu-container">
                <div 
                className={`submenu-item ${activeMenu === 'EQUIPES-LISTE' ? 'active' : ''}`}
                onClick={() => setActiveMenu('EQUIPES-LISTE')}
                >
                <div className="circle-indicator"></div>
                <span>Gérer les équipes</span>
                </div>
                
                <div 
                className={`submenu-item ${activeMenu === 'EQUIPES-MEMBRES' ? 'active' : ''}`}
                onClick={() => setActiveMenu('EQUIPES-MEMBRES')}
                >
                <div className="circle-indicator"></div>
                <span>Membres</span>
                </div>
            </div>
            </div>
          
          <div className={`menu-parent ${activeMenu.startsWith('UTILISATEURS') ? 'open' : ''}`}>
            <div 
                className="menu-header"
                onClick={() => setActiveMenu(activeMenu === 'UTILISATEURS' ? '' : 'UTILISATEURS')}
            >
                <div className="menu-title">
                <FaUser className="menu-icon" />
                <span>UTILISATEURS</span>
                <div className="menu-badge">2</div>
                </div>
                <FaChevronDown className="menu-arrow" />
            </div>

            <div className="submenu-container">
                <div 
                className={`submenu-item ${activeMenu === 'UTILISATEURS-LISTE' ? 'active' : ''}`}
                onClick={() => setActiveMenu('UTILISATEURS-LISTE')}
                >
                <div className="circle-indicator"></div>
                <span>Afficher tous les utilisateurs</span>
                </div>
                
                <div 
                className={`submenu-item ${activeMenu === 'UTILISATEURS-AJOUT' ? 'active' : ''}`}
                onClick={() => setActiveMenu('UTILISATEURS-AJOUT')}
                >
                <div className="circle-indicator"></div>
                <span>Ajouter un utilisateur</span>
                </div>
            </div>
          </div>
          
          <div className={`menu-parent ${activeMenu.startsWith('MODULES') ? 'open' : ''}`}>
            <div 
                className="menu-header"
                onClick={() => setActiveMenu(activeMenu === 'MODULES' ? '' : 'MODULES')}
            >
                <div className="menu-title">
                <FaThLarge className="menu-icon" />
                <span>MODULES</span>
                <div className="menu-badge">2</div>
                </div>
                <FaChevronDown className="menu-arrow" />
            </div>

            <div className="submenu-container">
                <div 
                className={`submenu-item ${activeMenu === 'MODULES-LISTE' ? 'active' : ''}`}
                onClick={() => setActiveMenu('MODULES-LISTE')}
                >
                <div className="circle-indicator"></div>
                <span>Modules installés</span>
                </div>
                
                <div 
                className={`submenu-item ${activeMenu === 'MODULES-DISPONIBLES' ? 'active' : ''}`}
                onClick={() => setActiveMenu('MODULES-DISPONIBLES')}
                >
                <div className="circle-indicator"></div>
                <span>Modules disponibles</span>
                </div>
            </div>
            </div>
            <div className={`menu-parent ${activeMenu.startsWith('POSTES') ? 'open' : ''}`}>
            <div 
                className="menu-header"
                onClick={() => setActiveMenu(activeMenu === 'POSTES' ? '' : 'POSTES')}
            >
                <div className="menu-title">
                <FaBriefcase className="menu-icon" />
                <span>POSTES</span>
                <div className="menu-badge">2</div>
                </div>
                <FaChevronDown className="menu-arrow" />
            </div>

            <div className="submenu-container">
                <div 
                className={`submenu-item ${activeMenu === 'POSTES-LISTE' ? 'active' : ''}`}
                onClick={() => setActiveMenu('POSTES-LISTE')}
                >
                <div className="circle-indicator"></div>
                <span>Tous les postes</span>
                </div>
                
                <div 
                className={`submenu-item ${activeMenu === 'POSTES-AFFECTATION' ? 'active' : ''}`}
                onClick={() => setActiveMenu('POSTES-AFFECTATION')}
                >
                <div className="circle-indicator"></div>
                <span>Affectation</span>
                </div>
            </div>
            </div>
          
          
          <div className="menu-item upgrade">
            <FaCrown className="menu-icon" />
            <span>UPGRADE TO PRO</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Navbar */}
        <div className="navbar">
          <div className="navbar-left">
            <div className="language-selector">
              <FaGlobe />
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}>
                <option value="English">English</option>
                <option value="French">Français</option>              </select>
            </div>
          </div>
          <div className="notifications">
              <FaBell className="notification-icon" />
              <div className="notification-count">{notifications.length}</div>
              
              <div className="notification-dropdown">
                {notifications.map((notif, index) => (
                  <div key={index} className="notification-item">
                    {notif}
                  </div>
                ))}
              </div>
            </div>
          
          <div className="navbar-right">
            <div className="user-info">
              <span className="username">{userName}</span>
              <span className="user-role">{util.extractRole( localStorage.getItem("role"))}</span>
            </div>
            <div className='image'>
                {/* <img src={} alt="test" /> */}
            </div>
          </div>
        </div>
        {/* Deuxiéme navbar */}
        {activeMenu === 'DASHBOARD' && (
        <div className="dashboard-navbar">
            <div 
            className={`dashboard-option ${dashboardView === 'AVANCEMENTS' ? 'active' : ''}`}
            onClick={() => setDashboardView('AVANCEMENTS')}
            >
            Avancements
            </div>
            <div 
            className={`dashboard-option ${dashboardView === 'TICKETS' ? 'active' : ''}`}
            onClick={() => setDashboardView('TICKETS')}
            >
            Tickets
            </div>
            <div 
            className={`dashboard-option ${dashboardView === 'EQUIPES' ? 'active' : ''}`}
            onClick={() => setDashboardView('EQUIPES')}
            >
            Equipes
            </div>
            <div 
            className={`dashboard-option ${dashboardView === 'UTILISATEURS' ? 'active' : ''}`}
            onClick={() => setDashboardView('UTILISATEURS')}
            >
            Utilisateurs
            </div>
        </div>
        )}

        {/* Page Content */}
<div className="page-content">
  {activeMenu === 'HOME' ? (
    <HomeContent />
  ) : activeMenu === 'DASHBOARD' ? (
    <>
      {dashboardView === 'AVANCEMENTS' && <TotalShipmentsDashboard />}
      {dashboardView === 'TICKETS' && <h2>Dashboard Tickets</h2>}
      {dashboardView === 'EQUIPES' && <h2>Dashboard Equipes</h2>}
      {dashboardView === 'UTILISATEURS' && <h2>Dashboard Utilisateurs</h2>}
    </>
  ) : activeMenu === 'TICKETS-NOUVEAUX' ? (
    <NouveauxTickets />
  ) : activeMenu === 'TICKETS-EN-COURS' ? (
    <TicketsEnCours />
  ) : activeMenu === 'TICKETS-TERMINES' ? (
    <TicketsTermines />
  ) : activeMenu === 'TICKETS-VALIDES' ? (
    <TicketsValides />
  ) : (
    <h2>{activeMenu}</h2>
  )}
</div>
      </div>
    </div>
  );
};

export default Admin_Interface;