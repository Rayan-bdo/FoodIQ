import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./navbar.css";
import { FaBarcode, FaHistory, FaRobot, FaSearch, FaUser } from "react-icons/fa";
import { useLang } from "../../translations/LanguageContext";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLang();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="navbar">

      <div
        className={`nav-item ${isActive("/scanner") ? "active" : ""}`}
        onClick={() => navigate("/scanner")}
      >
        <FaBarcode />
        <span>{t("navScanner")}</span>
      </div>

      <div
        className={`nav-item ${isActive("/historique") ? "active" : ""}`}
        onClick={() => navigate("/historique")}
      >
        <FaHistory />
        <span>{t("navHistory")}</span>
      </div>

      <div
        className={`nav-item ${isActive("/ia") ? "active" : ""}`}
        onClick={() => navigate("/ia")}
      >
        <FaRobot />
        <span>{t("navAI")}</span>
      </div>

      <div
        className={`nav-item ${isActive("/recherche") ? "active" : ""}`}
        onClick={() => navigate("/recherche")}
      >
        <FaSearch />
        <span>{t("navSearch")}</span>
      </div>

      <div
        className={`nav-item ${isActive("/profil") ? "active" : ""}`}
        onClick={() => navigate("/profil")}
      >
        <FaUser />
        <span>{t("navProfile")}</span>
      </div>

    </div>
  );
};

export default Navbar;