// src/pages/Dashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";
import feather from "feather-icons";

/* global Chart */

const Dashboard = () => {
  const [etudiant, setEtudiant] = useState(null);
  const [projets, setProjets] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statistiques, setStatistiques] = useState(null);
  const [livrables, setLivrables] = useState([]);
  const [calendrier, setCalendrier] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const chartsRef = useRef({});

  // Récupération des données au montage du composant
  useEffect(() => {
    feather.replace();
    AOS.init({ duration: 800, once: true });

    const storedUser = localStorage.getItem("user");
    const storedRole = localStorage.getItem("role");

    if (!storedUser || storedRole !== "etudiant") {
      navigate("/login");
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      setEtudiant(userData);

      const immatricule = userData.Immatricule;
      const requests = [
        axios.get(`http://localhost:5000/etudiants/${immatricule}/projets`),
        axios.get(
          `http://localhost:5000/etudiants/${immatricule}/statistiques`
        ),
        axios.get(`http://localhost:5000/etudiants/${immatricule}/livrables`),
        axios.get(`http://localhost:5000/etudiants/${immatricule}/calendrier`),
      ];

      // Utilisation de Promise.all pour gérer toutes les requêtes en parallèle
      Promise.all(requests)
        .then(([projetsRes, statsRes, livrablesRes, calendrierRes]) => {
          setProjets(projetsRes.data);
          setStatistiques(statsRes.data);
          setLivrables(livrablesRes.data);
          setCalendrier(calendrierRes.data);
        })
        .catch((error) => {
          console.error("Erreur lors de la récupération des données :", error);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      console.error("Erreur de parsing des données utilisateur :", error);
      localStorage.clear();
      navigate("/login");
    }
  }, [navigate]);

  // Remplacement des icônes Feather à chaque mise à jour
  useEffect(() => {
    feather.replace();
  });

  // useEffect pour la gestion des graphiques (CORRIGÉ)
  useEffect(() => {
    if (loading || !etudiant) return;

    let progressChartInstance = null;
    let gradesChartInstance = null;

    const initCharts = () => {
      const progressCanvas = document.getElementById("progressChart");
      if (progressCanvas) {
        if (chartsRef.current.progressChart) {
          chartsRef.current.progressChart.destroy();
        }

        const progressCtx = progressCanvas.getContext("2d");
        progressChartInstance = new Chart(progressCtx, {
          type: "line",
          data: {
            labels:
              projets.length > 0
                ? projets.slice(0, 6).map((p) => {
                    const date = new Date(p.Date_deb);
                    return date.toLocaleDateString("fr-FR", { month: "short" });
                  })
                : ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"],
            datasets: [
              {
                label: "Progression (%)",
                data:
                  projets.length > 0
                    ? projets.slice(0, 6).map((p) => p.Avancement || 0)
                    : [0, 0, 0, 0, 0, 0],
                borderColor: "rgb(59, 130, 246)",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                fill: true,
                tension: 0.3,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, max: 100 } },
          },
        });
        chartsRef.current.progressChart = progressChartInstance;
      }

      const gradesCanvas = document.getElementById("gradesChart");
      if (gradesCanvas) {
        if (chartsRef.current.gradesChart) {
          chartsRef.current.gradesChart.destroy();
        }

        const gradesCtx = gradesCanvas.getContext("2d");
        gradesChartInstance = new Chart(gradesCtx, {
          type: "bar",
          data: {
            labels:
              livrables && livrables.length > 0
                ? livrables
                    .slice(0, 5)
                    .map((l) => l.Titre || l.Nom || "Livrable")
                : [
                    "Rapport 1",
                    "Maquettes",
                    "Code source",
                    "Présentation",
                    "Rapport final",
                  ],
            datasets: [
              {
                label: "Notes /20",
                data:
                  livrables && livrables.length > 0
                    ? livrables.slice(0, 5).map((l) => {
                        if (l.Status && l.Status.includes("/20")) {
                          const match = l.Status.match(/(\d+(?:\.\d+)?)\/20/);
                          return match ? parseFloat(match[1]) : 0;
                        }
                        return 0;
                      })
                    : [0, 0, 0, 0, 0],
                backgroundColor: [
                  "rgba(59, 130, 246, 0.7)",
                  "rgba(16, 185, 129, 0.7)",
                  "rgba(59, 130, 246, 0.7)",
                  "rgba(245, 158, 11, 0.7)",
                  "rgba(59, 130, 246, 0.7)",
                ],
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, max: 20 } },
          },
        });
        chartsRef.current.gradesChart = gradesChartInstance;
      }
    };

    const timer = setTimeout(initCharts, 100);

    return () => {
      clearTimeout(timer);
      if (progressChartInstance) {
        progressChartInstance.destroy();
      }
      if (gradesChartInstance) {
        gradesChartInstance.destroy();
      }
    };
  }, [etudiant, projets, livrables, loading]);

  // useEffect pour la synchronisation des données utilisateur
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "user" && e.newValue) {
        try {
          const updatedUser = JSON.parse(e.newValue);
          setEtudiant(updatedUser);
        } catch (error) {
          console.error("❌ Erreur lors de la mise à jour des données:", error);
        }
      }
    };

    const handleUserUpdate = (e) => {
      const updatedUser = e.detail;
      setEtudiant(updatedUser);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userProfileUpdated", handleUserUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userProfileUpdated", handleUserUpdate);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const profileImageUrl =
    etudiant?.Image && !etudiant.Image.startsWith("http")
      ? `http://localhost:5000${etudiant.Image}?t=${new Date().getTime()}`
      : etudiant?.Image || "http://static.photos/people/200x200/2";

  // Affichage de l'écran de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl text-gray-700">
          🔄 Chargement du tableau de bord...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 font-sans min-h-screen flex flex-col">
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
              <div className="hidden md:block ml-3 sm:ml-10">
                <p className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-300 to-white bg-clip-text text-transparent">
                  Espace Étudiant
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="group relative">
                <div className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-blue-600 transition">
                  <img
                    className="h-8 w-8 rounded-full"
                    src={profileImageUrl}
                    alt="Profile"
                  />
                  <span className="ml-2 text-sm font-medium">
                    {etudiant.Nom}
                  </span>
                </div>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <i data-feather="log-out" className="mr-2 h-4 w-4"></i>{" "}
                    Déconnexion
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="md:hidden p-2 rounded text-white hover:bg-blue-600"
            >
              <i data-feather="log-out" className="h-6 w-6"></i>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Wrapper */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`sidebar bg-white w-64 min-h-screen border-r ${
            sidebarOpen ? "" : "hidden"
          } md:block absolute md:relative z-20 shadow-xl md:shadow-none transition-transform duration-300 ease-in-out`}
        >
          <div className="p-4 border-b flex items-center">
            <img
              className="h-10 w-10 rounded-full"
              src={profileImageUrl}
              alt="Avatar de l'étudiant"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">
                {etudiant.Nom}
              </p>
              <p className="text-xs text-gray-500">
                Étudiant {etudiant.Niveau}
              </p>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            <Link
              to="/dashboard"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700"
            >
              <i data-feather="home" className="mr-3 h-5 w-5"></i> Tableau de
              bord
            </Link>
            <Link
              to="/mes_projet"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
            >
              <i data-feather="briefcase" className="mr-3 h-5 w-5"></i> Mes
              projets
            </Link>
            <Link
              to="/mes_livrables"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
            >
              <i data-feather="file-text" className="mr-3 h-5 w-5"></i> Mes
              livrables
            </Link>
            <Link
              to="/calendrierEtudiant"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
            >
              <i data-feather="calendar" className="mr-3 h-5 w-5"></i>{" "}
              Calendrier
            </Link>
            <Link
              to="/parametre_etudiant"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
            >
              <i data-feather="settings" className="mr-3 h-5 w-5"></i>{" "}
              Paramètres
            </Link>
            <Link
              to="/"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
            >
              <i data-feather="log-out" className="mr-3 h-5 w-5"></i>{" "}
              Déconnexion
            </Link>
          </nav>
        </aside>

        {/* Contenu principal */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Tableau de bord étudiant
            </h1>
            <p className="text-gray-600">
              Bienvenue sur votre espace de suivi de projet
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="dashboard-card bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <i data-feather="briefcase"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Projets en cours
                  </p>
                  <p className="text-2xl font-semibold text-gray-800">
                    {projets.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="dashboard-card bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <i data-feather="file-text"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Livrables validés
                  </p>
                  <p className="text-2xl font-semibold text-gray-800">
                    {statistiques ? statistiques.livrables_soumis || 0 : 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="dashboard-card bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <i data-feather="clock"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Prochain rendu
                  </p>
                  <p className="text-2xl font-semibold text-gray-800">
                    {calendrier && calendrier.length > 0
                      ? (() => {
                          const prochainLivrable = calendrier
                            .filter((e) => e.type === "Livrable")
                            .sort(
                              (a, b) => new Date(a.date) - new Date(b.date)
                            )[0];
                          if (prochainLivrable) {
                            const today = new Date();
                            const deadline = new Date(prochainLivrable.date);
                            const diffTime = deadline - today;
                            const diffDays = Math.ceil(
                              diffTime / (1000 * 60 * 60 * 24)
                            );
                            return diffDays > 0
                              ? `${diffDays}j`
                              : "Aujourd'hui";
                          }
                          return "N/A";
                        })()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
            <div className="dashboard-card bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <i data-feather="award"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Moyenne générale
                  </p>
                  <p className="text-2xl font-semibold text-gray-800">
                    {livrables && livrables.length > 0
                      ? (() => {
                          const livrablesAvecNotes = livrables.filter(
                            (l) => l.Status && l.Status.includes("/20")
                          );
                          if (livrablesAvecNotes.length > 0) {
                            const notes = livrablesAvecNotes
                              .map((l) => {
                                const match =
                                  l.Status.match(/(\d+(?:\.\d+)?)\/20/);
                                return match ? parseFloat(match[1]) : null;
                              })
                              .filter((n) => n !== null);

                            if (notes.length > 0) {
                              const moyenne =
                                notes.reduce((sum, note) => sum + note, 0) /
                                notes.length;
                              return `${moyenne.toFixed(1)}/20`;
                            }
                          }
                          return "N/A";
                        })()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Deadlines */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Échéances à venir
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {/* Item 1 */}
                  <div className="px-4 py-3 flex items-center hover:bg-gray-50">
                    <div className="flex-shrink-0 bg-red-100 rounded-lg p-3">
                      <i
                        data-feather="alert-circle"
                        className="h-6 w-6 text-red-600"
                      ></i>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-red-600">
                          {calendrier.filter((e) => e.type === "Livrable")[0]
                            ?.title || "Rapport final"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(() => {
                            const echeance = calendrier.filter(
                              (e) => e.type === "Livrable"
                            )[0];
                            if (!echeance) return "Date non définie";
                            const diffDays = Math.ceil(
                              (new Date(echeance.date) - new Date()) /
                                (1000 * 60 * 60 * 24)
                            );
                            return diffDays > 0
                              ? `Dans ${diffDays} jours`
                              : "Aujourd'hui";
                          })()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500">
                        Projet: {projets[0]?.Theme || "Non assigné"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Enseignant: {projets[0]?.Nom_encadreur || "Non assigné"}
                      </p>
                    </div>
                  </div>
                  {/* Item 2 */}
                  <div className="px-4 py-3 flex items-center hover:bg-gray-50">
                    <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                      <i
                        data-feather="clock"
                        className="h-6 w-6 text-yellow-600"
                      ></i>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-yellow-600">
                          {calendrier.filter((e) => e.type === "Livrable")[1]
                            ?.title || "Présentation"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(() => {
                            const echeance = calendrier.filter(
                              (e) => e.type === "Livrable"
                            )[1];
                            if (!echeance) return "Date non définie";
                            const diffDays = Math.ceil(
                              (new Date(echeance.date) - new Date()) /
                                (1000 * 60 * 60 * 24)
                            );
                            return diffDays > 0
                              ? `Dans ${diffDays} jours`
                              : "Aujourd'hui";
                          })()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500">
                        Projet: {projets[0]?.Theme || "Non assigné"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Enseignant: {projets[0]?.Nom_encadreur || "Non assigné"}
                      </p>
                    </div>
                  </div>
                  {/* Item 3 */}
                  <div className="px-4 py-3 flex items-center hover:bg-gray-50">
                    <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                      <i
                        data-feather="calendar"
                        className="h-6 w-6 text-blue-600"
                      ></i>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-600">
                          {calendrier.filter((e) => e.type === "Projet")[0]
                            ?.title || "Réunion de suivi"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(() => {
                            const echeance = calendrier.filter(
                              (e) => e.type === "Projet"
                            )[0];
                            if (!echeance) return "Date non définie";
                            const diffDays = Math.ceil(
                              (new Date(echeance.date) - new Date()) /
                                (1000 * 60 * 60 * 24)
                            );
                            if (diffDays === 1) return "Demain";
                            if (diffDays === 0) return "Aujourd'hui";
                            return `Dans ${diffDays} jours`;
                          })()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500">
                        Projet: {projets[0]?.Theme || "Non assigné"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Enseignant: {projets[0]?.Nom_encadreur || "Non assigné"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 bg-gray-50 text-right">
                  <Link
                    to="/mes_livrables"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    Voir tous les livrables
                  </Link>
                </div>
              </div>
            </div>
            {/* Recent Feedback */}
            <div>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Retours récents
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {livrables.slice(0, 2).map((livrable, index) => (
                    <div className="px-4 py-3" key={index}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <i
                            data-feather="check-circle"
                            className="h-5 w-5 text-green-500"
                          ></i>
                          <p className="ml-2 text-sm font-medium text-gray-900">
                            {livrable.Titre ||
                              livrable.Nom ||
                              "Livrable sans titre"}
                          </p>
                        </div>
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {livrable.Status && livrable.Status.includes("/20")
                            ? livrable.Status.match(/(\d+(?:\.\d+)?)\/20/)[0]
                            : "Validé"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {livrable.Status && !livrable.Status.includes("/20")
                          ? livrable.Status
                          : "Feedback non disponible."}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {projets[0]?.Nom_encadreur || "Encadreur"} -{" "}
                        {new Date(livrable.Date_soumission).toLocaleDateString(
                          "fr-FR"
                        )}
                      </p>
                    </div>
                  ))}
                  {livrables.length === 0 && (
                    <p className="p-4 text-sm text-gray-500">
                      Aucun retour récent à afficher.
                    </p>
                  )}
                </div>
                <div className="px-4 py-3 bg-gray-50 text-right">
                  <Link
                    to="/messagerie"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    Voir tous les retours
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* My Projects */}
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  Mes projets
                </h2>
                <Link
                  to="/mes_projet"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Voir tous
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Projet
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Enseignant
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date de début
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Échéance
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Avancement
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {projets.length > 0 ? (
                      projets.map((p, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {p.Theme}
                            </div>
                            <div className="text-sm text-gray-500">
                              {p.Description}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                className="h-6 w-6 rounded-full mr-2"
                                src="http://static.photos/people/200x200/1"
                                alt=""
                              />
                              <span className="text-sm">{p.Nom_encadreur}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(p.Date_deb).toLocaleDateString("fr-FR")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(p.Date_fin).toLocaleDateString("fr-FR")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${p.Avancement}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {p.Avancement}% complété
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link
                              to={`/projet/${p.Id_projet}`}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              <i data-feather="eye"></i>
                            </Link>
                            <Link
                              to="/messagerie"
                              className="text-green-600 hover:text-green-900"
                            >
                              <i data-feather="message-square"></i>
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-4 text-center text-gray-500 text-sm"
                        >
                          Aucun projet trouvé.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Progress & Grades Charts */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Progression mensuelle
              </h2>
              <div className="h-72">
                <canvas id="progressChart"></canvas>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Répartition des notes
              </h2>
              <div className="h-72">
                <canvas id="gradesChart"></canvas>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
