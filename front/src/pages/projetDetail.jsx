// ProjectDetails.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import feather from "feather-icons";
import axios from "axios";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [etudiant, setEtudiant] = useState(null);
  const [projet, setProjet] = useState(null);
  const [livrables, setLivrables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    feather.replace();

    const storedUser = localStorage.getItem("user");
    const storedRole = localStorage.getItem("role");

    if (!storedUser || storedRole !== "etudiant") {
      navigate("/login");
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      setEtudiant(userData);

      const fetchData = async () => {
        try {
          const projetResponse = await axios.get(
            `http://localhost:5000/projets/${id}`
          );
          setProjet(projetResponse.data);

          const livrablesResponse = await axios.get(
            `http://localhost:5000/projets/${id}/livrables`
          );
          setLivrables(livrablesResponse.data);

          setLoading(false);
          setTimeout(() => {
            feather.replace();
          }, 0);
        } catch (err) {
          console.error("Erreur lors de la récupération des données :", err);
          setError("Projet introuvable ou erreur de chargement.");
          setLoading(false);
        }
      };

      fetchData();
    } catch (err) {
      console.error("Erreur de parsing des données utilisateur :", err);
      localStorage.clear();
      navigate("/login");
    }
  }, [id, navigate]);

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

  const membres = projet.Nom_membres
    ? projet.Nom_membres.split(",")
    : [projet.Nom_etudiant];

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
                  Espace Étudiant
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
                  src="http://static.photos/people/200x200/2"
                  alt="Profile"
                />
                <span className="ml-2 text-sm font-medium">{etudiant.Nom}</span>
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
              src="http://static.photos/people/200x200/2"
              alt=""
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">
                {etudiant.Nom}
              </p>
              <p className="text-xs text-gray-500">Étudiant M1</p>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            <Link
              to="/dashboard"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
            >
              <i data-feather="home" className="mr-3 h-5 w-5"></i>
              Tableau de bord
            </Link>
            <Link
              to="/mes_projets"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700"
            >
              <i data-feather="briefcase" className="mr-3 h-5 w-5"></i>
              Mes projets
            </Link>
            <Link
              to="/mes_livrables"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
            >
              <i data-feather="file-text" className="mr-3 h-5 w-5"></i>
              Mes livrables
            </Link>
            <Link
              to="/calendrierEtudiant"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
            >
              <i data-feather="calendar" className="mr-3 h-5 w-5"></i>
              Calendrier
            </Link>
            <Link
              to="/statistique_etudiant"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
            >
              <i data-feather="bar-chart-2" className="mr-3 h-5 w-5"></i>
              Mes statistiques
            </Link>
            <Link
              to="/parametre_etudiant"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
            >
              <i data-feather="settings" className="mr-3 h-5 w-5"></i>
              Paramètres
            </Link>
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
                    (projet.Id_encadreur % 10) + 1
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
            <h2 className="text-lg font-medium text-gray-900 mb-4">Équipe</h2>
            <div className="flex -space-x-4">
              {membres.map((membre, index) => (
                <img
                  key={index}
                  className="h-10 w-10 rounded-full border-2 border-white"
                  src={`http://static.photos/people/200x200/${index + 2}`}
                  alt={membre}
                />
              ))}
            </div>
            <div className="mt-4">
              {membres.map((membre, index) => (
                <p key={index} className="text-gray-700 text-sm">
                  {membre}
                </p>
              ))}
            </div>
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

          {/* Activity log */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Activités récentes
            </h2>
            <p className="text-gray-500 text-sm">
              Pour l'instant, le journal d'activité n'est pas dynamique. Tu dois créer une nouvelle route pour le récupérer.
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center">
                <i
                  data-feather="check-circle"
                  className="text-green-500 mr-2"
                ></i>
                Jean Dupont a soumis le rapport de conception
                <span className="ml-auto text-xs text-gray-500">
                  il y a 2 jours
                </span>
              </li>
              <li className="flex items-center">
                <i data-feather="upload" className="text-blue-500 mr-2"></i>
                Marie Martin a ajouté un nouveau prototype
                <span className="ml-auto text-xs text-gray-500">
                  il y a 1 semaine
                </span>
              </li>
              <li className="flex items-center">
                <i
                  data-feather="message-circle"
                  className="text-yellow-500 mr-2"
                ></i>
                Commentaire laissé par l'encadrant
                <span className="ml-auto text-xs text-gray-500">
                  il y a 2 semaines
                </span>
              </li>
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ProjectDetails;