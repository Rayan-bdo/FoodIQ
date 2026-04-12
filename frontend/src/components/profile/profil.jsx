import React, { useState } from 'react';
import './compte.css';

const initialHistory = [
  { id: 1, product: 'Céréales bio', date: '2026-03-28', score: 'Sain', price: '2,50€' },
  { id: 2, product: 'Yaourt nature', date: '2026-03-29', score: 'Bon', price: '1,20€' },
  { id: 3, product: 'Boisson cola', date: '2026-03-30', score: 'Médiocre', price: '1,80€' },
];

function Compte() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountCreated, setAccountCreated] = useState(false);
  const [history, setHistory] = useState([]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;

    setAccountCreated(true);
    setHistory(initialHistory);
  };

  const handleLogout = () => {
    setName('');
    setEmail('');
    setPassword('');
    setAccountCreated(false);
    setHistory([]);
  };

  return (
    <div className="compte-shell">
      <div className="compte-card">

        {!accountCreated ? (
          <>
            <div className="compte-heading">
              <h1>Créer ton compte</h1>
              <p>Accède à ton historique et tes analyses FoodIQ</p>
            </div>

            <form className="compte-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="👤 Nom complet"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                type="email"
                placeholder="📧 Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder="🔒 Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button className="compte-button" type="submit">
                🚀 Créer le compte
              </button>
            </form>
          </>
        ) : (
          <div className="compte-info">

            {/* HEADER PROFIL */}
            <div className="profile-header">
              <div>
                <h2>👋 {name}</h2>
                <p>Score santé moyen : <strong>78 🟡</strong></p>
              </div>

              <button className="compte-button logout" onClick={handleLogout}>
                Déconnexion
              </button>
            </div>

            {/* STATS */}
            <div className="stats">
              <div className="stat-card">
                <h3>{history.length}</h3>
                <p>Produits scannés</p>
              </div>

              <div className="stat-card green">
                <h3>12</h3>
                <p>Bons produits</p>
              </div>

              <div className="stat-card red">
                <h3>6</h3>
                <p>Mauvais</p>
              </div>
            </div>

            {/* HISTORIQUE */}
            <div className="history-wrapper">
              <h3>📊 Historique</h3>

              <ul className="history-list">
                {history.map((item) => (
                  <li key={item.id} className="history-item">
                    <div>
                      <strong>{item.product}</strong>
                      <p>{item.date} · {item.score}</p>
                    </div>
                    <span>{item.price}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default Compte;