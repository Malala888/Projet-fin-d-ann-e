import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import feather from "feather-icons";
import AOS from "aos";
import "aos/dist/aos.css";

const DetailsProjetEncadreur = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [projet, setProjet] = useState(null);
  const [composants, setComposants] = useState({
    Modelisation: false,
    UX_UI_Design: false,
    Developpement: false,
    Rapport_Projet: false,
  });
  const [livrables, setLivrables] = useState([]);
  const [membresEquipe, setMembresEquipe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    feather.replace();

    const storedUser = localStorage.getItem("user");
    const storedRole = localStorage.getItem("role");

    if (!storedUser || storedRole !== "encadreur") {
      navigate("/login");
      return;
    }

    const userData = JSON.parse(storedUser);
    setUser(userData);

    const fetchProjectData = async () => {
      try {
        // 1. Récupérer les détails principaux du projet
        const projetResponse = await axios.get(`http://localhost:5000/projets/${id}`);
        setProjet(projetResponse.data);

        // 2. Récupérer les composants du projet
        const composantsRes = await axios.get(`http://localhost:5000/projets/${id}/composants`);
        // Convertir les valeurs 0/1 en true/false
        const boolComposants = {
          Modelisation: !!composantsRes.data.Modelisation,
          UX_UI_Design: !!composantsRes.data.UX_UI_Design,
          Developpement: !!composantsRes.data.Developpement,
          Rapport_Projet: !!composantsRes.data.Rapport_Projet,
        };
        setComposants(boolComposants);

        // 3. Récupérer les livrables et l'équipe en parallèle
        const [livrablesResponse, membresResponse] = await Promise.all([
          axios.get(`http://localhost:5000/projets/${id}/livrables`),
          axios.get(`http://localhost:5000/projets/${id}/equipe`)
        ]);

        setLivrables(livrablesResponse.data);
        setMembresEquipe(membresResponse.data);

      } catch (error) {
        console.error("Erreur lors de la récupération des données du projet :", error);
        setError("Projet introuvable ou erreur de chargement.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [id, navigate]);

  useEffect(() => {
    feather.replace();
  });

  const isActive = (path) => {
    return location.pathname === path
      ? "bg-blue-50 text-blue-700"
      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900";
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleCheckboxChange = async (componentName) => {
    const newComposants = {
      ...composants,
      [componentName]: !composants[componentName],
    };

    // Mettre à jour l'UI instantanément
    setComposants(newComposants);

    // Mettre à jour le % d'avancement dans l'UI
    const newProgress = Object.values(newComposants).filter(Boolean).length * 25;
    setProjet(prev => ({ ...prev, Avancement: newProgress }));


    try {
      // Envoyer la mise à jour au backend
      await axios.put(`http://localhost:5000/projets/${id}/composants`, newComposants);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la progression:", error);
      // Revenir à l'état précédent en cas d'erreur
      setComposants(composants);
      const oldProgress = Object.values(composants).filter(Boolean).length * 25;
      setProjet(prev => ({ ...prev, Avancement: oldProgress }));
      alert("La mise à jour a échoué. Veuillez réessayer.");
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl text-gray-700">🔄 Chargement du projet...</p>
      </div>
    );
  }

  if (error || !projet) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl text-red-500">{error || "Projet non trouvé."}</p>
      </div>
    );
  }

  // Utiliser les membres de l'équipe récupérés depuis le backend
  const membres = membresEquipe || [];

  const progressColor = projet.Avancement < 50 ? 'bg-yellow-400' : 'bg-green-500';

  // Définition des couleurs pour chaque composant
  const componentStyles = {
    Modelisation: { name: "Modélisation", color: "blue", icon: "share-2" },
    UX_UI_Design: { name: "Maquette UX/UI", color: "indigo", icon: "layout" },
    Developpement: { name: "Développement", color: "purple", icon: "code" },
    Rapport_Projet: { name: "Rapport Final", color: "pink", icon: "file-text" },
  };

  // Construire l'URL de l'image avec cache busting
  const profileImageUrl =
    user.Avatar && !user.Avatar.startsWith("http")
      ? `http://localhost:5000${user.Avatar}?t=${new Date().getTime()}`
      : user.Avatar || "http://static.photos/people/200x200/1";

  return (
    <div className="bg-gray-50 font-sans min-h-screen flex flex-col">
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
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
              </button>
              <div className="flex items-center">
                <img
                  className="h-8 w-8 rounded-full"
                  src={profileImageUrl}
                  alt="Profile"
                />
                <span className="ml-2 text-sm font-medium">{user?.Nom || "Encadreur"}</span>
                <i data-feather="chevron-down" className="ml-1 h-4 w-4"></i>
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
              src={profileImageUrl}
              alt="Avatar de l'encadreur"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.Nom || "Encadreur"}</p>
              <p className="text-xs text-gray-500">{user?.Titre || "Encadreur"}</p>
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
            <Link to="/statistique" className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/statistique")}`}>
              <i data-feather="bar-chart-2" className="mr-3 h-5 w-5"></i> Statistiques
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
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">{projet.Theme}</h1>
            <Link to="/projet" className="text-blue-500 hover:text-blue-700">
              <i data-feather="arrow-left" className="inline-block mr-2"></i>Retour
            </Link>
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
                  src={`http://static.photos/people/200x200/${(projet.Id_encadreur % 10) + 1 || 1}`}
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

          <div className="flex flex-col lg:flex-row gap-6">
            {/* PANNEAU DE PROGRESSION DYNAMIQUE */}
            <div data-aos="fade-right" className="lg:w-2/3 bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Progression du Projet</h2>
              <div className="space-y-4">
                {Object.keys(composants).map((key) => {
                  const style = componentStyles[key];
                  const isChecked = composants[key];

                  return (
                    <div key={key} className="flex items-center p-3 border rounded-lg transition-all duration-300">
                      <label className="flex items-center cursor-pointer w-full">
                        <input
                          type="checkbox"
                          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={isChecked}
                          onChange={() => handleCheckboxChange(key)}
                        />
                        <div className="ml-4 flex-grow">
                          <div className="flex items-center">
                            <i data-feather={style.icon} className={`mr-2 h-5 w-5 text-${style.color}-500`}></i>
                            <span className="font-semibold text-gray-700">{style.name}</span>
                          </div>
                        </div>
                        <div className="w-1/3 flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-3">
                            <div
                              className={`bg-${style.color}-500 h-2.5 rounded-full transition-all duration-500`}
                              style={{ width: isChecked ? '100%' : '0%' }}
                            ></div>
                          </div>
                          <span className={`text-sm font-bold text-${style.color}-600`}>25%</span>
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Team */}
            <div data-aos="fade-left" className="lg:w-1/3 bg-white p-6 rounded-lg shadow mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Équipe {membres && membres.length > 1 ? `(${membres.length} membres)` : '(Projet individuel)'}
              </h2>

              {membres && membres.length > 0 ? (
                <div className="space-y-2">
                  {membres.map((membre) => (
                    <div key={membre.Immatricule} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <span className="font-semibold text-sm text-gray-800 w-20">{membre.Immatricule}</span>
                        <span className="text-gray-700 text-sm">{membre.Nom}</span>
                      </div>
                      {membre.Niveau && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {membre.Niveau}
                        </span>
                      )}
                      {membre.Parcours && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          {membre.Parcours}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <i data-feather="user-x" className="h-12 w-12 text-gray-300 mx-auto mb-3"></i>
                  <p className="text-gray-500">Aucun étudiant n'est assigné à ce projet.</p>
                </div>
              )}
            </div>
          </div>

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
                        {new Date(livrable.Date_soumission).toLocaleDateString()}
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

export default DetailsProjetEncadreur;