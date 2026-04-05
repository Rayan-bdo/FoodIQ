import React from 'react';
import { NavLink } from 'react-router-dom';
import './navbar.css';


const tabs = [
  { id: 'compte', label: '👤 Compte' },
  { id: 'recommendations', label: '💡 Recommandations' },
  { id: 'scan', label: '📷 Scan' },
  { id: 'ia', label: '🤖 IA' },
  { id: 'recherche', label: '🔎 Recherche' },
];

function Navbar() {

  return (
    <div className="app">
      {/* HEADER */}
      <nav className="navbar">
        <NavLink to="/home" className="navbar-brand">
          🍏 FoodIQ
        </NavLink>

        <ul className="navbar-menu">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <NavLink
                to={`/${tab.id}`}
                className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
              >
                {tab.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default Navbar;