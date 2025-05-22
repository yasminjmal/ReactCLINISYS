import React from 'react';

const TeamCard = ({ team }) => {
  return (
    <div className="team-card">
      <h3 className="team-name">{team.name}</h3>
      <div className="team-leader">
        <img 
          src={team.leader.image} 
          alt={team.leader.name} 
          className="leader-image"
        />
        <span className="leader-name">{team.leader.name}</span>
      </div>
      <div className="progress-container">
        <div className="progress-label">Avancement: {team.progress}%</div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${team.progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default TeamCard;