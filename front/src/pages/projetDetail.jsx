// ProjectDetails.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import feather from "feather-icons";
import axios from "axios";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [etudiant, setEtudiant] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [projet, setProjet] = useState(null);
  const [livrables, setLivrables] = useState([]);
  const [membresEquipe, setMembresEquipe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    AOS.init();
    feather.replace();
    let isMounted = true; // Pour éviter les mises à jour d'état si le composant est démonté

    const storedUser = localStorage.getItem("user");
    const storedRole = localStorage.getItem("role");

    if (!storedUser || (storedRole !== "etudiant" && storedRole !== "encadreur")) {
      navigate("/login");
      return;
    }

    // Définir le rôle dans l'état
    setRole(storedRole);

    const fetchData = async () => {
      try {
        const userData = JSON.parse(storedUser);
        if (isMounted) setUser(userData);

        // 1. Récupérer les détails principaux du projet
        const projetResponse = await axios.get(`http://localhost:5000/projets/${id}`);
        if (!isMounted) return;
        setProjet(projetResponse.data);

        // 2. Exécuter les requêtes pour les livrables et l'équipe en parallèle
        const [livrablesResponse, membresResponse] = await Promise.all([
          axios.get(`http://localhost:5000/projets/${id}/livrables`),
          axios.get(`http://localhost:5000/projets/${id}/equipe`) // Cette route gère maintenant les deux cas
        ]);

        if (isMounted) {
          setLivrables(livrablesResponse.data);
          setMembresEquipe(membresResponse.data);
        }

      } catch (err) {
        console.error("❌ Erreur lors de la récupération des données :", err);
        if (isMounted) setError("Projet introuvable ou erreur de chargement.");
      } finally {
        if (isMounted) {
          setLoading(false);
          setTimeout(() => feather.replace(), 0);
        }
      }
    };

    fetchData();

    // Fonction de nettoyage pour useEffect
    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl text-gray-700">
          Chargement des détails du projet...
        </p>
      </div>
    );
  }

  if (error || !projet) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  if (Array.isArray(projet) && projet.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl text-red-500">Aucun projet trouvé avec cet ID.</p>
      </div>
    );
  }

  // Utiliser les membres de l'équipe récupérés depuis le backend
  const membres = membresEquipe || [];
  console.log(`👥 Affichage équipe - Nombre de membres: ${membres.length}`, membres);

  return (
    <div className="bg-gray-50 font-sans min-h-screen flex flex-col">
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
                  onError={(e) => {
                    e.target.src = "http://static.photos/people/200x200/1";
                  }}
                />
                <span className="ml-2 text-sm font-medium">{user?.Nom || "Utilisateur"}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1">
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
              <p className="text-xs text-gray-500">{user?.Titre || "Utilisateur"}</p>
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

        {/* Main content */}
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">{projet.Theme}</h1>
            <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
              {projet.Avancement === 100 ? "Terminé" : "En cours"}
            </span>
          </div>

          {/* Project details */}
          <section className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Description
            </h2>
            <p className="text-gray-700 text-sm leading-6">
              {projet.Description}
            </p>
          </section>

          {/* Encadrant + échéance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Encadrant
              </h3>
              <div className="flex items-center">
                <img
                  src={`http://static.photos/people/200x200/${
                    (projet.Id_encadreur % 10) + 1 || 1
                  }`}
                  className="h-10 w-10 rounded-full mr-3"
                  alt=""
                />
                <div>
                  <p className="text-gray-900 font-medium">
                    {projet.Nom_encadreur}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {projet.Titre_encadreur}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Échéance
              </h3>
              <p className="text-gray-900 font-semibold">
                {new Date(projet.Date_fin).toLocaleDateString()}
              </p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${projet.Avancement}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {projet.Avancement}% complété
              </p>
            </div>
          </div>

          {/* Team */}
          <section className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {/* Le titre change dynamiquement en fonction du nombre de membres */}
              Équipe {membres && membres.length > 1 ? `(${membres.length} membres)` : '(Projet individuel)'}
            </h2>

            {/* S'il y a au moins un membre, on affiche la liste */}
            {membres && membres.length > 0 ? (
              <div className="space-y-2">
                {membres.map((membre) => (
                  <div key={membre.Immatricule} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      {/* Champ : Immatricule */}
                      <span className="font-semibold text-sm text-gray-800 w-20">{membre.Immatricule}</span>
                      {/* Champ : Nom */}
                      <span className="text-gray-700 text-sm">{membre.Nom}</span>
                    </div>
                    {/* Champ : Niveau */}
                    {membre.Niveau && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {membre.Niveau}
                      </span>
                    )}
                    {/* Champ : Parcours */}
                    {membre.Parcours && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {membre.Parcours}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // Ce message s'affichera uniquement en cas de problème (ex: étudiant supprimé)
              <div className="text-center py-8">
                <i data-feather="user-x" className="h-12 w-12 text-gray-300 mx-auto mb-3"></i>
                <p className="text-gray-500">Aucun étudiant n'est assigné à ce projet.</p>
              </div>
            )}
          </section>

          {/* Livrables */}
          <section className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Livrables
            </h2>
            {livrables.length > 0 ? (
              <ul className="divide-y divide-gray-200 text-sm">
                {livrables.map((livrable) => (
                  <li
                    key={livrable.Id_livrable}
                    className="py-3 flex justify-between items-center"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{livrable.Titre}</span>
                      {livrable.Type && (
                        <span className="text-gray-500 text-xs">
                          Type: {livrable.Type}
                        </span>
                      )}
                      {livrable.Taille_fichier && (
                        <span className="text-gray-500 text-xs">
                          Taille: {livrable.Taille_fichier}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          livrable.Status === "Validé"
                            ? "bg-green-100 text-green-800"
                            : livrable.Status === "En attente"
                            ? "bg-yellow-100 text-yellow-800"
                            : livrable.Status === "Rejeté"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {livrable.Status}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {new Date(
                          livrable.Date_soumission
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">
                Aucun livrable n'a été soumis pour ce projet.
              </p>
            )}
          </section>

        </main>
      </div>
    </div>
  );
};

export default ProjectDetails;