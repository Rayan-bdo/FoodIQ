import React, { useState, useEffect } from "react";

const Historique = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/scans/history', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      } else {
        setError("Erreur lors de la récupération de l'historique");
      }
    } catch (err) {
      console.error("Erreur fetch historique:", err);
      setError("Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Historique des scans</h1>
      {history.length === 0 ? (
        <p>Aucun scan enregistré.</p>
      ) : (
        <div>
          {history.map((scan, index) => (
            <div key={index} style={{
              border: "2px solid #ddd",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "10px",
              backgroundColor: "#f9f9f9"
            }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                {scan.image && (
                  <img
                    src={scan.image}
                    alt={scan.productName}
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      marginRight: "15px"
                    }}
                  />
                )}
                <div>
                  <h3 style={{ margin: "0 0 5px 0" }}>{scan.productName}</h3>
                  <p style={{ margin: "0", color: "#666" }}>{scan.brand}</p>
                  <p style={{ margin: "5px 0", fontSize: "14px", color: "#999" }}>
                    Scanné le {new Date(scan.scannedAt).toLocaleDateString('fr-FR')}
                  </p>
                  {scan.nutriScore && (
                    <span style={{
                      display: "inline-block",
                      padding: "4px 8px",
                      backgroundColor: scan.nutriScore === "a" ? "#4CAF50" : scan.nutriScore === "b" ? "#8BC34A" : scan.nutriScore === "c" ? "#FFC107" : scan.nutriScore === "d" ? "#FF9800" : "#F44336",
                      color: "white",
                      borderRadius: "4px",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      fontSize: "12px"
                    }}>
                      {scan.nutriScore}
                    </span>
                  )}
                </div>
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
                gap: "10px",
                marginTop: "10px"
              }}>
                {scan.calories && <div>Calories: {scan.calories} kcal</div>}
                {scan.proteins && <div>Protéines: {scan.proteins}g</div>}
                {scan.carbs && <div>Glucides: {scan.carbs}g</div>}
                {scan.fat && <div>Graisses: {scan.fat}g</div>}
                {scan.sugar && <div>Sucres: {scan.sugar}g</div>}
                {scan.salt && <div>Sel: {scan.salt}g</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Historique;