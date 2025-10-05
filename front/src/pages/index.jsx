import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom"; // si tu n'utilises pas react-router, transforme Link en <a>

function Index() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation(); // ✅ récupérer l'objet location

  useEffect(() => {
    // init feather (CDN) et AOS (CDN) si disponibles
    if (window.feather) window.feather.replace();
    if (window.AOS) window.AOS.init();
  }, []);

  // ⚡ Ajoute ça juste avant return
  const isActive = (path) => {
    return location.pathname === path
      ? "bg-blue-50 text-blue-700"
      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900";
  };

  return (
    <div className="bg-gray-50 font-sans min-h-screen">
      {/* Styles personnalisés */}
      <style>
        {`
          .sidebar {
            transition: all 0.3s ease;
          }
          .dashboard-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          }
          .notification-dot {
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>

      {/* Navbar */}
      <nav className="bg-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              {/* bouton menu mobile */}
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
              <button className="p-1 rounded-full text-blue-200 hover:text-white relative" type="button">
                <i data-feather="bell"></i>
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 notification-dot" />
              </button>

              <div className="flex items-center">
                <img
                  className="h-8 w-8 rounded-full"
                  src="http://static.photos/people/200x200/1"
                  alt="Profile"
                />
                <span className="ml-2 text-sm font-medium">John Doe</span>
                <i data-feather="chevron-down" className="ml-1 h-4 w-4"></i>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main */}
      <div className="flex">
        {/* Sidebar */}
                <aside className="bg-white w-64 min-h-screen border-r hidden md:block">
                  <div className="p-4 border-b flex items-center">
                    <img
                      className="h-10 w-10 rounded-full"
                      src="http://static.photos/people/200x200/1"
                      alt=""
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-700">John Doe</p>
                      <p className="text-xs text-gray-500">Enseignant</p>
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
                      <i data-feather="calendar" className="mr-3 h-5 w-5"></i>{" "}
                      Calendrier
                    </Link>
                    <Link
                      to="/livrable"
                      className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                        "/livrable"
                      )}`}
                    >
                      <i data-feather="file-text" className="mr-3 h-5 w-5"></i>{" "}
                      Livrables
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
                          <i data-feather="settings" className="mr-3 h-5 w-5"></i>
                          Paramètres
                        </Link>
                      </div>
                    </div>
                  </nav>
                </aside>

        {/* Content */}
        <div className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Tableau de bord</h1>
            <p className="text-gray-600">Bienvenue sur votre espace d&apos;encadrement académique</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* carte 1 */}
            <div className="dashboard-card bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <i data-feather="users"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Étudiants encadrés</p>
                  <p className="text-2xl font-semibold text-gray-800">14</p>
                </div>
              </div>
            </div>

            {/* carte 2 */}
            <div className="dashboard-card bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <i data-feather="briefcase"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Projets actifs</p>
                  <p className="text-2xl font-semibold text-gray-800">8</p>
                </div>
              </div>
            </div>

            {/* carte 3 */}
            <div className="dashboard-card bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <i data-feather="calendar"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Réunions cette semaine</p>
                  <p className="text-2xl font-semibold text-gray-800">5</p>
                </div>
              </div>
            </div>

            {/* carte 4 */}
            <div className="dashboard-card bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 text-red-600">
                  <i data-feather="alert-triangle"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Livrables en retard</p>
                  <p className="text-2xl font-semibold text-gray-800">2</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upcoming Meetings (lg:col-span-2) */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Prochaines réunions</h2>
                </div>

                <div className="divide-y divide-gray-200">
                  {/* item 1 */}
                  <div className="px-6 py-4 flex items-center hover:bg-gray-50">
                    <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                      <i data-feather="calendar" className="h-6 w-6 text-blue-600"></i>
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

                  {/* item 2 */}
                  <div className="px-6 py-4 flex items-center hover:bg-gray-50">
                    <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                      <i data-feather="calendar" className="h-6 w-6 text-green-600"></i>
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

                  {/* item 3 */}
                  <div className="px-6 py-4 flex items-center hover:bg-gray-50">
                    <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                      <i data-feather="calendar" className="h-6 w-6 text-purple-600"></i>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-purple-600">Réunion d'équipe</p>
                        <p className="text-sm text-gray-500">16:30 - 17:30</p>
                      </div>
                      <p className="text-sm text-gray-500">Projet: Application mobile</p>
                      <p className="text-sm text-gray-500">Étudiants: Groupe L1-04</p>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 text-right">
                  <Link to="/reunions" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    Voir toutes les réunions
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent Deliverables */}
            <div>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Derniers livrables</h2>
                </div>

                <div className="divide-y divide-gray-200">
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <i data-feather="file-text" className="h-5 w-5 text-gray-400"></i>
                        <p className="ml-2 text-sm font-medium text-gray-900">Rapport intermédiaire.pdf</p>
                      </div>
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Validé</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">Projet: Système de gestion - Jean Dupont</p>
                    <p className="mt-1 text-xs text-gray-400">Soumis le 15/05/2023</p>
                  </div>

                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <i data-feather="file-text" className="h-5 w-5 text-gray-400"></i>
                        <p className="ml-2 text-sm font-medium text-gray-900">Cahier des charges.docx</p>
                      </div>
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">En attente</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">Projet: Plateforme e-learning - Marie Martin</p>
                    <p className="mt-1 text-xs text-gray-400">Soumis le 14/05/2023</p>
                  </div>

                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <i data-feather="file-text" className="h-5 w-5 text-gray-400"></i>
                        <p className="ml-2 text-sm font-medium text-gray-900">Présentation.pptx</p>
                      </div>
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">En retard</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">Projet: Application mobile - Groupe L1-04</p>
                    <p className="mt-1 text-xs text-gray-400">Échéance le 12/05/2023</p>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 text-right">
                  <Link to="/livrables" className="text-sm font-medium text-blue-600 hover:text-blue-500">Voir tous les livrables</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Student Projects table */}
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Vos étudiants encadrés</h2>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700" type="button">L1</button>
                  <button className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300" type="button">M1</button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Étudiant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projet</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Niveau</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avancement</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prochaine réunion</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Row 1 */}
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-full" src="http://static.photos/people/200x200/2" alt="Jean Dupont" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">Jean Dupont</div>
                            <div className="text-sm text-gray-500">jean.dupont@eni.fr</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Système de gestion académique</div>
                        <div className="text-sm text-gray-500">Développement web</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">M1</span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "65%" }} />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">65% complété</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        18/05/2023 - 10:00
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button type="button" className="text-blue-600 hover:text-blue-900 mr-3">
                          <i data-feather="eye"></i>
                        </button>
                        <button type="button" className="text-green-600 hover:text-green-900 mr-3">
                          <i data-feather="message-square"></i>
                        </button>
                        <button type="button" className="text-purple-600 hover:text-purple-900">
                          <i data-feather="calendar"></i>
                        </button>
                      </td>
                    </tr>

                    {/* Row 2 */}
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-full" src="http://static.photos/people/200x200/3" alt="Marie Martin" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">Marie Martin</div>
                            <div className="text-sm text-gray-500">marie.martin@eni.fr</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Plateforme e-learning</div>
                        <div className="text-sm text-gray-500">Développement web</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">L1</span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-green-600 h-2.5 rounded-full" style={{ width: "40%" }} />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">40% complété</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        20/05/2023 - 14:00
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button type="button" className="text-blue-600 hover:text-blue-900 mr-3">
                          <i data-feather="eye"></i>
                        </button>
                        <button type="button" className="text-green-600 hover:text-green-900 mr-3">
                          <i data-feather="message-square"></i>
                        </button>
                        <button type="button" className="text-purple-600 hover:text-purple-900">
                          <i data-feather="calendar"></i>
                        </button>
                      </td>
                    </tr>

                    {/* Row 3 */}
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-full" src="http://static.photos/people/200x200/4" alt="Groupe L1-04" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">Groupe L1-04</div>
                            <div className="text-sm text-gray-500">4 membres</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Application mobile</div>
                        <div className="text-sm text-gray-500">Développement mobile</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">L1</span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: "25%" }} />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">25% complété</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        22/05/2023 - 16:30
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button type="button" className="text-blue-600 hover:text-blue-900 mr-3">
                          <i data-feather="eye"></i>
                        </button>
                        <button type="button" className="text-green-600 hover:text-green-900 mr-3">
                          <i data-feather="message-square"></i>
                        </button>
                        <button type="button" className="text-purple-600 hover:text-purple-900">
                          <i data-feather="calendar"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 bg-gray-50 text-right">
                <Link to="/etudiants" className="text-sm font-medium text-blue-600 hover:text-blue-500">Voir tous les étudiants</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Index;
