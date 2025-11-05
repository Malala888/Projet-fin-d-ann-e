
import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import feather from "feather-icons";
import "aos/dist/aos.css";

/* global Chart */ // Ajoute cette ligne pour que ton éditeur connaisse Chart

function Index() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    students: [],
    projects: [],
    livrables: [],
    statistics: {
      totalStudents: 0,
      activeProjects: 0,
      pendingLivrables: 0,
      completedProjects: 0,
    },
  });
  const location = useLocation();
  const chartRef = useRef(null); // Référence pour le graphique

  useEffect(() => {
    if (window.AOS) window.AOS.init();

    const userData = localStorage.getItem("user");
    const userRole = localStorage.getItem("role");

    if (userData && userRole === "encadreur") {
      const userInfo = JSON.parse(userData);
      setUser(userInfo);
      loadDashboardData(userInfo.Matricule);
    } else {
      window.location.href = "/login";
    }
  }, []);

  // --- NOUVEAU : useEffect pour créer l'histogramme (filtré) ---
  useEffect(() => {
    if (loading) return; // On attend que le chargement soit fini

    // CORRECTION : Filtrer pour ne garder que les projets "En cours"
    const projectsEnCours = dashboardData.projects.filter(
      (p) => p.Status === "En cours"
    );

    if (projectsEnCours.length === 0) {
       // S'il n'y a pas de projets en cours, on détruit l'ancien graphique s'il existe
       if (chartRef.current) {
         chartRef.current.destroy();
         chartRef.current = null;
       }
       // On peut afficher un message ou laisser la zone vide
       const ctx = document.getElementById("projectsChart");
       if(ctx) {
         const context = ctx.getContext('2d');
         context.clearRect(0, 0, ctx.width, ctx.height);
         context.textAlign = 'center';
         context.fillStyle = '#9ca3af'; // text-gray-400
         context.fillText("Aucun projet en cours à afficher", ctx.width / 2, ctx.height / 2);
       }
       return;
    }

    const ctx = document.getElementById("projectsChart");
    if (!ctx) return;

    // Détruire l'ancien graphique avant d'en créer un nouveau
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const projectThemes = projectsEnCours.map(
      (p) => p.Theme.substring(0, 20) + (p.Theme.length > 20 ? "..." : "")
    );
    const projectProgress = projectsEnCours.map((p) => p.Avancement || 0);

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: projectThemes,
        datasets: [
          {
            label: "Avancement des Projets (%)",
            data: projectProgress,
            backgroundColor: "rgba(59, 130, 246, 0.5)",
            borderColor: "rgba(59, 130, 246, 1)",
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function (value) {
                return value + "%";
              },
            },
          },
          x: {
            ticks: {
              autoSkip: false, // Affiche toutes les étiquettes
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: "Avancement des projets en cours", // Titre mis à jour
            font: { size: 16 },
          },
        },
      },
    });

    // Cleanup function pour détruire le graphique quand le composant est démonté
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [loading, dashboardData.projects]); // Garder la dépendance à dashboardData.projects

  // =================================================================
  // ✅ AJOUTER CE USEEFFECT POUR GÉRER LES ICÔNES
  // =================================================================
  useEffect(() => {
    // Cet effet se déclenche après que le chargement est terminé
    // et que les données du dashboard (dashboardData) ont été mises à jour.
    if (!loading) {
      console.log("🚀 Feather.replace() déclenché par la fin du chargement.");
      feather.replace();
    }
  }, [loading, dashboardData]); // Dépend de la fin du chargement et des données
  // =================================================================

  const loadDashboardData = async (encadreurId) => {
    try {
      setLoading(true);

      const [studentsRes, projectsRes, livrablesRes] = await Promise.all([
        axios.get(`http://localhost:5000/encadreurs/${encadreurId}/etudiants`),
        axios.get(`http://localhost:5000/encadreurs/${encadreurId}/projets`),
        axios.get(`http://localhost:5000/encadreurs/${encadreurId}/livrables`),
      ]);

      const students = studentsRes.data || [];
      const projects = projectsRes.data || [];
      const livrables = livrablesRes.data || [];

      // Les statistiques sont maintenant basées sur les statuts automatiques
      const statistics = {
        totalStudents: students.length,
        activeProjects: projects.filter((p) => p.Status === "En cours").length,
        pendingLivrables: livrables.filter(
          (l) => l.Status === "En attente" || l.Status === "Soumis"
        ).length,
        completedProjects: projects.filter((p) => p.Status === "Terminé").length,
      };

      setDashboardData({ students, projects, livrables, statistics });
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setLoading(false);
    }
  };

  const isActive = (path) => {
    return location.pathname === path
      ? "bg-blue-50 text-blue-700"
      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900";
  };

  const profileImageUrl =
    user?.Avatar && !user.Avatar.startsWith("http")
      ? `http://localhost:5000${user.Avatar}?t=${new Date().getTime()}`
      : user?.Avatar || "http://static.photos/people/200x200/1";

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 font-sans min-h-screen">
      <nav className="bg-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                type="button"
                className="md:hidden mr-3 p-2 rounded text-white hover:bg-blue-600"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Ouvrir le menu"
              >
                <i data-feather="menu" className="h-6 w-6"></i>
              </button>

              <i data-feather="book-open" className="h-8 w-8"></i>
              <div className="hidden md:block ml-10 space-x-4">
                <p className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-300 to-white bg-clip-text text-transparent">
                  Gestion de Projet
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center">
                <img
                  className="h-8 w-8 rounded-full"
                  src={profileImageUrl}
                  alt="Profile"
                />
                <span className="ml-2 text-sm font-medium">{user?.Nom || "Utilisateur"}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="bg-white w-64 min-h-screen border-r hidden md:block">
          <div className="p-4 border-b flex items-center">
            <img
              className="h-10 w-10 rounded-full"
              src={profileImageUrl}
              alt="Avatar de l'encadreur"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.Nom || "Encadreur"}</p>
              <p className="text-xs text-gray-500">{user?.Titre || "Titre"}</p>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            <Link to="/index" className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/index")}`}>
              <i data-feather="home" className="mr-3 h-5 w-5"></i> Dashboard
            </Link>
            <Link to="/etudiant" className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/etudiant")}`}>
              <i data-feather="users" className="mr-3 h-5 w-5"></i> Étudiants
            </Link>
            <Link to="/projet" className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/projet")}`}>
              <i data-feather="briefcase" className="mr-3 h-5 w-5"></i> Projets
            </Link>
            <Link to="/calendrier" className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/calendrier")}`}>
              <i data-feather="calendar" className="mr-3 h-5 w-5"></i> Calendrier
            </Link>
            <Link to="/livrable" className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/livrable")}`}>
              <i data-feather="file-text" className="mr-3 h-5 w-5"></i> Livrables
            </Link>
            <div className="mt-8">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Administration
              </h3>
              <div className="mt-1 space-y-1">
                <Link to="/parametre" className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/parametre")}`}>
                  <i data-feather="settings" className="mr-3 h-5 w-5"></i> Paramètres
                </Link>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "/login";
                }}
                className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 w-full text-left"
              >
                <i data-feather="log-out" className="mr-3 h-5 w-5"></i> Déconnexion
              </button>
            </div>
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Tableau de bord</h1>
            <p className="text-gray-600">Bienvenue, {user?.Nom}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <p className="text-sm text-gray-500">Étudiants encadrés</p>
                <p className="text-2xl font-bold">{dashboardData.statistics.totalStudents}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <p className="text-sm text-gray-500">Projets en cours</p>
                <p className="text-2xl font-bold">{dashboardData.statistics.activeProjects}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <p className="text-sm text-gray-500">Livrables en attente</p>
                <p className="text-2xl font-bold">{dashboardData.statistics.pendingLivrables}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <p className="text-sm text-gray-500">Projets terminés</p>
                <p className="text-2xl font-bold">{dashboardData.statistics.completedProjects}</p>
            </div>
          </div>

          {/* --- NOUVELLE SECTION : GRAPHIQUE --- */}
          <div className="mb-8 bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Avancement des Projets</h2>
            <div className="h-80 relative">
              <canvas id="projectsChart"></canvas>
            </div>
          </div>

          {/* --- TABLEAU AMÉLIORÉ --- */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-medium text-gray-900">Vos étudiants encadrés</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Étudiant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Projet Assigné</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avancement</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardData.students.map((student) => (
                    <tr key={student.Immatricule} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {/* CORRECTION : Affichage de l'avatar de l'étudiant */}
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={
                                student.Avatar && !student.Avatar.startsWith("http")
                                  ? `http://localhost:5000${student.Avatar}?t=${new Date().getTime()}`
                                  : student.Avatar || `http://static.photos/people/200x200/${(student.Immatricule % 10) + 2}`
                              }
                              alt={student.Nom}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.Nom}</div>
                            <div className="text-sm text-gray-500">{student.Email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.Nom_projet || <span className="text-gray-400">Non assigné</span>}</div>
                        <div className="text-sm text-gray-500">{student.Niveau} - {student.Filiere}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${student.Avancement || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{student.Avancement || 0}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link to={`/etudiant/${student.Immatricule}`} className="text-indigo-600 hover:text-indigo-900 flex items-center">
                          <i data-feather="eye" className="h-4 w-4 mr-1"></i> Voir Détails
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {dashboardData.students.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                        Vous n'encadrez aucun étudiant pour le moment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Index;
