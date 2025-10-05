// src/components/Login.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Login() {
  const [role, setRole] = useState("etudiant");
  const [error, setError] = useState("");

  useEffect(() => {
    // Initialise Feather Icons
    if (window.feather) {
      window.feather.replace();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    setError(""); // Réinitialise le message d'erreur

    try {
      // 🚀 Envoi de l'email, du mot de passe et du rôle au backend
      const res = await axios.post("http://localhost:5000/login", {
        email,
        password,
        role,
      });

      console.log("Connexion réussie :", res.data);
      
      // 💾 Stockage des données de l'utilisateur et de son rôle dans le localStorage
      // Ces données incluent l'ID (Immatricule, Matricule, Id_admin)
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("role", res.data.role);

      // ➡️ Redirection selon le rôle de l'utilisateur
      if (res.data.role === "encadreur") {
        window.location.href = "http://localhost:3001/index";
      } else if (res.data.role === "etudiant") {
        window.location.href = "http://localhost:3001/dashboard";
      } else if (res.data.role === "admin") {
        window.location.href = "http://localhost:3001/admin/users";
      }
    } catch (err) {
      console.error("Erreur de connexion :", err);
      // Gère les erreurs de connexion du backend
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Une erreur est survenue. Veuillez vérifier la connexion au serveur.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center login-bg">
      <style>{`
        .login-bg {
          background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('http://static.photos/education/1200x630/1');
          background-size: cover;
          background-position: center;
        }
        .login-card {
          backdrop-filter: blur(10px);
          background-color: rgba(255, 255, 255, 0.85);
        }
      `}</style>
      <div className="login-card max-w-md w-full p-8 rounded-lg shadow-2xl">
        <div className="text-center mb-8">
          <i data-feather="book-open" className="h-12 w-12 text-blue-600 mx-auto"></i>
          <h1 className="text-3xl font-bold text-gray-800 mt-4">
            ENI Academic Manager
          </h1>
          <p className="text-gray-600 mt-2">Connectez-vous à votre espace</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700">Se connecter en tant que</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="etudiant">Étudiant</option>
              <option value="encadreur">Encadreur</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Adresse email ENI</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md py-3 px-3 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md py-3 px-3 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Se connecter
            </button>
          </div>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Pas encore de compte ?{" "}
            <Link className="text-blue-600 hover:text-blue-500" to="/creation">
              Créez-en un
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;