import React from 'react';
import './home.css';

function Home() {
  return (
    <div className="home">

      {/* HERO */}
      <div className="hero">
        <h1>🍏 FoodIQ</h1>
        <p>Scanne. Comprends. Mange mieux.</p>

        <button className="hero-button">
          📷 Scanner un produit
        </button>
      </div>

      {/* FEATURES */}
      <div className="features">

        <div className="feature-card">
          <h3>📊 Analyse rapide</h3>
          <p>Obtiens un score santé en quelques secondes</p>
        </div>

        <div className="feature-card">
          <h3>💰 Moins cher</h3>
          <p>Compare les prix autour de toi</p>
        </div>

        <div className="feature-card">
          <h3>🤖 IA intégrée</h3>
          <p>Comprends les ingrédients facilement</p>
        </div>

      </div>

    </div>
  );
}

export default Home;