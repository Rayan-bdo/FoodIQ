import React, { useState } from "react";
import "./Recherche.css";

export default function Recherche() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setResults([]);
    setSearched(true);

    try {
      const response = await fetch(
        `/api/scrape?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      if (!response.ok || data.error) {
        setError(data.error || "Une erreur est survenue.");
      } else {
        setResults(data.results);
      }
    } catch (err) {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recherche-container">
      <h1 className="recherche-title">Rechercher un produit</h1>

      <form className="recherche-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Ex: Sidi Ali, Huile, Lait..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="recherche-input"
        />
        <button type="submit" className="recherche-btn" disabled={loading}>
          {loading ? "Recherche..." : "Rechercher"}
        </button>
      </form>

      {/* Loading spinner */}
      {loading && (
        <div className="recherche-loading">
          <div className="spinner"></div>
          <p>Recherche chez Marjane et Aswak Assalam...</p>
        </div>
      )}

      {/* Error message */}
      {error && <p className="recherche-error">{error}</p>}

      {/* No results */}
      {searched && !loading && !error && results.length === 0 && (
        <p className="recherche-empty">Aucun produit trouvé pour "{query}".</p>
      )}

      {/* Results grid */}
      {results.length > 0 && (
        <div className="recherche-results">
          <p className="recherche-count">{results.length} produit(s) trouvé(s)</p>
          <div className="recherche-grid">
            {results.map((product) => (
              <a
                key={product.idProduit}
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="product-card"
              >
                <span
                  className={`store-badge ${
                    product.magasin === "Marjane" ? "badge-marjane" : "badge-aswak"
                  }`}
                >
                  {product.magasin}
                </span>

                {product.image && (
                  <img
                    src={product.image}
                    alt={product.titre}
                    className="product-image"
                  />
                )}
                <div className="product-info">
                  <h3 className="product-titre">{product.titre}</h3>
                  {product.prix && (
                    <p className="product-prix">{product.prix}</p>
                  )}
                  <span className="product-link">Voir le produit →</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
