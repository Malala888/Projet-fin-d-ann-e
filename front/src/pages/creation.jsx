import React, { useEffect, useState } from "react";

function Register() {
  const [role, setRole] = useState(""); // rôle choisi
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" ou "error"

  useEffect(() => {
    if (window.feather) {
      window.feather.replace();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    // Récupérer les valeurs du formulaire
    const formData = new FormData(e.target);
    const matricule = formData.get('matricule');
    const nom = formData.get('nom');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const filiere = formData.get('filiere');
    const parcours = formData.get('parcours');
    const niveau = formData.get('niveau');
    const titre = formData.get('titre');

    // Validation côté client
    if (password !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas");
      setMessageType("error");
      setIsLoading(false);
      return;
    }

    if (!role) {
      setMessage("Veuillez choisir un rôle");
      setMessageType("error");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matricule: parseInt(matricule),
          nom,
          email,
          password,
          confirmPassword,
          role,
          ...(role === 'etudiant' && { filiere, parcours, niveau }),
          ...(role === 'encadreur' && { titre })
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
        setMessageType("success");
        // Réinitialiser le formulaire
        e.target.reset();
        setRole("");
      } else {
        setMessage(data.error || "Erreur lors de la création du compte");
        setMessageType("error");
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage("Erreur de connexion au serveur");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

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

        <form className="space-y-6" onSubmit={handleSubmit}>
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

          {/* Message d'erreur ou de succès */}
          {message && (
            <div className={`p-4 rounded-md ${messageType === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
              <div className="flex">
                <i data-feather={messageType === 'success' ? 'check-circle' : 'alert-circle'} className="h-5 w-5 mr-2"></i>
                <span>{message}</span>
              </div>
            </div>
          )}

          {/* Bouton */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none`}
            >
              {isLoading ? (
                <>
                  <i data-feather="loader" className="animate-spin h-4 w-4 mr-2"></i>
                  Création en cours...
                </>
              ) : (
                'Créer mon compte'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
