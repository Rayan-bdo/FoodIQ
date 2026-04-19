import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaUser,
  FaLock,
  FaBell,
  FaMoon,
  FaLanguage,
  FaShieldAlt,
  FaQuestionCircle,
  FaInfoCircle,
  FaSignOutAlt,
  FaTrash,
  FaChevronRight,
} from "react-icons/fa";
import "./Parametres.css";

export default function Parametres() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 🔐 Récup user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/profile", {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) throw new Error("Not authorized");
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error(error);
        navigate("/");
      }
    };
    fetchUser();
  }, [navigate]);

  // 🚪 Déconnexion
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      navigate("/");
    } catch (err) {
      console.error("Erreur déconnexion :", err);
    }
  };

  // 🗑️ Suppression compte
  const handleDeleteAccount = async () => {
    try {
      const res = await fetch("/api/auth/delete", {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        navigate("/");
      } else {
        alert("Erreur lors de la suppression du compte");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="parametres-container">
      {/* 🔝 HEADER */}
      <div className="parametres-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
        <h2>Paramètres</h2>
        <div style={{ width: 36 }} />
      </div>

      {/* 👤 USER CARD */}
      <div className="user-card">
        <div className="user-avatar">
          {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
        </div>
        <div className="user-info">
          <h3>{user?.name || "Utilisateur"}</h3>
          <p>{user?.email || "—"}</p>
        </div>
      </div>

      {/* 👤 COMPTE */}
      <section className="settings-section">
        <h4 className="settings-section-title">Compte</h4>
        <div className="settings-list">
          <button
            className="settings-item"
            onClick={() => navigate("/profil/edit")}
          >
            <div className="settings-item-left">
              <div className="settings-icon icon-blue">
                <FaUser />
              </div>
              <span>Modifier le profil</span>
            </div>
            <FaChevronRight className="chevron" />
          </button>

          <button
            className="settings-item"
            onClick={() => navigate("/changer-mdp")}
          >
            <div className="settings-item-left">
              <div className="settings-icon icon-purple">
                <FaLock />
              </div>
              <span>Changer le mot de passe</span>
            </div>
            <FaChevronRight className="chevron" />
          </button>
        </div>
      </section>

      {/* ⚙️ PRÉFÉRENCES */}
      <section className="settings-section">
        <h4 className="settings-section-title">Préférences</h4>
        <div className="settings-list">
          <div className="settings-item">
            <div className="settings-item-left">
              <div className="settings-icon icon-orange">
                <FaBell />
              </div>
              <span>Notifications</span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={notifications}
                onChange={() => setNotifications(!notifications)}
              />
              <span className="slider" />
            </label>
          </div>

          <div className="settings-item">
            <div className="settings-item-left">
              <div className="settings-icon icon-dark">
                <FaMoon />
              </div>
              <span>Mode sombre</span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
              <span className="slider" />
            </label>
          </div>

          <button className="settings-item">
            <div className="settings-item-left">
              <div className="settings-icon icon-green">
                <FaLanguage />
              </div>
              <span>Langue</span>
            </div>
            <div className="settings-item-right">
              <span className="value">Français</span>
              <FaChevronRight className="chevron" />
            </div>
          </button>
        </div>
      </section>

      {/* 🛡️ CONFIDENTIALITÉ & AIDE */}
      <section className="settings-section">
        <h4 className="settings-section-title">Confidentialité & Aide</h4>
        <div className="settings-list">
          <button className="settings-item">
            <div className="settings-item-left">
              <div className="settings-icon icon-teal">
                <FaShieldAlt />
              </div>
              <span>Politique de confidentialité</span>
            </div>
            <FaChevronRight className="chevron" />
          </button>

          <button className="settings-item">
            <div className="settings-item-left">
              <div className="settings-icon icon-yellow">
                <FaQuestionCircle />
              </div>
              <span>Aide & Support</span>
            </div>
            <FaChevronRight className="chevron" />
          </button>

          <button className="settings-item">
            <div className="settings-item-left">
              <div className="settings-icon icon-gray">
                <FaInfoCircle />
              </div>
              <span>À propos</span>
            </div>
            <div className="settings-item-right">
              <span className="value">v1.0.0</span>
              <FaChevronRight className="chevron" />
            </div>
          </button>
        </div>
      </section>

      {/* ⚠️ ZONE DANGER */}
      <section className="settings-section">
        <h4 className="settings-section-title danger-title">Zone sensible</h4>
        <div className="settings-list">
          <button
            className="settings-item danger"
            onClick={() => setShowLogoutModal(true)}
          >
            <div className="settings-item-left">
              <div className="settings-icon icon-orange-red">
                <FaSignOutAlt />
              </div>
              <span>Déconnexion</span>
            </div>
            <FaChevronRight className="chevron" />
          </button>

          <button
            className="settings-item danger"
            onClick={() => setShowDeleteModal(true)}
          >
            <div className="settings-item-left">
              <div className="settings-icon icon-red">
                <FaTrash />
              </div>
              <span>Supprimer mon compte</span>
            </div>
            <FaChevronRight className="chevron" />
          </button>
        </div>
      </section>

      <p className="footer-text">Fait avec 💚 — ScanNutrition</p>

      {/* 🚪 MODAL DÉCONNEXION */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon orange">
              <FaSignOutAlt />
            </div>
            <h3>Se déconnecter ?</h3>
            <p>Tu devras te reconnecter pour accéder à ton compte.</p>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowLogoutModal(false)}
              >
                Annuler
              </button>
              <button className="btn-danger" onClick={handleLogout}>
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🗑️ MODAL SUPPRESSION */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon red">
              <FaTrash />
            </div>
            <h3>Supprimer le compte ?</h3>
            <p>
              Cette action est <strong>irréversible</strong>. Toutes tes données
              seront définitivement supprimées.
            </p>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Annuler
              </button>
              <button className="btn-danger" onClick={handleDeleteAccount}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
