// src/pages/projet.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Projet = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // overview | documents | meetings | comments

  useEffect(() => {
    // Initialize feather icons (CDN)
    if (window.feather) {
      window.feather.replace();
    }
    // Initialize AOS (CDN)
    if (window.AOS) {
      window.AOS.init();
    }
  }, [activeTab, sidebarOpen]); // refaire si on change de tab (pour assurer icônes)

  return (
    <div className="bg-gray-50 font-sans min-h-screen">
      {/* Styles intégrés */}
      <style>
        {`
          .progress-bar {
            transition: width 0.5s ease-in-out;
          }
          .timeline-item:not(:last-child):after {
            content: '';
            position: absolute;
            left: 7px;
            top: 24px;
            height: 100%;
            width: 2px;
            background: #e5e7eb;
          }
          .nav-tab.active {
            border-bottom-color: #3b82f6;
            color: #3b82f6;
          }
          .stat-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
          }
          /* small helper for group-hover downloads */
          .group:hover .group-hover-show {
            opacity: 1;
          }
          .group .group-hover-show {
            opacity: 0;
            transition: opacity .2s;
          }
        `}
      </style>

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

              <i data-feather="book-open" className="h-8 w-8" />
              <div className="hidden md:block ml-10">
                <p className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-300 to-white bg-clip-text text-transparent">
                  Gestion de Projet
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <button className="p-1 rounded-full text-blue-200 hover:text-white relative" type="button">
                <i data-feather="bell" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
              </button>

              <div className="flex items-center">
                <img
                  className="h-8 w-8 rounded-full"
                  src="http://static.photos/people/200x200/1"
                  alt="Profile"
                />
                <span className="ml-2 text-sm font-medium">John Doe</span>
                <i data-feather="chevron-down" className="ml-1 h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Layout */}
      <div className="flex">
        {/* Sidebar */}
        <aside
  className={`sidebar bg-white w-64 min-h-screen border-r ${sidebarOpen ? "" : "hidden"} md:block`}
>
  <div className="p-4 border-b flex items-center">
    <img className="h-10 w-10 rounded-full" src="http://static.photos/people/200x200/1" alt="Profile" />
    <div className="ml-3">
      <p className="text-sm font-medium text-gray-700">John Doe</p>
      <p className="text-xs text-gray-500">Enseignant</p>
    </div>
  </div>

  <nav className="p-4 space-y-1">
    <Link
      to="/index"
      className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
    >
      <i data-feather="home" className="mr-3 h-5 w-5" /> Dashboard
    </Link>

    <Link
      to="/etudiant"
      className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
    >
      <i data-feather="users" className="mr-3 h-5 w-5" /> Étudiants
    </Link>

    <Link
      to="/projet"
      className="flex items-center px-2 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700"
    >
      <i data-feather="briefcase" className="mr-3 h-5 w-5" /> Projets
    </Link>

    <Link
      to="/calendrier"
      className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
    >
      <i data-feather="calendar" className="mr-3 h-5 w-5" /> Calendrier
    </Link>

    <Link
      to="/livrable"
      className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
    >
      <i data-feather="file-text" className="mr-3 h-5 w-5" /> Livrables
    </Link>

    <Link
      to="/statistique"
      className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
    >
      <i data-feather="bar-chart-2" className="mr-3 h-5 w-5" /> Statistiques
    </Link>

    <div className="mt-8">
      <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Administration</h3>
      <div className="mt-1 space-y-1">
        <Link
          to="/parametre"
          className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          <i data-feather="settings" className="mr-3 h-5 w-5" /> Paramètres
        </Link>
      </div>
    </div>
  </nav>
</aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Système de gestion académique</h1>
              <div className="flex items-center mt-2">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">M1</span>
                <span className="ml-3 text-sm text-gray-600 flex items-center">
                  <img className="h-5 w-5 rounded-full mr-2" src="http://static.photos/people/200x200/2" alt="Student" />
                  Jean Dupont
                </span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button type="button" className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center">
                <i data-feather="message-square" className="mr-2 h-4 w-4" /> Message
              </button>
              <button type="button" className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 flex items-center">
                <i data-feather="calendar" className="mr-2 h-4 w-4" /> Nouvelle réunion
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="stat-card bg-white rounded-lg shadow p-6 transition duration-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <i data-feather="clock" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Début</p>
                  <p className="text-lg font-semibold text-gray-800">15/03/2023</p>
                </div>
              </div>
            </div>

            <div className="stat-card bg-white rounded-lg shadow p-6 transition duration-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <i data-feather="flag" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Fin prévue</p>
                  <p className="text-lg font-semibold text-gray-800">30/06/2023</p>
                </div>
              </div>
            </div>

            <div className="stat-card bg-white rounded-lg shadow p-6 transition duration-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <i data-feather="trending-up" />
                </div>
                <div className="ml-4 w-full">
                  <p className="text-sm font-medium text-gray-500">Avancement</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                    <div className="progress-bar bg-blue-600 h-2.5 rounded-full" style={{ width: "65%" }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">65% complété</p>
                </div>
              </div>
            </div>

            <div className="stat-card bg-white rounded-lg shadow p-6 transition duration-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <i data-feather="alert-triangle" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Statut</p>
                  <p className="text-lg font-semibold text-gray-800">En cours</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`nav-tab whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "overview" ? "active border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
              >
                Aperçu
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("documents")}
                className={`nav-tab whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "documents" ? "active border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
              >
                Documents
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("meetings")}
                className={`nav-tab whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "meetings" ? "active border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
              >
                Réunions
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("comments")}
                className={`nav-tab whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "comments" ? "active border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
              >
                Commentaires
              </button>
            </nav>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left / Center */}
            <div className="lg:col-span-2 space-y-6">
              {/* Overview tab content */}
              {activeTab === "overview" && (
                <>
                  {/* Description */}
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-lg font-medium text-gray-900">Description du projet</h2>
                    </div>
                    <div className="px-6 py-4">
                      <p className="text-gray-700 leading-relaxed">
                        Développement d'un système complet de gestion académique pour l'ENI permettant de suivre les projets des étudiants, les encadrements par les enseignants, les livrables et les échéances. Le système inclura un espace pour chaque rôle (étudiant, enseignant, administration) avec des fonctionnalités adaptées.
                      </p>

                      <div className="mt-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Technologies utilisées</h3>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1.5 text-xs rounded-full bg-blue-100 text-blue-800 font-medium">React</span>
                          <span className="px-3 py-1.5 text-xs rounded-full bg-green-100 text-green-800 font-medium">Node.js</span>
                          <span className="px-3 py-1.5 text-xs rounded-full bg-purple-100 text-purple-800 font-medium">MySQL</span>
                          <span className="px-3 py-1.5 text-xs rounded-full bg-yellow-100 text-yellow-800 font-medium">Tailwind CSS</span>
                          <span className="px-3 py-1.5 text-xs rounded-full bg-red-100 text-red-800 font-medium">Express.js</span>
                          <span className="px-3 py-1.5 text-xs rounded-full bg-indigo-100 text-indigo-800 font-medium">MongoDB</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-lg font-medium text-gray-900">Échéances importantes</h2>
                    </div>
                    <div className="px-6 py-4">
                      <div className="space-y-8">
                        <div className="relative timeline-item pl-6">
                          <div className="absolute left-0 top-0 flex items-center justify-center w-5 h-5 rounded-full bg-blue-100">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                          </div>
                          <div className="ml-5">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-blue-600">Cahier des charges validé</p>
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">15/03/2023</span>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">Première version du cahier des charges soumise et validée</p>
                          </div>
                        </div>

                        <div className="relative timeline-item pl-6">
                          <div className="absolute left-0 top-0 flex items-center justify-center w-5 h-5 rounded-full bg-green-100">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-600" />
                          </div>
                          <div className="ml-5">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-green-600">Maquettes UI/UX</p>
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">30/03/2023</span>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">Validation des maquettes d'interface utilisateur</p>
                          </div>
                        </div>

                        <div className="relative timeline-item pl-6">
                          <div className="absolute left-0 top-0 flex items-center justify-center w-5 h-5 rounded-full bg-yellow-100">
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                          </div>
                          <div className="ml-5">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-yellow-600">Rapport intermédiaire</p>
                              <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">15/05/2023</span>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">Rapport d'avancement à mi-parcours</p>
                          </div>
                        </div>

                        <div className="relative timeline-item pl-6">
                          <div className="absolute left-0 top-0 flex items-center justify-center w-5 h-5 rounded-full bg-gray-100">
                            <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                          </div>
                          <div className="ml-5">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-600">Soutenance finale</p>
                              <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">30/06/2023</span>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">Présentation du projet devant le jury</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Documents tab */}
              {activeTab === "documents" && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Fichiers récents</h2>
                  </div>
                  <div className="px-6 py-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between group">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <i data-feather="file-text" className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">Rapport_intermediaire.pdf</p>
                            <p className="text-xs text-gray-500">2.4 MB</p>
                          </div>
                        </div>
                        <button type="button" className="group-hover-show p-1 rounded hover:bg-gray-100">
                          <i data-feather="download" className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between group">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <i data-feather="file" className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 group-hover:text-green-600">Maquettes_Figma.zip</p>
                            <p className="text-xs text-gray-500">5.1 MB</p>
                          </div>
                        </div>
                        <button type="button" className="group-hover-show p-1 rounded hover:bg-gray-100">
                          <i data-feather="download" className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between group">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <i data-feather="code" className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 group-hover:text-purple-600">Backend_API.zip</p>
                            <p className="text-xs text-gray-500">8.7 MB</p>
                          </div>
                        </div>
                        <button type="button" className="group-hover-show p-1 rounded hover:bg-gray-100">
                          <i data-feather="download" className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>

                      <div className="mt-4 text-center">
                        <button type="button" className="text-sm font-medium text-blue-600 hover:text-blue-500 inline-flex items-center">
                          Voir tous les fichiers
                          <i data-feather="chevron-right" className="ml-1 h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Meetings tab */}
              {activeTab === "meetings" && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Prochaines réunions</h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    <div className="px-6 py-4 flex items-center hover:bg-gray-50">
                      <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                        <i data-feather="calendar" className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-blue-600">Réunion de suivi</p>
                          <p className="text-sm text-gray-500">10:00 - 10:30</p>
                        </div>
                        <p className="text-sm text-gray-500">Projet: Système de gestion académique</p>
                        <p className="text-sm text-gray-500">Étudiant: Jean Dupont (M1)</p>
                      </div>
                    </div>

                    <div className="px-6 py-4 flex items-center hover:bg-gray-50">
                      <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                        <i data-feather="calendar" className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-green-600">Soutenance</p>
                          <p className="text-sm text-gray-500">14:00 - 15:00</p>
                        </div>
                        <p className="text-sm text-gray-500">Projet: Plateforme e-learning</p>
                        <p className="text-sm text-gray-500">Étudiant: Marie Martin (L1)</p>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-gray-50 text-right">
                    <button type="button" className="text-sm font-medium text-blue-600 hover:text-blue-500">Voir toutes les réunions</button>
                  </div>
                </div>
              )}

              {/* Comments tab */}
              {activeTab === "comments" && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4">
                    <h2 className="text-lg font-medium text-gray-900">Commentaires</h2>
                    <div className="mt-4 space-y-4">
                      <div className="px-4 py-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-800 font-medium">Prof. Durand</p>
                        <p className="text-sm text-gray-600 mt-1">Très bon avancement — penser à améliorer la page d'accueil.</p>
                        <p className="text-xs text-gray-400 mt-1">12/05/2023</p>
                      </div>

                      <div className="px-4 py-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-800 font-medium">Jean Dupont</p>
                        <p className="text-sm text-gray-600 mt-1">J'ai pushé la version API sur le repo. Besoin de review.</p>
                        <p className="text-xs text-gray-400 mt-1">11/05/2023</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right column (always visible) */}
            <aside className="space-y-6">
              {/* Student Info */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Étudiant</h2>
                </div>
                <div className="px-6 py-4">
                  <div className="flex items-center">
                    <img className="h-16 w-16 rounded-full" src="http://static.photos/people/200x200/2" alt="Student" />
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Jean Dupont</h3>
                      <p className="text-sm text-gray-500">jean.dupont@eni.fr</p>
                      <p className="text-sm text-gray-500">M1 Développement Web</p>
                      <div className="flex items-center mt-1">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                        <span className="text-xs text-green-600">En ligne</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button type="button" className="flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                      <i data-feather="mail" className="mr-2 h-4 w-4" /> Message
                    </button>
                    <button type="button" className="flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                      <i data-feather="phone" className="mr-2 h-4 w-4" /> Appeler
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Activité récente</h2>
                </div>
                <div className="px-6 py-4">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <i data-feather="file-text" className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Rapport intermédiaire soumis</p>
                        <p className="text-xs text-gray-500 mt-1">15/05/2023 - 14:32</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <i data-feather="message-square" className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Nouveau commentaire sur le projet</p>
                        <p className="text-xs text-gray-500 mt-1">14/05/2023 - 09:15</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <i data-feather="calendar" className="h-4 w-4 text-purple-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Réunion de suivi programmée</p>
                        <p className="text-xs text-gray-500 mt-1">12/05/2023 - 16:45</p>
                      </div>
                    </div>

                    <div className="mt-4 text-center">
                      <button type="button" className="text-sm font-medium text-blue-600 hover:text-blue-500 inline-flex items-center">
                        Voir toute l'activité
                        <i data-feather="chevron-right" className="ml-1 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Files (mini) */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Fichiers récents</h2>
                </div>
                <div className="px-6 py-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <i data-feather="file-text" className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">Rapport_intermediaire.pdf</p>
                          <p className="text-xs text-gray-500">2.4 MB</p>
                        </div>
                      </div>
                      <button type="button" className="p-1 rounded hover:bg-gray-100">
                        <i data-feather="download" className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between group">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <i data-feather="file" className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">Maquettes_Figma.zip</p>
                          <p className="text-xs text-gray-500">5.1 MB</p>
                        </div>
                      </div>
                      <button type="button" className="p-1 rounded hover:bg-gray-100">
                        <i data-feather="download" className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>

                    <div className="mt-4 text-center">
                      <button type="button" className="text-sm font-medium text-blue-600 hover:text-blue-500 inline-flex items-center">
                        Voir tous les fichiers
                        <i data-feather="chevron-right" className="ml-1 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Projet;
