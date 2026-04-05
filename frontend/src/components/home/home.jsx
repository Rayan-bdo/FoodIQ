import React from 'react';
import './home.css';

function Home() {
  return (
    <div className="home">
      <section className="hero">
        <h1>Faites les bons choix pour votre santé</h1>
        <p className="hero-text">
          FoodIQ décrypte les étiquettes de vos produits alimentaires et analyse leur impact sur la santé.
        </p>
      </section>

      <section className="features">
        <div className="feature-card">
          <h3>Analyse alimentaire</h3>
          <p>FoodIQ analyse les produits alimentaires et vous explique l'évaluation de chaque produit dans une fiche produit détaillée.</p>
        </div>

        <div className="feature-card">
          <h3>Recommandations</h3>
          <p>Pour les produits médiocres ou mauvais que vous avez scannés, FoodIQ recommande en toute indépendance des produits similaires meilleurs pour la santé.</p>
        </div>

        <div className="feature-card">
          <h3>Assistance IA</h3>
          <p>Un dialogue interactif avec notre intelligence artificielle pour des réponses précises sur chaque ingrédient.</p>
        </div>

        <div className="feature-card">
          <h3>Historique</h3>
          <p>FoodIQ affiche l'historique des produits scannés. Vous identifiez l'impact de chaque produit sur la santé via un code couleur simple.</p>
        </div>
      </section>

      <section className="how-it-works">
        <h2>Comment ça marche ?</h2>
        <p className="subtitle">
          En un scan, découvrez tout ce que vous devez savoir sur un produit.
        </p>

        <div className="steps">
          <article className="step-card">
            <span className="step-number">01</span>
            <h3>Scannez</h3>
            <p>Un simple scan du code-barres suffit pour décrypter la composition d'un produit.</p>
          </article>

          <article className="step-card">
            <span className="step-number">02</span>
            <h3>Analysez</h3>
            <p>Obtenez une évaluation claire de l'impact du produit sur votre santé avec un score sur 100.</p>
          </article>

          <article className="step-card">
            <span className="step-number">03</span>
            <h3>Trouvez mieux</h3>
            <p>Yuka recommande des produits alternatifs plus sains et mieux notés.</p>
          </article>

          <article className="step-card">
            <span className="step-number">04</span>
            <h3>Échangez</h3>
            <p>Profitez d'un assistant intelligent pour comprendre chaque ingrédient et adapter vos choix à vos besoins.</p>
          </article>
        </div>
      </section>

      <section className="download-cta">
        <h2>Mascotte</h2>
        <p className="download-text">
          Prêt à mieux consommer ? Téléchargez FoodIQ gratuitement et commencez à scanner vos produits dès maintenant.
        </p>
        <button className="download-button">Télécharger l'app</button>
      </section>

      <footer className="footer">
        <div className="footer-brand">
          <p className="footer-brand-label">Mascotte</p>
          <h3>FoodIQ</h3>
          <p className="footer-brand-text">
            L'application mobile qui scanne vos produits pour décrypter leur impact sur la santé.
          </p>
        </div>

        <div className="footer-links">
          <div className="footer-column">
            <p className="footer-column-title">Application</p>
            <a href="#">Fonctionnalités</a>
            <a href="#">Alimentation</a>
            <a href="#">Cosmétiques</a>
            <a href="#">Télécharger</a>
          </div>

          <div className="footer-column">
            <p className="footer-column-title">À propos</p>
            <a href="#">L'équipe</a>
            <a href="#">Indépendance</a>
            <a href="#">Presse</a>
            <a href="#">Contact</a>
          </div>

          <div className="footer-column">
            <p className="footer-column-title">Ressources</p>
            <a href="#">Blog</a>
            <a href="#">FAQ</a>
            <a href="#">CGU</a>
            <a href="#">Politique de confidentialité</a>
          </div>
        </div>

        <div className="footer-copy">
          © 2026 FoodIQ. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}

export default Home;