import React, { useState } from 'react';
import { motion } from 'framer-motion';
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

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="navbar-shell">
      <nav className="navbar">
        <motion.div
          className="navbar-brand"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          FoodIQ
        </motion.div>
        <ul className="navbar-menu">
          {tabs.map((tab) => (
            <motion.li
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                type="button"
                className={tab.id === activeTab ? 'navbar-link active' : 'navbar-link'}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            </motion.li>
          ))}
        </ul>
      </nav>

      <motion.section
        className="navbar-content"
        key={activeTab}
        initial="hidden"
        animate="visible"
        variants={contentVariants}
      >
        <h2>{tabs.find((tab) => tab.id === activeTab)?.label}</h2>
        <p>{descriptions[activeTab]}</p>
      </motion.section>
    </div>
  );
}

export default Navbar;
