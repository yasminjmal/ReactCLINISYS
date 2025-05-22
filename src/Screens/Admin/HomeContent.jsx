import React, { useState, useRef, useEffect, use } from 'react';
import './HomeContent.css';
import Ibtissem from '../../assets/Ibtissem.jpg';
import Feryel from '../../assets/Feryel.png';
import Amine from '../../assets/Amine.jpg';
import Mohamed from '../../assets/Mohamed.png';
import Adel from '../../assets/Adel.png';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import TeamCard from './TeamCard';
import decodeToken from '../../Service/decodeToken';
import util from '../../Service/util';
import { useNavigate } from 'react-router-dom';


const HomeContent = () => {
  const [period, setPeriod] = useState('7jours');
  const teamsContainerRef = useRef(null);
  const navigate = useNavigate();
  const [scrollState, setScrollState] = useState({
    position: 0,
    canScrollLeft: false,
    canScrollRight: true,
  });

useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    navigate("/");
  }
  const data = decodeToken(token);
  console.log("Decoded token:", data);
  localStorage.setItem("email",data.sub);
  localStorage.setItem("username",util.extractNameFromEmail(data.sub));
  localStorage.setItem("role",data.roles[0].authority);
}, []);
  // Vérifie l'état du scroll horizontal (gauche/droite possible)
  const checkScroll = () => {
    const container = teamsContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setScrollState({
        position: scrollLeft,
        canScrollLeft: scrollLeft > 0,
        canScrollRight: scrollLeft + clientWidth < scrollWidth,
      });
    }
  };

  // Défilement horizontal des équipes
  const scrollTeams = (direction) => {
    const scrollAmount = 300;
    if (teamsContainerRef.current) {
      teamsContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Ajout du listener de scroll + vérification initiale
  useEffect(() => {
    const container = teamsContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      checkScroll(); // état initial
      return () => container.removeEventListener('scroll', checkScroll);
    }
  }, []);

  // Données des tickets
  const ticketsData = {
    total: 124,
    stats: [
      { label: 'À faire', value: 32, color: '#ffd6a5', percent: 26 },
      { label: 'En cours', value: 45, color: '#a0c4ff', percent: 36 },
      { label: 'Terminé', value: 47, color: '#a8e6cf', percent: 38 },
    ],
  };

  // Données des blocs de droite
  const rightBlocks = [
    { title: "Tickets ouverts", value: "87", description: "+12% vs période précédente" },
    { title: "Temps moyen", value: "3.2j", description: "Durée de résolution" },
    { title: "Satisfaction", value: "84%", description: "Score NPS" },
    { title: "Réouverture", value: "8%", description: "Taux de réouverture" },
  ];

  // Données des équipes
  const teamsData = [
    {
      name: "Équipe Développement",
      leader: { name: "Ibtissem Fakhfekh", image: Ibtissem },
      progress: 78,
    },
    {
      name: "Équipe Design",
      leader: { name: "Feryel Ayedi", image: Feryel },
      progress: 65,
    },
    {
      name: "Équipe Marketing",
      leader: { name: "Amine Bahri", image: Amine },
      progress: 82,
    },
    {
      name: "Équipe Finance",
      leader: { name: "Mohamed Tmar", image: Mohamed },
      progress: 51,
    },
    {
      name: "Équipe Sécurité",
      leader: { name: "Adel Sellami", image: Adel },
      progress: 91,
    },
  ];

  return (
    <div className="home-container">
      {/* Choix de période */}
      <div className="period-options">
        {['7jours', 'mois', 'annee'].map((item) => (
          <button
            key={item}
            className={`period-btn ${period === item ? 'active' : ''}`}
            onClick={() => setPeriod(item)}
          >
            {item === '7jours' && 'Derniers 7 jours'}
            {item === 'mois' && 'Dernier mois'}
            {item === 'annee' && 'Dernière année'}
          </button>
        ))}
      </div>

      {/* Contenu principal : section gauche et droite */}
      <div className="dashboard-content">
        {/* Gauche : cercle des tickets */}
        <div className="tickets-section">
          <div
            className="tickets-circle"
            style={{
              '--todo-percent': `${ticketsData.stats[0].percent}%`,
              '--inprogress-percent': `${ticketsData.stats[0].percent + ticketsData.stats[1].percent}%`,
              '--todo-color': ticketsData.stats[0].color,
              '--inprogress-color': ticketsData.stats[1].color,
              '--done-color': ticketsData.stats[2].color,
            }}
          >
            <div className="circle-center">
              <div className="circle-total">{ticketsData.total}</div>
              <div className="circle-label">Tickets total</div>
            </div>
          </div>

          {/* Légendes à droite du cercle */}
          <div className="tickets-legends">
            {ticketsData.stats.map((item, index) => (
              <div key={index} className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: item.color }}
                />
                <div className="legend-text">
                  <span className="legend-percent">{item.percent}%</span>
                  <span className="legend-value">{item.value}</span>
                  <span className="legend-label">{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Droite : 4 blocs d'info */}
        <div className="info-blocks">
          {rightBlocks.map((block, index) => (
            <div key={index} className="info-block">
              <h3>{block.title}</h3>
              <div className="block-value">{block.value}</div>
              <p className="block-description">{block.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section des équipes avec scroll horizontal */}
      <div className="teams-section">
        <h2 className="section-title">Avancement des Équipes</h2>
        <div className="teams-scroll-wrapper">
          {/* Flèche gauche */}
          {scrollState.canScrollLeft && (
            <button className="scroll-button left" onClick={() => scrollTeams('left')}>
              <FaChevronLeft />
            </button>
          )}

          {/* Liste des équipes */}
          <div className="teams-container" ref={teamsContainerRef}>
            {teamsData.map((team, index) => (
              <TeamCard key={index} team={team} />
            ))}
          </div>

          {/* Flèche droite */}
          {scrollState.canScrollRight && (
            <button className="scroll-button right" onClick={() => scrollTeams('right')}>
              <FaChevronRight />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeContent;
