import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

function Etudiant() {
  const location = useLocation();

  useEffect(() => {
    // Feather icons (depuis le CDN déjà chargé dans index.html)
    if (window.feather) {
      window.feather.replace();
    }
    // AOS animations (depuis le CDN)
    if (window.AOS) {
      window.AOS.init();
    }
  }, []);

  const isActive = (path) => {
    return location.pathname === path
      ? "bg-blue-50 text-blue-700"
      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900";
  };

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
                  src="http://static.photos/people/200x200/1"
                  alt=""
                />
                <span className="ml-2 text-sm font-medium">John Doe</span>
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

        {/* Main Content */}
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Liste des étudiants encadrés
          </h1>
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Étudiant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Projet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Niveau
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Avancement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 flex items-center">
                    <img
                      className="h-10 w-10 rounded-full"
                      src="http://static.photos/people/200x200/2"
                      alt=""
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        Jean Dupont
                      </div>
                      <div className="text-sm text-gray-500">
                        jean.dupont@eni.fr
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    Système de gestion académique
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs">
                      M1
                    </span>
                  </td>
                  <td className="px-6 py-4">65%</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() =>
                        (window.location.href =
                          "http://localhost:3001/etudiant_detail")
                      }
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Détails
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 flex items-center">
                    <img
                      className="h-10 w-10 rounded-full"
                      src="http://static.photos/people/200x200/3"
                      alt=""
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        Marie Martin
                      </div>
                      <div className="text-sm text-gray-500">
                        marie.martin@eni.fr
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">Plateforme e-learning</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs">
                      L1
                    </span>
                  </td>
                  <td className="px-6 py-4">40%</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() =>
                        (window.location.href =
                          "http://localhost:3001/etudiant_detail")
                      }
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Détails
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Etudiant;
