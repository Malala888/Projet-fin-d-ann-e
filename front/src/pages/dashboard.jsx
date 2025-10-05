// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; // 👈 Import de axios pour les requêtes
import AOS from "aos";
import "aos/dist/aos.css";
import feather from "feather-icons";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // 🆕 Ajout d'états pour stocker les données de l'étudiant et ses projets
  const [etudiant, setEtudiant] = useState(null);
  const [projets, setProjets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    feather.replace();
    AOS.init({ duration: 800, once: true });

    // 🕵️‍♂️ Récupération de l'utilisateur stocké
    const storedUser = localStorage.getItem("user");
    const storedRole = localStorage.getItem("role");

    // ❌ Vérification de la connexion
    if (!storedUser || storedRole !== "etudiant") {
      navigate("/login"); // Redirection si l'utilisateur n'est pas un étudiant connecté
      return; // Sortir de useEffect
    }

    try {
      const userData = JSON.parse(storedUser);
      setEtudiant(userData); // Stockage des infos de l'étudiant dans l'état

      // 🔄 Appel à l'API pour récupérer les projets de CET étudiant
      axios.get(`http://localhost:5000/etudiants/${userData.Immatricule}/projets`)
        .then(response => {
          setProjets(response.data);
        })
        .catch(error => {
          console.error("Erreur lors de la récupération des projets :", error);
        });
    } catch (error) {
      console.error("Erreur de parsing des données utilisateur :", error);
      localStorage.clear(); // Vider les données invalides
      navigate("/login");
    }
  }, [navigate]);

  // Si les données de l'étudiant ne sont pas encore chargées, afficher un message de chargement
  if (!etudiant) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl text-gray-700">Chargement du tableau de bord...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 font-sans min-h-screen">
      {/* ... (Le reste du code de la navbar et de la sidebar) ... */}
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
            {/* 🔄 Utilisation du nom de l'étudiant pour la Navbar */}
            <div className="hidden md:flex items-center space-x-4">
              <button className="p-1 rounded-full text-blue-200 hover:text-white relative">
                <i data-feather="bell"></i>
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
              </button>
              <div className="flex items-center">
                <img
                  className="h-8 w-8 rounded-full"
                  src="http://static.photos/people/200x200/2" // A remplacer par une image dynamique si disponible
                  alt="Profile"
                />
                <span className="ml-2 text-sm font-medium">{etudiant.Nom}</span>
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
              src="http://static.photos/people/200x200/2" // A remplacer par une image dynamique
              alt=""
            />
            <div className="ml-3">
              {/* 🔄 Utilisation du nom et du niveau de l'étudiant */}
              <p className="text-sm font-medium text-gray-700">{etudiant.Nom}</p>
              <p className="text-xs text-gray-500">Étudiant {etudiant.Niveau}</p>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            {/* ... (Le reste des liens de la sidebar) ... */}
            <Link to="/dashboard" className="flex items-center px-2 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700">
              <i data-feather="home" className="mr-3 h-5 w-5"></i> Tableau de bord
            </Link>
            <Link to="/mes_projet" className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600">
              <i data-feather="briefcase" className="mr-3 h-5 w-5"></i> Mes projets
            </Link>
            <Link to="/mes_livrables" className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600">
              <i data-feather="file-text" className="mr-3 h-5 w-5"></i> Mes livrables
            </Link>
            <Link to="/calendrierEtudiant" className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600">
              <i data-feather="calendar" className="mr-3 h-5 w-5"></i> Calendrier
            </Link>
            <Link to="/statistique_etudiant" className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600">
              <i data-feather="bar-chart-2" className="mr-3 h-5 w-5"></i> Mes statistiques
            </Link>
            <Link to="/parametre_etudiant" className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600">
              <i data-feather="settings" className="mr-3 h-5 w-5"></i> Paramètres
            </Link>
          </nav>
        </aside>

        {/* Dashboard Content */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            {/* 🔄 Utilisation du nom de l'étudiant dans le titre */}
            <h1 className="text-3xl font-bold text-gray-800">Tableau de bord de {etudiant.Nom}</h1>
            <p className="text-gray-600">Bienvenue sur votre espace de suivi de projet</p>
          </div>

          {/* Stats Cards */}
          {/* Les cartes devront aussi être mises à jour avec des données réelles du backend */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className={`dashboard-card bg-white rounded-lg shadow p-6 hover:shadow-xl hover:-translate-y-1 transition`} data-aos="fade-up">
              <div className="flex items-center">
                <div className={`p-3 rounded-full bg-blue-100 text-blue-600`}>
                  <i data-feather="briefcase"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Projets en cours</p>
                  {/* 🔄 Nombre de projets dynamiques */}
                  <p className="text-2xl font-semibold text-gray-800">{projets.length}</p>
                </div>
              </div>
            </div>
            {/* Les autres cartes devraient être rendues dynamiques de la même façon */}
            {/* ... */}
          </div>

          {/* Mes projets table */}
          <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Mes projets</h2>
              <Link to="/mes_projets" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                Voir tous
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projet</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enseignant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de début</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Échéance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avancement</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* 🔄 Boucle sur les projets dynamiques */}
                  {projets.length > 0 ? (
                    projets.map((p, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{p.Theme}</div>
                          <div className="text-sm text-gray-500">{p.Description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {/* Le nom de l'enseignant n'est pas dans la table projet, il faudra faire une autre requête pour le récupérer */}
                          <span>{p.Id_encadreur}</span> 
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.Date_deb}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.Date_fin}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${p.Avancement}%` }}></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{p.Avancement}% complété</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link to={`/projet/${p.Id_projet}`} className="text-blue-600 hover:text-blue-900 mr-3">
                            <i data-feather="eye"></i>
                          </Link>
                          <Link to="/messagerie" className="text-green-600 hover:text-green-900">
                            <i data-feather="message-square"></i>
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        Aucun projet trouvé.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;