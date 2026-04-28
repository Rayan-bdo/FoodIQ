import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import {
  FaArrowLeft, FaUser, FaLock, FaBell, FaMoon, FaLanguage,
  FaShieldAlt, FaQuestionCircle, FaInfoCircle, FaSignOutAlt, FaChevronRight,
  FaEnvelope, FaHeart,
} from "react-icons/fa";
import { useLang } from "../../translations/LanguageContext";
import "./Parametres.css";

export default function Parametres() {
  const navigate = useNavigate();
  const { lang, setLang, t, darkMode, setDarkMode } = useLang();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  const LANGUAGES = [
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "ar", label: "العربية", flag: "🇲🇦" },
  ];

  const currentLang = LANGUAGES.find((l) => l.code === lang);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/profile", { method: "GET", credentials: "include" });
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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      setUser(null);
      navigate("/");
    } catch (err) {
      console.error("Erreur déconnexion :", err);
    }
  };

  return (
    <div className="parametres-container">

      <div className="parametres-header">
        <button className="back-btn" onClick={() => navigate(-1)}><FaArrowLeft /></button>
        <h2>{t("settings")}</h2>
        <div style={{ width: 36 }} />
      </div>

      <div className="user-card">
        <div className="user-avatar">
          {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
        </div>
        <div className="user-info">
          <h3>{user?.name || t("unknownProduct")}</h3>
          <p>{user?.email || "—"}</p>
        </div>
      </div>

      {/* COMPTE */}
      <section className="settings-section">
        <h4 className="settings-section-title">{t("account")}</h4>
        <div className="settings-list">
          <button className="settings-item" onClick={() => navigate("/profil/edit")}>
            <div className="settings-item-left">
              <div className="settings-icon icon-blue"><FaUser /></div>
              <span>{t("editProfile")}</span>
            </div>
            <FaChevronRight className="chevron" />
          </button>
          <button className="settings-item" onClick={() => navigate("/changer-mdp")}>
            <div className="settings-item-left">
              <div className="settings-icon icon-purple"><FaLock /></div>
              <span>{t("changePassword")}</span>
            </div>
            <FaChevronRight className="chevron" />
          </button>
        </div>
      </section>

      {/* PRÉFÉRENCES */}
      <section className="settings-section">
        <h4 className="settings-section-title">{t("preferences")}</h4>
        <div className="settings-list">
          <div className="settings-item">
            <div className="settings-item-left">
              <div className="settings-icon icon-orange"><FaBell /></div>
              <span>{t("notifications")}</span>
            </div>
            <label className="switch">
              <input type="checkbox" checked={notifications} onChange={() => setNotifications(!notifications)} />
              <span className="slider" />
            </label>
          </div>

          <div className="settings-item">
            <div className="settings-item-left">
              <div className="settings-icon icon-dark"><FaMoon /></div>
              <span>{t("darkMode")}</span>
            </div>
            <label className="switch">
              <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
              <span className="slider" />
            </label>
          </div>

          <button className="settings-item" onClick={() => setShowLangModal(true)}>
            <div className="settings-item-left">
              <div className="settings-icon icon-green"><FaLanguage /></div>
              <span>{t("language")}</span>
            </div>
            <div className="settings-item-right">
              <span className="value">{currentLang?.flag} {currentLang?.label}</span>
              <FaChevronRight className="chevron" />
            </div>
          </button>
        </div>
      </section>

      {/* CONFIDENTIALITÉ & AIDE */}
      <section className="settings-section">
        <h4 className="settings-section-title">{t("privacyHelp")}</h4>
        <div className="settings-list">
          <button className="settings-item" onClick={() => setShowPrivacyModal(true)}>
            <div className="settings-item-left">
              <div className="settings-icon icon-teal"><FaShieldAlt /></div>
              <span>{t("privacyPolicy")}</span>
            </div>
            <FaChevronRight className="chevron" />
          </button>
          <button className="settings-item" onClick={() => setShowHelpModal(true)}>
            <div className="settings-item-left">
              <div className="settings-icon icon-yellow"><FaQuestionCircle /></div>
              <span>{t("helpSupport")}</span>
            </div>
            <FaChevronRight className="chevron" />
          </button>
          <button className="settings-item" onClick={() => setShowAboutModal(true)}>
            <div className="settings-item-left">
              <div className="settings-icon icon-gray"><FaInfoCircle /></div>
              <span>{t("about")}</span>
            </div>
            <div className="settings-item-right">
              <span className="value">v1.0.0</span>
              <FaChevronRight className="chevron" />
            </div>
          </button>
        </div>
      </section>

      {/* ZONE SENSIBLE */}
      <section className="settings-section">
        <h4 className="settings-section-title danger-title">{t("dangerZone")}</h4>
        <div className="settings-list">
          <button className="settings-item danger" onClick={() => setShowLogoutModal(true)}>
            <div className="settings-item-left">
              <div className="settings-icon icon-orange-red"><FaSignOutAlt /></div>
              <span>{t("logout")}</span>
            </div>
            <FaChevronRight className="chevron" />
          </button>
        </div>
      </section>

      {/* ===== MODAL LANGUE ===== */}
      {showLangModal && (
        <div className="modal-overlay" onClick={() => setShowLangModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon" style={{ background: "linear-gradient(135deg, #2ecc71, #27ae60)" }}>
              <FaLanguage />
            </div>
            <h3>{t("language")}</h3>
            <div className="lang-options">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  className={`lang-option ${lang === l.code ? "active" : ""}`}
                  onClick={() => { setLang(l.code); setShowLangModal(false); }}
                >
                  <span className="lang-flag">{l.flag}</span>
                  <span className="lang-label">{l.label}</span>
                  {lang === l.code && <span className="lang-check">✓</span>}
                </button>
              ))}
            </div>
            <button className="btn-secondary" style={{ width: "100%", marginTop: 12 }} onClick={() => setShowLangModal(false)}>
              {t("cancel")}
            </button>
          </div>
        </div>
      )}

      {/* ===== MODAL DÉCONNEXION ===== */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon orange"><FaSignOutAlt /></div>
            <h3>{t("logoutConfirmTitle")}</h3>
            <p>{t("logoutConfirmMsg")}</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowLogoutModal(false)}>{t("cancel")}</button>
              <button className="btn-danger" onClick={handleLogout}>{t("logout")}</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL CONFIDENTIALITÉ ===== */}
      {showPrivacyModal && (
        <div className="modal-overlay" onClick={() => setShowPrivacyModal(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon" style={{ background: "linear-gradient(135deg, #1abc9c, #16a085)" }}>
              <FaShieldAlt />
            </div>
            <h3>{t("privacyPolicy")}</h3>
            <div className="modal-text-content">
              <p>🔒 <strong>{t("privacyData")}</strong></p>
              <p>{t("privacyDataDesc")}</p>
              <p>📦 <strong>{t("privacyStorage")}</strong></p>
              <p>{t("privacyStorageDesc")}</p>
              <p>🚫 <strong>{t("privacyNoShare")}</strong></p>
              <p>{t("privacyNoShareDesc")}</p>
            </div>
            <button className="btn-secondary" style={{ width: "100%", marginTop: 16 }} onClick={() => setShowPrivacyModal(false)}>
              {t("close")}
            </button>
          </div>
        </div>
      )}

      {/* ===== MODAL AIDE ===== */}
      {showHelpModal && (
        <div className="modal-overlay" onClick={() => setShowHelpModal(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon" style={{ background: "linear-gradient(135deg, #f1c40f, #f39c12)" }}>
              <FaQuestionCircle />
            </div>
            <h3>{t("helpSupport")}</h3>
            <div className="modal-text-content">
              <p>📷 <strong>{t("helpScan")}</strong></p>
              <p>{t("helpScanDesc")}</p>
              <p>🔍 <strong>{t("helpSearch")}</strong></p>
              <p>{t("helpSearchDesc")}</p>
              <p>🤖 <strong>{t("helpAI")}</strong></p>
              <p>{t("helpAIDesc")}</p>
            </div>
            <a
              href="mailto:support@foodiq.app"
              className="btn-help-contact"
            >
              <FaEnvelope /> {t("contactSupport")}
            </a>
            <button className="btn-secondary" style={{ width: "100%", marginTop: 10 }} onClick={() => setShowHelpModal(false)}>
              {t("close")}
            </button>
          </div>
        </div>
      )}

      {/* ===== MODAL À PROPOS ===== */}
      {showAboutModal && (
        <div className="modal-overlay" onClick={() => setShowAboutModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="about-logo">🍎</div>
            <h3>FoodIQ</h3>
            <p className="about-version">v1.0.0</p>
            <p className="about-desc">{t("aboutDesc")}</p>
            <div className="about-badges">
              <span className="about-badge">Open Food Facts</span>
              <span className="about-badge">React</span>
              <span className="about-badge">Node.js</span>
            </div>
            <p className="about-made">
              {t("madeWith")} <FaHeart style={{ color: "#e74c3c" }} /> {t("by")} Rayan
            </p>
            <button className="btn-secondary" style={{ width: "100%", marginTop: 16 }} onClick={() => setShowAboutModal(false)}>
              {t("close")}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}