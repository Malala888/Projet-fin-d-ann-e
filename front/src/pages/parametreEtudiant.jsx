import React, { useEffect, useState } from "react";
import feather from "feather-icons";
import { Link } from "react-router-dom"; // Assurez-vous d'avoir bien importé Link

const ParametreEtudiant = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    feather.replace();
    // Initialize AOS if needed, based on your `projet.jsx` file
    if (window.AOS) {
      window.AOS.init();
    }
  }, [sidebarOpen]);

  return (
    <div className="bg-gray-50 font-sans">
      {/* Navbar */}
      <nav className="bg-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                type="button"
                className="md:hidden mr-3 p-2 rounded text-white hover:bg-blue-600"
                onClick={() => setSidebarOpen((s) => !s)}
                aria-label="Toggle menu"
              >
                <i data-feather="menu" className="h-6 w-6" />
              </button>
              <i data-feather="book-open" className="h-8 w-8"></i>
              <div className="hidden md:block ml-10">
                <p className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-300 to-white bg-clip-text text-transparent">
                  Espace Étudiant
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
                  src="http://static.photos/people/200x200/2"
                  alt="Profile"
                />
                <span className="ml-2 text-sm font-medium">Jean Dupont</span>
                <i data-feather="chevron-down" className="ml-1 h-4 w-4"></i>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`sidebar bg-white w-64 min-h-screen border-r ${sidebarOpen ? "" : "hidden"} md:block`}>
          <div className="p-4 border-b flex items-center">
            <img
              className="h-10 w-10 rounded-full"
              src="http://static.photos/people/200x200/2"
              alt=""
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Jean Dupont</p>
              <p className="text-xs text-gray-500">Étudiant M1</p>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            <Link
              to="/dashboard"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
            >
              <i data-feather="home" className="mr-3 h-5 w-5"></i> Tableau de bord
            </Link>
            <Link
              to="/mes_projet"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
            >
              <i data-feather="briefcase" className="mr-3 h-5 w-5"></i> Mes projets
            </Link>
            <Link
              to="/mes_livrables"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
            >
              <i data-feather="file-text" className="mr-3 h-5 w-5"></i> Mes livrables
            </Link>
            <Link
              to="/calendrierEtudiant"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
            >
              <i data-feather="calendar" className="mr-3 h-5 w-5"></i> Calendrier
            </Link>
            <Link
              to="/statistique_etudiant"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
            >
              <i data-feather="bar-chart-2" className="mr-3 h-5 w-5"></i> Mes statistiques
            </Link>
            <Link
              to="/parametre_etudiant"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700"
            >
              <i data-feather="settings" className="mr-3 h-5 w-5"></i> Paramètres
            </Link>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Paramètres de mon compte</h1>

          {/* Profil */}
          <section className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Informations personnelles</h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom complet</label>
                <input id="nom" type="text" value="Jean Dupont" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"/>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Adresse email</label>
                <input id="email" type="email" value="jean.dupont@example.com" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"/>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
                <input id="password" type="password" value="password123" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"/>
              </div>
              <div>
                <label htmlFor="photo" className="block text-sm font-medium text-gray-700">Photo de profil</label>
                <input id="photo" type="file" className="mt-1 block w-full text-sm text-gray-500"/>
              </div>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Enregistrer
              </button>
            </form>
          </section>

          {/* Préférences */}
          <section className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Préférences</h2>
            <form className="space-y-4">
              <div className="flex items-center">
                <input id="notif" type="checkbox" checked className="h-4 w-4 text-blue-600 border-gray-300 rounded"/>
                <label htmlFor="notif" className="ml-2 text-sm text-gray-700">Activer les notifications</label>
              </div>
              <div>
                <label htmlFor="theme" className="block text-sm font-medium text-gray-700">Thème</label>
                <select id="theme" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                  <option>Clair</option>
                  <option>Sombre</option>
                </select>
              </div>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Sauvegarder les préférences
              </button>
            </form>
          </section>

          {/* Infos académiques */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Informations académiques</h2>
            <ul className="space-y-2 text-sm text-gray-700">
              <li><strong>Niveau :</strong> Master 1</li>
              <li><strong>Spécialité :</strong> Informatique - Développement Web</li>
              <li><strong>Année académique :</strong> 2023-2024</li>
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ParametreEtudiant;