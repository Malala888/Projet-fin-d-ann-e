import React, { useEffect, useState } from "react";
// AJOUT : Importer useNavigate ici
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import feather from "feather-icons";
import axios from "axios";

const EtudiantDetail = () => {
  const { immatricule } = useParams();
  const [etudiant, setEtudiant] = useState(null);
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate(); // AJOUT : Initialiser la fonction navigate

  useEffect(() => {
    AOS.init();

    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate("/"); // CORRECTION : Redirection vers la racine "/"
    }

    axios.get(`http://localhost:5000/etudiants/${immatricule}`)
      .then(response => {
        setEtudiant(response.data.details);
        setProjets(response.data.projets);
        setLoading(false);
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des détails de l'étudiant:", error);
        setLoading(false);
      });
  }, [immatricule]); // CORRECTION : 'navigate' a été retiré des dépendances

  const isActive = (path) => location.pathname.startsWith(path) ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900";

  if (loading) {
    return <div className="text-center p-8">Chargement des détails...</div>;
  }

  if (!etudiant) {
    return <div className="text-center p-8">Étudiant non trouvé.</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
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
              <div className="flex items-center">
                <img
                  className="h-8 w-8 rounded-full"
                  src={user?.Avatar ? `http://localhost:5000${user.Avatar}` : "http://static.photos/people/200x200/1"}
                  alt=""
                />
                <span className="ml-2 text-sm font-medium">{user?.Nom || "Utilisateur"}</span>
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
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.Nom || "Utilisateur"}</p>
              <p className="text-xs text-gray-500">{user?.Titre || "Encadreur"}</p>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            <Link
              to="/index"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/index")}`}
            >
              <img src="/icons/dashboard-icon.svg" alt="Dashboard" className="mr-3 h-5 w-5" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
              <i data-feather="home" className="mr-3 h-5 w-5" style={{display: 'none'}}></i> Dashboard
            </Link>
            <Link
              to="/etudiant"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/etudiant")}`}
            >
              <img src="/icons/students-icon.svg" alt="Étudiants" className="mr-3 h-5 w-5" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
              <i data-feather="users" className="mr-3 h-5 w-5" style={{display: 'none'}}></i> Étudiants
            </Link>
            <Link
              to="/projet"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/projet")}`}
            >
              <img src="/icons/projects-icon.svg" alt="Projets" className="mr-3 h-5 w-5" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
              <i data-feather="briefcase" className="mr-3 h-5 w-5" style={{display: 'none'}}></i> Projets
            </Link>
            <Link
              to="/calendrier"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/calendrier")}`}
            >
              <img src="/icons/calendar-icon.svg" alt="Calendrier" className="mr-3 h-5 w-5" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
              <i data-feather="calendar" className="mr-3 h-5 w-5" style={{display: 'none'}}></i> Calendrier
            </Link>
            <Link
              to="/livrable"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/livrable")}`}
            >
              <img src="/icons/deliverables-icon.svg" alt="Livrables" className="mr-3 h-5 w-5" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
              <i data-feather="file-text" className="mr-3 h-5 w-5" style={{display: 'none'}}></i> Livrables
            </Link>

            <div className="mt-8">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Administration
              </h3>
              <div className="mt-1 space-y-1">
                <Link
                  to="/parametre"
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/parametre")}`}
                >
                  <img src="/icons/settings-icon.svg" alt="Paramètres" className="mr-3 h-5 w-5" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                  <i data-feather="settings" className="mr-3 h-5 w-5" style={{display: 'none'}}></i> Paramètres
                </Link>
              </div>
            </div>

            {/* Logout Section */}
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

        {/* Main Content */}
        <main className="flex-1 p-8">
          <Link to="/etudiant" className="text-blue-600 hover:underline text-sm mb-4 inline-block">
            &larr; Retour à la liste
          </Link>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne de gauche : Profil */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow rounded-lg p-6 text-center">
                <img
                  className="h-32 w-32 rounded-full mx-auto mb-4 object-cover"
                  src={etudiant.Image ? `http://localhost:5000${etudiant.Image}` : "http://placehold.it/200x200"}
                  alt={`Profil de ${etudiant.Nom}`}
                />
                <h2 className="text-xl font-bold text-gray-800">{etudiant.Nom}</h2>
                <p className="text-md text-gray-600">{etudiant.Email}</p>
                <div className="mt-4 text-sm text-left space-y-2">
                  <p><strong>Niveau:</strong> {etudiant.Niveau}</p>
                  <p><strong>Parcours:</strong> {etudiant.Parcours}</p>
                  <p><strong>Filière:</strong> {etudiant.Filiere}</p>
                  {etudiant.Nom_equipe && <p><strong>Équipe:</strong> <span className="font-semibold text-blue-700">{etudiant.Nom_equipe}</span></p>}
                </div>
              </div>
            </div>

            {/* Colonne de droite : Projets */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-medium text-gray-900">Projets Associés</h3>
                </div>
                <div className="p-6">
                  {projets.length > 0 ? (
                    <ul className="space-y-4">
                      {projets.map(projet => (
                        <li key={projet.Id_projet} className="border p-4 rounded-md hover:bg-gray-50">
                          <h4 className="font-semibold text-md text-blue-700">{projet.Theme}</h4>
                          <p className="text-sm text-gray-600 mt-1">{projet.Description}</p>
                          <div className="text-xs text-gray-500 mt-3 grid grid-cols-2 gap-2">
                            <span><strong>Début:</strong> {new Date(projet.Date_deb).toLocaleDateString()}</span>
                            <span><strong>Fin:</strong> {new Date(projet.Date_fin).toLocaleDateString()}</span>
                            <span><strong>Statut:</strong> <span className="font-medium text-green-600">{projet.Status}</span></span>
                            <span><strong>Avancement:</strong> {projet.Avancement}%</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">Cet étudiant n'est associé à aucun projet que vous encadrez.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EtudiantDetail;