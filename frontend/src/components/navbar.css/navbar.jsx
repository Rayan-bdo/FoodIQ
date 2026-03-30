import React, { useState } from 'react';
import './navbar.css';

const tabs = [
  { id: 'compte', label: 'Compte' },
  { id: 'recommendations', label: 'Recommendations' },
  { id: 'scan', label: 'Scan' },
  { id: 'ia', label: 'IA' },
  { id: 'recherche', label: 'Recherche' },
];

const descriptions = {
  compte: 'Accédez à votre profil, votre historique de scans et vos préférences FoodIQ.',
  recommendations: 'Recevez des recommandations personnalisées pour des choix alimentaires plus sains.',
  scan: 'Scannez un code-barres pour obtenir immédiatement les informations nutritionnelles du produit.',
  ia: 'Posez vos questions à l’assistant intelligent pour mieux comprendre la qualité nutritionnelle.',
  recherche: 'Recherchez un produit ou un ingrédient pour comparer sa qualité et son prix.',
};

function Navbar() {
  const [activeTab, setActiveTab] = useState('scan');

  return (
    <div className="navbar-shell">
      <nav className="navbar">
        <div className="navbar-brand">FoodIQ</div>
        <ul className="navbar-menu">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                type="button"
                className={tab.id === activeTab ? 'navbar-link active' : 'navbar-link'}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <section className="navbar-content">
        <h2>{tabs.find((tab) => tab.id === activeTab)?.label}</h2>
        <p>{descriptions[activeTab]}</p>
      </section>
    </div>
  );
}

export default Navbar;
