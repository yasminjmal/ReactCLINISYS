import React from 'react';
import './TotalShipmentsDashboard.css';

const TotalShipmentsDashboard = () => {
  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Total Shipments</h1>
        <h2 className="dashboard-subtitle">Performance</h2>
      </div>

      <div className="dashboard-divider"></div>

      <div className="dashboard-content">
        {/* Left Column */}
        <div className="dashboard-column">
          {/* Accounts Section */}
          <div className="section-card">
            <h3 className="section-title">ACCOUNTS</h3>
            <ul className="section-list">
              <li className="list-item">Purchases</li>
              <li className="list-item">Sessions</li>
            </ul>
          </div>

          {/* Months Section */}
          <div className="section-card">
            <h3 className="section-title">MONTHS</h3>
            <div className="months-grid">
              {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].map(month => (
                <span key={month} className="month-item">
                  {month}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Column - KPIs */}
        <div className="dashboard-column">
          <div className="section-card">
            <h3 className="section-title">Total Shipments</h3>
            <p className="kpi-value">763,215</p>
            
            <div className="kpi-row">
              <div className="kpi-item">
                <p className="kpi-title">Daily Sales</p>
                <p className="kpi-data">3,500€</p>
              </div>
              <div className="kpi-item">
                <p className="kpi-title">Completed Tasks</p>
                <p className="kpi-data">12,100K</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard-column">
          {/* Recent Months */}
          <div className="section-card">
            <h3 className="section-title">RECENT MONTHS</h3>
            <div className="months-grid">
              {['JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].map(month => (
                <span key={month} className="month-item">
                  {month}
                </span>
              ))}
            </div>
          </div>

          {/* Countries */}
          <div className="section-card">
            <h3 className="section-title">COUNTRIES</h3>
            <div className="countries-grid">
              {['USA', 'GER', 'AUS', 'UK', 'RO', 'BR'].map(country => (
                <span key={country} className="country-item">
                  {country}
                </span>
              ))}
            </div>
          </div>

          {/* Last Months Row */}
          <div className="months-grid">
            {['JUL', 'AUG', 'SEP', 'OCT', 'NOV'].map(month => (
              <span key={month} className="month-item">
                {month}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalShipmentsDashboard;