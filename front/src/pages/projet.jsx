import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import feather from "feather-icons";
import axios from "axios";

const Projet = () => {
  const [user, setUser] = useState(null);
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    AOS.init();

    const userData = localStorage.getItem("user");
    if (userData) {
      const userInfo = JSON.parse(userData);
      setUser(userInfo);

      if (userInfo && userInfo.Matricule) {
        axios.get(`http://localhost:5000/encadreurs/${userInfo.Matricule}/projets`)
          .then(response => {
            setProjets(response.data);
            setLoading(false);
          })
          .catch(error => {
            console.error("Erreur lors du chargement des projets:", error);
            setLoading(false);
          });
      } else {
        window.location.href = "/";
      }
    } else {
        window.location.href = "/";
    }
  }, []);

  // useEffect séparé pour gérer les icônes après le rendu
  useEffect(() => {
    if (window.feather) {
      window.feather.replace();
    }
  });

  const isActive = (path) => {
    return location.pathname === path
      ? "bg-blue-50 text-blue-700"
      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900";
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
    <div className="bg-gray-50 font-sans">
      {/* Navbar */}
      <nav className="bg-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <img src="/icons/logo-icon.svg" alt="Logo" className="h-8 w-8" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
              <i data-feather="book-open" className="h-8 w-8" style={{display: 'none'}}></i>
              <div className="hidden md:block ml-10 space-x-4">
                <p className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-300 to-white bg-clip-text text-transparent">
                  Gestion de Projet
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <button className="p-1 rounded-full text-blue-200 hover:text-white relative">
                <img src="/icons/notification-icon.svg" alt="Notifications" className="h-5 w-5" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                <i data-feather="bell" style={{display: 'none'}}></i>
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
              </button>
              <div className="flex items-center">
                <img
                  className="h-8 w-8 rounded-full"
                  src={user?.Avatar ? `http://localhost:5000${user.Avatar}` : "http://static.photos/people/200x200/1"}
                  alt=""
                  onError={(e) => {
                    e.target.src = "http://static.photos/people/200x200/1";
                  }}
                />
                <span className="ml-2 text-sm font-medium">{user?.Nom || "Encadreur"}</span>
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
              src={user?.Avatar ? `http://localhost:5000${user.Avatar}` : "http://static.photos/people/200x200/1"}
              alt=""
              onError={(e) => {
                e.target.src = "http://static.photos/people/200x200/1";
              }}
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
              <img src="/icons/dashboard-icon.svg" alt="Dashboard" className="mr-3 h-5 w-5" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
              <i data-feather="home" className="mr-3 h-5 w-5" style={{display: 'none'}}></i> Dashboard
            </Link>
            <Link
              to="/etudiant"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                "/etudiant"
              )}`}
            >
              <img src="/icons/students-icon.svg" alt="Étudiants" className="mr-3 h-5 w-5" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
              <i data-feather="users" className="mr-3 h-5 w-5" style={{display: 'none'}}></i> Étudiants
            </Link>
            <Link
              to="/projet"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                "/projet"
              )}`}
            >
              <img src="/icons/projects-icon.svg" alt="Projets" className="mr-3 h-5 w-5" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
              <i data-feather="briefcase" className="mr-3 h-5 w-5" style={{display: 'none'}}></i> Projets
            </Link>
            <Link
              to="/calendrier"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                "/calendrier"
              )}`}
            >
              <img src="/icons/calendar-icon.svg" alt="Calendrier" className="mr-3 h-5 w-5" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
              <i data-feather="calendar" className="mr-3 h-5 w-5" style={{display: 'none'}}></i>{" "}
              Calendrier
            </Link>
            <Link
              to="/livrable"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                "/livrable"
              )}`}
            >
              <img src="/icons/deliverables-icon.svg" alt="Livrables" className="mr-3 h-5 w-5" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
              <i data-feather="file-text" className="mr-3 h-5 w-5" style={{display: 'none'}}></i>{" "}
              Livrables
            </Link>
            <Link
              to="/statistique"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                "/statistique"
              )}`}
            >
              <img src="/icons/statistics-icon.svg" alt="Statistiques" className="mr-3 h-5 w-5" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
              <i data-feather="bar-chart-2" className="mr-3 h-5 w-5" style={{display: 'none'}}></i>{" "}
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
                  <img src="/icons/settings-icon.svg" alt="Paramètres" className="mr-3 h-5 w-5" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                  <i data-feather="settings" className="mr-3 h-5 w-5" style={{display: 'none'}}></i>
                  Paramètres
                </Link>
              </div>
            </div>
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Liste des Projets Encadrés</h1>

          {/* MODIFICATION : Gérer l'état de chargement */}
          {loading ? (
             <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Chargement des projets...</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {projets.length > 0 ? (
              projets.map((projet) => (
                <div key={projet.Id_projet} className="bg-white shadow rounded-lg p-4 text-center transform hover:scale-105 transition-transform duration-200">
                  <div className="h-24 w-24 rounded-full mx-auto mb-3 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <i data-feather="briefcase" className="h-10 w-10 text-white"></i>
                  </div>
                  <h3 className="text-md font-semibold text-gray-800">{projet.Theme}</h3>
                  <p className="text-sm text-gray-500 mt-1">{projet.Description?.substring(0, 100)}...</p>
                  <div className="mt-3 text-xs text-gray-500 space-y-1">
                    <p><strong>Début:</strong> {new Date(projet.Date_deb).toLocaleDateString()}</p>
                    <p><strong>Fin:</strong> {new Date(projet.Date_fin).toLocaleDateString()}</p>
                    <p><strong>Avancement:</strong> {projet.Avancement}%</p>
                  </div>
                  <Link
                    to={`/projet_detail/${projet.Id_projet}`}
                    className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700"
                  >
                    Voir Détails
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-gray-500 col-span-full">Vous n'encadrez aucun projet pour le moment.</p>
            )}
          </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Projet;
