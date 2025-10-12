import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import feather from "feather-icons";
import { Link, useLocation } from "react-router-dom";

const Parametres = () => {
  const [switches, setSwitches] = useState([true, true, true, true]);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    AOS.init();
    feather.replace();

    // Récupérer les données utilisateur du localStorage
    const userData = localStorage.getItem("user");
    const userRole = localStorage.getItem("role");

    console.log("🔍 Debug - userData:", userData);
    console.log("🔍 Debug - userRole:", userRole);

    if (userData && userRole === "encadreur") {
      console.log("✅ Utilisateur encadreur autorisé à voir les paramètres");
      setUser(JSON.parse(userData));
    } else {
      console.log("❌ Pas d'utilisateur autorisé, redirection vers login");
      // Rediriger si l'utilisateur n'est pas connecté ou n'est pas un encadreur
      window.location.href = "/login";
    }
  }, []);

  // useEffect séparé pour gérer les icônes après le rendu
  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.feather) {
        window.feather.replace();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const toggleSwitch = (index) => {
    const newSwitches = [...switches];
    newSwitches[index] = !newSwitches[index];
    setSwitches(newSwitches);
  };

  const isActive = (path) => {
    return location.pathname === path
      ? "bg-blue-50 text-blue-700"
      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900";
  };

  const notifications = [
    {
      title: "Notifications par email",
      desc: "Recevoir des notifications importantes par email",
    },
    {
      title: "Nouveaux livrables",
      desc: "Être alerté lorsqu'un étudiant soumet un nouveau livrable",
    },
    {
      title: "Rappels de réunion",
      desc: "Recevoir des rappels avant les réunions programmées",
    },
    {
      title: "Annonces système",
      desc: "Recevoir les annonces importantes de la plateforme",
    },
  ];

  // Si l'utilisateur n'est pas encore chargé, afficher un indicateur de chargement
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 font-sans">
      {/* Navbar */}
      <nav className="bg-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <i data-feather="book-open" className="h-8 w-8"></i>
              <div className="hidden md:block ml-10 space-x-4">
                <p className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-300 to-white bg-clip-text text-transparent">
                  Gestion de Projet
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <button className="p-1 rounded-full text-blue-200 hover:text-white relative">
                <i data-feather="bell"></i>
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
              </button>
              <div className="flex items-center">
                <img
                  className="h-8 w-8 rounded-full"
                  src={user?.Image ? `${user.Image}` : "http://static.photos/people/200x200/1"}
                  alt="Profile"
                />
                <span className="ml-2 text-sm font-medium">{user?.Nom || "Utilisateur"}</span>
                <i data-feather="chevron-down" className="ml-1 h-4 w-4"></i>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
                {/* Sidebar */}
        <aside className="bg-white w-64 min-h-screen border-r hidden md:block">
          <div className="p-4 border-b flex items-center">
            <img
              className="h-10 w-10 rounded-full"
              src={user?.Image ? `${user.Image}` : "http://static.photos/people/200x200/1"}
              alt="Profile"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.Nom || "Utilisateur"}</p>
              <p className="text-xs text-gray-500">{user?.Titre || "Encadreur"}</p>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            <Link
              to="/index"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                "/index"
              )}`}
            >
              <i data-feather="home" className="mr-3 h-5 w-5"></i> Dashboard
            </Link>
            <Link
              to="/etudiant"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                "/etudiant"
              )}`}
            >
              <i data-feather="users" className="mr-3 h-5 w-5"></i> Étudiants
            </Link>
            <Link
              to="/projet"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                "/projet"
              )}`}
            >
              <i data-feather="briefcase" className="mr-3 h-5 w-5"></i> Projets
            </Link>
            <Link
              to="/calendrier"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                "/calendrier"
              )}`}
            >
              <i data-feather="calendar" className="mr-3 h-5 w-5"></i> Calendrier
            </Link>
            <Link
              to="/livrable"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                "/livrable"
              )}`}
            >
              <i data-feather="file-text" className="mr-3 h-5 w-5"></i> Livrables
            </Link>
            <Link
              to="/statistique"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                "/statistique"
              )}`}
            >
              <i data-feather="bar-chart-2" className="mr-3 h-5 w-5"></i>{" "}
              Statistiques
            </Link>
            <div className="mt-8">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Administration
              </h3>
              <div className="mt-1 space-y-1">
                <Link
                  to="/parametre"
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                    "/parametre"
                  )}`}
                >
                  <i data-feather="settings" className="mr-3 h-5 w-5"></i>{" "}
                  Paramètres
                </Link>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Paramètres du compte
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile settings */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Informations personnelles
                  </h2>
                </div>
                <div className="px-6 py-4">
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="prenom"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Prénom
                        </label>
                        <input
                          id="prenom"
                          type="text"
                          defaultValue="John"
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="nom"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Nom
                        </label>
                        <input
                          id="nom"
                          type="text"
                          defaultValue="Doe"
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        defaultValue="john.doe@eni.fr"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="titre"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Titre
                      </label>
                      <input
                        id="titre"
                        type="text"
                        defaultValue="Enseignant"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="departement"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Département
                      </label>
                      <select
                        id="departement"
                        defaultValue="Informatique"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option>Informatique</option>
                        <option>Réseaux et télécommunications</option>
                        <option>Cybersécurité</option>
                        <option>Développement web</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="bio"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        rows="3"
                        defaultValue="Enseignant en développement web avec 10 ans d'expérience. Spécialisé en React et Node.js."
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="pt-4">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Enregistrer les modifications
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Password settings */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Changer le mot de passe
                  </h2>
                </div>
                <div className="px-6 py-4">
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mot de passe actuel
                      </label>
                      <input
                        type="password"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmer le nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="pt-4">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Mettre à jour le mot de passe
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Notification settings */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Préférences de notifications
                  </h2>
                </div>
                <div className="px-6 py-4 space-y-4">
                  {notifications.map((notif, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {notif.title}
                        </p>
                        <p className="text-sm text-gray-500">{notif.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleSwitch(i)}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                          ${switches[i] ? "bg-blue-600" : "bg-gray-200"}`}
                      >
                        <span
                          className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform
                            ${switches[i] ? "translate-x-5" : "translate-x-0"}`}
                        />
                      </button>
                    </div>
                  ))}
                  <div className="pt-4">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      Enregistrer les préférences
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Profile photo */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Photo de profil
                  </h2>
                </div>
                <div className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="mr-4">
                      <img
                        className="h-16 w-16 rounded-full"
                        src="http://static.photos/people/200x200/1"
                        alt="Profile"
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm">
                        Changer la photo
                      </button>
                      <button className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm">
                        Supprimer
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">
                    Formats recommandés: JPG, PNG ou GIF. Taille max: 5MB.
                  </p>
                </div>
              </div>

              {/* Informations du système */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Informations du système
                  </h2>
                </div>
                <div className="px-6 py-4 space-y-4">
                  <p className="text-sm text-gray-700">
                    Version de l'application: 1.0.0
                  </p>
                  <p className="text-sm text-gray-700">
                    Système d'exploitation: Windows 11
                  </p>
                  <p className="text-sm text-gray-700">
                    Navigateur: Chrome 116
                  </p>
                  <p className="text-sm text-gray-700">
                    Dernière connexion: 23/09/2025 18:00
                  </p>
                </div>
              </div>

              {/* Préférences du compte */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Préférences du compte
                  </h2>
                </div>
                <div className="px-6 py-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Langue
                    </label>
                    <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      <option selected>Français</option>
                      <option>English</option>
                      <option>Español</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fuseau horaire
                    </label>
                    <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      <option selected>Europe/Paris (UTC+1)</option>
                      <option>UTC</option>
                      <option>America/New_York (UTC-5)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Format de date
                    </label>
                    <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      <option selected>JJ/MM/AAAA</option>
                      <option>MM/DD/YYYY</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="bg-white shadow rounded-lg overflow-hidden border border-red-200">
                <div class="px-6 py-4 border-b border-red-200 bg-red-50">
                  <h2 class="text-lg font-medium text-red-800">
                    Zone de danger
                  </h2>
                </div>
                <div class="px-6 py-4 space-y-2">
                  <p class="text-sm text-gray-600 mb-4">
                    Une fois que vous supprimez votre compte, il n'y a pas de
                    retour en arrière. Soyez certain.
                  </p>
                  <div class="space-y-2">
                    <button class="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm">
                      Exporter mes données
                    </button>
                    <button class="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">
                      Supprimer mon compte
                    </button>
                  </div>
                </div>
              </div>

              <div class="bg-white shadow rounded-lg overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200">
                  <h2 class="text-lg font-medium text-gray-900">
                    Informations système
                  </h2>
                </div>
                <div class="px-6 py-4 space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-500">Version de l'application</span>
                    <span class="text-gray-900">2.3.1</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Dernière connexion</span>
                    <span class="text-gray-900">18/05/2023 10:24</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Statut du compte</span>
                    <span class="text-green-600">Actif</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Rôle</span>
                    <span class="text-gray-900">Enseignant</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Parametres;
