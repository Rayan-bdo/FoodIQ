import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import {
  FaArrowLeft,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaShieldAlt,
} from "react-icons/fa";
import "./ChangerMotDePasse.css";

export default function ChangerMotDePasse() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [show, setShow] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess(false);
  };

  const toggleShow = (field) => {
    setShow({ ...show, [field]: !show[field] });
  };

  // 🔐 Calcul force du mot de passe
  const getStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "", color: "#bdc3c7" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    const levels = [
      { label: "Très faible", color: "#e74c3c" },
      { label: "Faible", color: "#e67e22" },
      { label: "Moyen", color: "#f39c12" },
      { label: "Bon", color: "#85bb2f" },
      { label: "Fort", color: "#27ae60" },
    ];
    return { score, ...levels[Math.min(score - 1, 4)] || levels[0] };
  };

  const strength = getStrength(form.newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (!form.oldPassword) {
      setError("Saisis ton ancien mot de passe");
      return;
    }
    if (form.newPassword.length < 8) {
      setError("Le nouveau mot de passe doit faire au moins 8 caractères");
      return;
    }
    if (form.newPassword === form.oldPassword) {
      setError("Le nouveau mot de passe doit être différent de l'ancien");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: form.oldPassword,
          newPassword: form.newPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur lors du changement");
      }

      setSuccess(true);
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => navigate("/parametres"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pwd-container">
      {/* HEADER */}
      <div className="pwd-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
        <h2>Mot de passe</h2>
        <div style={{ width: 36 }} />
      </div>

      {/* ICON HERO */}
      <div className="pwd-hero">
        <div className="pwd-hero-icon">
          <FaShieldAlt />
        </div>
        <h3>Sécurise ton compte</h3>
        <p>
          Choisis un mot de passe fort que tu n'utilises pas ailleurs.
        </p>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="pwd-form">
        {/* ANCIEN */}
        <div className="form-group">
          <label>Ancien mot de passe</label>
          <div className="input-wrapper">
            <FaLock className="input-icon" />
            <input
              type={show.old ? "text" : "password"}
              name="oldPassword"
              value={form.oldPassword}
              onChange={handleChange}
              placeholder="••••••••"
              maxLength={128}
              required
            />
            <button
              type="button"
              className="toggle-eye"
              onClick={() => toggleShow("old")}
            >
              {show.old ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* NOUVEAU */}
        <div className="form-group">
          <label>Nouveau mot de passe</label>
          <div className="input-wrapper">
            <FaLock className="input-icon" />
            <input
              type={show.new ? "text" : "password"}
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Min. 8 caractères"
              maxLength={128}
              required
            />
            <button
              type="button"
              className="toggle-eye"
              onClick={() => toggleShow("new")}
            >
              {show.new ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* JAUGE FORCE */}
          {form.newPassword && (
            <div className="strength-container">
              <div className="strength-bar">
                <div
                  className="strength-fill"
                  style={{
                    width: `${(strength.score / 5) * 100}%`,
                    background: strength.color,
                  }}
                />
              </div>
              <span
                className="strength-label"
                style={{ color: strength.color }}
              >
                {strength.label}
              </span>
            </div>
          )}
        </div>

        {/* CONFIRMER */}
        <div className="form-group">
          <label>Confirmer le mot de passe</label>
          <div className="input-wrapper">
            <FaLock className="input-icon" />
            <input
              type={show.confirm ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Retape ton nouveau mot de passe"
              maxLength={128}
              required
            />
            <button
              type="button"
              className="toggle-eye"
              onClick={() => toggleShow("confirm")}
            >
              {show.confirm ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {form.confirmPassword &&
            form.newPassword === form.confirmPassword && (
              <div className="match-ok">
                <FaCheck /> Les mots de passe correspondent
              </div>
            )}
        </div>

        {/* CRITÈRES */}
        <div className="criteria">
          <p className="criteria-title">Ton mot de passe doit contenir :</p>
          <ul>
            <li className={form.newPassword.length >= 8 ? "valid" : ""}>
              {form.newPassword.length >= 8 ? "✅" : "⚪"} Au moins 8 caractères
            </li>
            <li className={/[A-Z]/.test(form.newPassword) ? "valid" : ""}>
              {/[A-Z]/.test(form.newPassword) ? "✅" : "⚪"} Une majuscule
            </li>
            <li className={/[0-9]/.test(form.newPassword) ? "valid" : ""}>
              {/[0-9]/.test(form.newPassword) ? "✅" : "⚪"} Un chiffre
            </li>
            <li
              className={
                /[^A-Za-z0-9]/.test(form.newPassword) ? "valid" : ""
              }
            >
              {/[^A-Za-z0-9]/.test(form.newPassword) ? "✅" : "⚪"} Un
              caractère spécial
            </li>
          </ul>
        </div>

        {error && <div className="form-error">⚠️ {error}</div>}
        {success && (
          <div className="form-success">
            <FaCheck /> Mot de passe modifié avec succès !
          </div>
        )}

        <button type="submit" className="save-btn" disabled={saving}>
          {saving ? "Modification…" : "🔐 Modifier le mot de passe"}
        </button>
      </form>
    </div>
  );
}
