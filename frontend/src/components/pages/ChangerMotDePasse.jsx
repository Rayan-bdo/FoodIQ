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
import { useLang } from "../../translations/LanguageContext";
import "./ChangerMotDePasse.css";

export default function ChangerMotDePasse() {
  const navigate = useNavigate();
  const { t } = useLang();

  const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [show, setShow] = useState({ old: false, new: false, confirm: false });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess(false);
  };

  const toggleShow = (field) => setShow({ ...show, [field]: !show[field] });

  const getStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "", color: "#bdc3c7" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    const levels = [
      { label: t("pwdVeryWeak"), color: "#e74c3c" },
      { label: t("pwdWeak"), color: "#e67e22" },
      { label: t("pwdFair"), color: "#f39c12" },
      { label: t("pwdGood"), color: "#85bb2f" },
      { label: t("pwdStrong"), color: "#27ae60" },
    ];
    return { score, ...(levels[Math.min(score - 1, 4)] || levels[0]) };
  };

  const strength = getStrength(form.newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!form.oldPassword) { setError(t("errorOldPwd")); return; }
    if (form.newPassword.length < 8) { setError(t("errorPwdMin")); return; }
    if (form.newPassword === form.oldPassword) { setError(t("errorPwdSame")); return; }
    if (form.newPassword !== form.confirmPassword) { setError(t("errorPwdMatch")); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword: form.oldPassword, newPassword: form.newPassword }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || t("errorUpdate"));
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
        <button className="back-btn" onClick={() => navigate(-1)}><FaArrowLeft /></button>
        <h2>{t("changePassword")}</h2>
        <div style={{ width: 36 }} />
      </div>

      {/* HERO */}
      <div className="pwd-hero">
        <div className="pwd-hero-icon"><FaShieldAlt /></div>
        <h3>{t("secureAccount")}</h3>
        <p>{t("secureAccountDesc")}</p>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="pwd-form">

        {/* ANCIEN */}
        <div className="form-group">
          <label>{t("oldPassword")}</label>
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
            <button type="button" className="toggle-eye" onClick={() => toggleShow("old")}>
              {show.old ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* NOUVEAU */}
        <div className="form-group">
          <label>{t("newPassword")}</label>
          <div className="input-wrapper">
            <FaLock className="input-icon" />
            <input
              type={show.new ? "text" : "password"}
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder={t("pwdMinPlaceholder")}
              maxLength={128}
              required
            />
            <button type="button" className="toggle-eye" onClick={() => toggleShow("new")}>
              {show.new ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {form.newPassword && (
            <div className="strength-container">
              <div className="strength-bar">
                <div className="strength-fill" style={{ width: `${(strength.score / 5) * 100}%`, background: strength.color }} />
              </div>
              <span className="strength-label" style={{ color: strength.color }}>{strength.label}</span>
            </div>
          )}
        </div>

        {/* CONFIRMER */}
        <div className="form-group">
          <label>{t("confirmPassword")}</label>
          <div className="input-wrapper">
            <FaLock className="input-icon" />
            <input
              type={show.confirm ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder={t("confirmPwdPlaceholder")}
              maxLength={128}
              required
            />
            <button type="button" className="toggle-eye" onClick={() => toggleShow("confirm")}>
              {show.confirm ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {form.confirmPassword && form.newPassword === form.confirmPassword && (
            <div className="match-ok"><FaCheck /> {t("pwdMatch")}</div>
          )}
        </div>

        {/* CRITÈRES */}
        <div className="criteria">
          <p className="criteria-title">{t("pwdCriteriaTitle")}</p>
          <ul>
            <li className={form.newPassword.length >= 8 ? "valid" : ""}>
              {form.newPassword.length >= 8 ? "✅" : "⚪"} {t("pwdCriteria8")}
            </li>
            <li className={/[A-Z]/.test(form.newPassword) ? "valid" : ""}>
              {/[A-Z]/.test(form.newPassword) ? "✅" : "⚪"} {t("pwdCriteriaUpper")}
            </li>
            <li className={/[0-9]/.test(form.newPassword) ? "valid" : ""}>
              {/[0-9]/.test(form.newPassword) ? "✅" : "⚪"} {t("pwdCriteriaNumber")}
            </li>
            <li className={/[^A-Za-z0-9]/.test(form.newPassword) ? "valid" : ""}>
              {/[^A-Za-z0-9]/.test(form.newPassword) ? "✅" : "⚪"} {t("pwdCriteriaSpecial")}
            </li>
          </ul>
        </div>

        {error && <div className="form-error">⚠️ {error}</div>}
        {success && <div className="form-success"><FaCheck /> {t("pwdChanged")}</div>}

        <button type="submit" className="save-btn" disabled={saving}>
          {saving ? t("saving") : `🔐 ${t("changePasswordBtn")}`}
        </button>
      </form>
    </div>
  );
}