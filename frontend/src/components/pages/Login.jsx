import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("SUBMIT CLICKED");

    if (!email || !password || (!isLogin && !username)) {
      alert("Remplis tous les champs !");
      return;
    }

    try {
      const url = isLogin ? "/api/auth/login" : "/api/auth/register";

      const body = isLogin
        ? { email, password }
        : { name: username, email, password };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Erreur !");
        return;
      }

      console.log("SUCCESS:", data);
      navigate("/profil");
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      alert("Erreur serveur");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isLogin ? "Se connecter" : "S'inscrire"}</h2>

        <form className="login-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
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