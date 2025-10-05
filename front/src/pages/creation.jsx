import React, { useEffect, useState } from "react";

function Register() {
  const [role, setRole] = useState(""); // rôle choisi

  useEffect(() => {
    if (window.feather) {
      window.feather.replace();
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center register-bg">
      {/* Styles intégrés */}
      <style>
        {`
          .register-bg {
            background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('http://static.photos/education/1200x630/1');
            background-size: cover;
            background-position: center;
          }
          .register-card {
            backdrop-filter: blur(10px);
            background-color: rgba(255, 255, 255, 0.85);
          }
        `}
      </style>

      {/* Carte Register */}
      <div className="register-card max-w-lg w-full p-8 rounded-lg shadow-2xl">
        <div className="text-center mb-8">
          <i data-feather="user-plus" className="h-12 w-12 text-blue-600 mx-auto"></i>
          <h1 className="text-3xl font-bold text-gray-800 mt-4">
            Création de compte
          </h1>
          <p className="text-gray-600 mt-2">
            Remplissez les informations pour créer un compte
          </p>
        </div>

        <form className="space-y-6">
          {/* Matricule */}
          <div>
            <label htmlFor="matricule" className="block text-sm font-medium text-gray-700">
              Matricule
            </label>
            <input
              id="matricule"
              name="matricule"
              type="text"
              required
              className="mt-1 block w-full py-3 px-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Nom */}
          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
              Nom complet
            </label>
            <input
              id="nom"
              name="nom"
              type="text"
              required
              className="mt-1 block w-full py-3 px-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Adresse email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 block w-full py-3 px-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full py-3 px-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="mt-1 block w-full py-3 px-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Rôle
            </label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="mt-1 block w-full py-3 px-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Choisir un rôle --</option>
              <option value="etudiant">Étudiant</option>
              <option value="encadreur">Encadreur</option>
            </select>
          </div>

          {/* Champs Étudiant */}
          {role === "etudiant" && (
            <>
              <div>
                <label htmlFor="filiere" className="block text-sm font-medium text-gray-700">
                  Filière
                </label>
                <input
                  id="filiere"
                  name="filiere"
                  type="text"
                  required
                  className="mt-1 block w-full py-3 px-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="parcours" className="block text-sm font-medium text-gray-700">
                  Parcours
                </label>
                <input
                  id="parcours"
                  name="parcours"
                  type="text"
                  required
                  className="mt-1 block w-full py-3 px-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="niveau" className="block text-sm font-medium text-gray-700">
                  Niveau
                </label>
                <input
                  id="niveau"
                  name="niveau"
                  type="text"
                  required
                  className="mt-1 block w-full py-3 px-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </>
          )}

          {/* Champs Encadreur */}
          {role === "encadreur" && (
            <div>
              <label htmlFor="titre" className="block text-sm font-medium text-gray-700">
                Titre (Dr, Prof, etc.)
              </label>
              <input
                id="titre"
                name="titre"
                type="text"
                required
                className="mt-1 block w-full py-3 px-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Bouton */}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              Créer mon compte
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
