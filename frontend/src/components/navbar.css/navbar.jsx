import React, { useState } from 'react';
import './navbar.css';
import Compte from '../compte/compte';

const tabs = [
  { id: 'compte', label: '👤 Compte' },
  { id: 'recommendations', label: '💡 Recommandations' },
  { id: 'scan', label: '📷 Scan' },
  { id: 'ia', label: '🤖 IA' },
  { id: 'recherche', label: '🔎 Recherche' },
];

const descriptions = {
  recommendations: 'Recevez des recommandations personnalisées pour des choix alimentaires plus sains.',
  scan: 'Scannez un code-barres pour obtenir immédiatement les informations nutritionnelles du produit.',
  ia: 'Posez vos questions à l’assistant intelligent pour mieux comprendre la qualité nutritionnelle.',
  recherche: 'Recherchez un produit ou un ingrédient pour comparer sa qualité et son prix.',
};

function Navbar() {
  const [activeTab, setActiveTab] = useState('scan');

  return (
    <div className="app">
      {/* HEADER */}
      <nav className="navbar">
        <div className="navbar-brand">🍏 FoodIQ</div>

        <ul className="navbar-menu">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                className={`navbar-link ${tab.id === activeTab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* CONTENU */}
      <main className="main-content">
        {activeTab === 'compte' ? (
          <Compte />
        ) : (
          <div className="content-card">
            <h2 className="title">
              {tabs.find((tab) => tab.id === activeTab)?.label}
            </h2>

            <p className="description">
              {descriptions[activeTab]}
            </p>

            {/* BOUTON PRINCIPAL */}
            {activeTab === 'scan' && (
              <button className="scan-button">
                📷 Scanner un produit
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Navbar;