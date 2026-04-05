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
    if (!name.trim() || !email.trim() || !password.trim()) {
      return;
    }
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
        <div className="compte-heading">
          <h1>Mon compte FoodIQ</h1>
          <p>Créez votre compte pour retrouver votre historique de scans et suivre vos produits favoris.</p>
        </div>

        {!accountCreated ? (
          <form className="compte-form" onSubmit={handleSubmit}>
            <label className="compte-field">
              <span>Nom complet</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Youssef"
              />
            </label>

            <label className="compte-field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@mail.com"
              />
            </label>

            <label className="compte-field">
              <span>Mot de passe</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </label>

            <button className="compte-button" type="submit">
              Créer le compte
            </button>
          </form>
        ) : (
          <div className="compte-info">
            <div className="compte-summary">
              <div>
                <h2>Bienvenue, {name}</h2>
                <p>Votre compte est créé et votre historique de scans est prêt.</p>
              </div>
              <span className="compte-badge">Actif</span>
            </div>

            <button className="compte-button logout" type="button" onClick={handleLogout}>
              Se déconnecter
            </button>

            <div className="history-wrapper">
              <h3>Historique des scans</h3>
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
