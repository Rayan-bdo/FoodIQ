import React from 'react';

function Page({ title, description, hasScanButton }) {
  const handleScan = () => {
    alert('Fonctionnalité de scan à implémenter ! 📷');
    // Ici, vous pouvez ajouter la logique pour ouvrir la caméra ou scanner
  };

  return (
    <div className="content-card">
      <h2>{title}</h2>
      <p>{description}</p>
      {hasScanButton && (
        <button className="scan-button" onClick={handleScan}>
          📷 Scanner un produit
        </button>
      )}
    </div>
  );
}

export default Page;