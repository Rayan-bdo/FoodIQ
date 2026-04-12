import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email && password) {
      if (isLogin) {
        // LOGIN
        localStorage.setItem("user", JSON.stringify({ email }));
        navigate("/profil");
      } else {
        // REGISTER
        localStorage.setItem("user", JSON.stringify({ email, username }));
        navigate("/profil");
      }
    } else {
      alert("Remplis tous les champs !");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <h2>{isLogin ? "Se connecter" : "S'inscrire"}</h2>

        <form onSubmit={handleSubmit} className="login-form">

          {!isLogin && (
            <input
              type="text"
              placeholder="Nom d'utilisateur"
              onChange={(e) => setUsername(e.target.value)}
            />
          )}

          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Mot de passe"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">
            {isLogin ? "Connexion" : "Créer un compte"}
          </button>
        </form>

        <p
          onClick={() => setIsLogin(!isLogin)}
          style={{ cursor: "pointer", color: "#2ecc71", marginTop: "10px" }}
        >
          {isLogin
            ? "Pas de compte ? S'inscrire"
            : "Déjà un compte ? Se connecter"}
        </p>

      </div>
    </div>
  );
}