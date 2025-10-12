// src/pages/livrable.jsx
import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import feather from "feather-icons";
// Import Link from react-router-dom
import { Link } from "react-router-dom";

const Livrable = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    AOS.init();
    feather.replace();

    // Récupérer les données utilisateur du localStorage
    const userData = localStorage.getItem("user");
    const userRole = localStorage.getItem("role");

    console.log("🔍 Debug - userData:", userData);
    console.log("🔍 Debug - userRole:", userRole);

    if (userData && userRole === "encadreur") {
      console.log("✅ Utilisateur encadreur autorisé à voir les livrables");
      setUser(JSON.parse(userData));
    } else {
      console.log("❌ Pas d'utilisateur autorisé, redirection vers login");
      // Rediriger si l'utilisateur n'est pas connecté ou n'est pas un encadreur
      window.location.href = "/login";
    }
  }, []);

  // useEffect séparé pour gérer les icônes après le rendu
  useEffect(() => {
    if (window.feather) {
      window.feather.replace();
    }
  });

  const livrables = [
    {
      nom: "Rapport intermédiaire",
      type: "PDF - 2.4 MB",
      etudiant: "Jean Dupont",
      avatar: "http://static.photos/people/200x200/2",
      projet: "Système de gestion académique",
      date: "15/05/2023",
      statut: "Validé",
      statutColor: "green",
    },
    {
      nom: "Cahier des charges",
      type: "DOCX - 1.1 MB",
      etudiant: "Marie Martin",
      avatar: "http://static.photos/people/200x200/3",
      projet: "Plateforme e-learning",
      date: "14/05/2023",
      statut: "En attente",
      statutColor: "yellow",
    },
    {
      nom: "Présentation",
      type: "PPTX - 3.7 MB",
      etudiant: "Groupe L1-04",
      avatar: "http://static.photos/people/200x200/4",
      projet: "Application mobile",
      date: "12/05/2023",
      statut: "En retard",
      statutColor: "red",
    },
    {
      nom: "Code source",
      type: "ZIP - 8.7 MB",
      etudiant: "Jean Dupont",
      avatar: "http://static.photos/people/200x200/2",
      projet: "Système de gestion académique",
      date: "25/05/2023",
      statut: "À venir",
      statutColor: "blue",
    },
  ];

  const getStatutClasses = (color) => {
    const colors = {
      green: "bg-green-100 text-green-800",
      yellow: "bg-yellow-100 text-yellow-800",
      red: "bg-red-100 text-red-800",
      blue: "bg-blue-100 text-blue-800",
    };
    return `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[color]}`;
  };

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
    <div className="bg-gray-50 font-sans min-h-screen">
      {/* Navbar */}
      <nav className="bg-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <i data-feather="book-open" className="h-8 w-8"></i>
              <div className="hidden md:block ml-10">
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
                  alt="Profil"
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
        <aside className="bg-white w-64 min-h-screen border-r hidden md:block">
          <div className="p-4 border-b flex items-center">
            <img
              className="h-10 w-10 rounded-full"
              src={user?.Image ? `${user.Image}` : "http://static.photos/people/200x200/1"}
              alt="Profil"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.Nom || "Utilisateur"}</p>
              <p className="text-xs text-gray-500">{user?.Titre || "Encadreur"}</p>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            {/* Remplacer les balises <a> par des balises <Link> */}
            <Link
              to="/index"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50"
            >
              <i data-feather="home" className="mr-3 h-5 w-5"></i> Dashboard
            </Link>
            <Link
              to="/etudiant"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50"
            >
              <i data-feather="users" className="mr-3 h-5 w-5"></i> Étudiants
            </Link>
            <Link
              to="/projet"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50"
            >
              <i data-feather="briefcase" className="mr-3 h-5 w-5"></i> Projets
            </Link>
            <Link
              to="/calendrier"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50"
            >
              <i data-feather="calendar" className="mr-3 h-5 w-5"></i> Calendrier
            </Link>
            <Link
              to="/livrable"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700"
            >
              <i data-feather="file-text" className="mr-3 h-5 w-5"></i> Livrables
            </Link>
            <Link
              to="/statistique"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50"
            >
              <i data-feather="bar-chart-2" className="mr-3 h-5 w-5"></i> Statistiques
            </Link>
            <div className="mt-8">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Administration
              </h3>
              <div className="mt-1 space-y-1">
                <Link
                  to="/parametre"
                  className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  <i data-feather="settings" className="mr-3 h-5 w-5"></i>
                  Paramètres
                </Link>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Gestion des livrables
            </h1>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
              <i data-feather="plus" className="mr-2 h-4 w-4"></i> Nouveau livrable
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rechercher
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher un livrable..."
                    className="w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <i
                    data-feather="search"
                    className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  ></i>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filtrer par statut
                </label>
                <select className="w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option>Tous les statuts</option>
                  <option>En attente</option>
                  <option>Validé</option>
                  <option>En retard</option>
                  <option>À corriger</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filtrer par étudiant
                </label>
                <select className="w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option>Tous les étudiants</option>
                  <option>Jean Dupont</option>
                  <option>Marie Martin</option>
                  <option>Groupe L1-04</option>
                </select>
              </div>
              <div className="flex items-end">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                  Appliquer
                </button>
              </div>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: "Total des livrables", value: 24, icon: "file-text", color: "blue" },
              { label: "En attente", value: 8, icon: "clock", color: "yellow" },
              { label: "Validés", value: 12, icon: "check-circle", color: "green" },
              { label: "En retard", value: 4, icon: "alert-triangle", color: "red" },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-full bg-${card.color}-100 text-${card.color}-600`}>
                    <i data-feather={card.icon}></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">{card.label}</p>
                    <p className="text-2xl font-semibold text-gray-800">{card.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Livrable</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Étudiant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projet</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date d'échéance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {livrables.map((livrable, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <i data-feather="file-text" className="h-5 w-5 text-gray-400 mr-2"></i>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{livrable.nom}</div>
                          <div className="text-sm text-gray-500">{livrable.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="h-8 w-8 rounded-full mr-2"
                          src={livrable.avatar}
                          alt={livrable.etudiant}
                        />
                        <div className="text-sm text-gray-900">{livrable.etudiant}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {livrable.projet}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {livrable.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatutClasses(livrable.statutColor)}>
                        {livrable.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        type="button"
                        aria-label="Télécharger"
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <i data-feather="download" className="h-4 w-4"></i>
                      </button>

                      <button
                        type="button"
                        aria-label="Voir"
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        <i data-feather="eye" className="h-4 w-4"></i>
                      </button>

                      <button
                        type="button"
                        aria-label="Éditer"
                        className="text-purple-600 hover:text-purple-900"
                      >
                        <i data-feather="edit" className="h-4 w-4"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Livrable;