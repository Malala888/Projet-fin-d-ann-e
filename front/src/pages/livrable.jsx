// src/pages/livrable.jsx
import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import feather from "feather-icons";
import axios from "axios";
// Import Link from react-router-dom
import { Link, useLocation } from "react-router-dom";

const Livrable = () => {
  const [user, setUser] = useState(null);
  // NOUVEAU : États pour les livrables et le chargement
  const [livrables, setLivrables] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // --- NOUVEAU : États pour les filtres ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Tous les statuts");
  const [selectedStudent, setSelectedStudent] = useState("Tous les étudiants");
  const [filteredLivrables, setFilteredLivrables] = useState([]);

  useEffect(() => {
    AOS.init();
    feather.replace();

    // Récupérer les données utilisateur du localStorage
    const userData = localStorage.getItem("user");
    const userRole = localStorage.getItem("role");

    console.log("🔍 Debug - userData:", userData);
    console.log("🔍 Debug - userRole:", userRole);

    if (userData && userRole === "encadreur") {
      console.log("✅ Utilisateur encadreur autorisé à voir les livrables");
      setUser(JSON.parse(userData));
    } else {
      console.log("❌ Pas d'utilisateur autorisé, redirection vers login");
      // Rediriger si l'utilisateur n'est pas connecté ou n'est pas un encadreur
      window.location.href = "/login";
    }
  }, []);

  // MODIFICATION : Récupération des données lorsque l'utilisateur est chargé
  useEffect(() => {
    if (user && user.Matricule) {
      axios.get(`http://localhost:5000/encadreurs/${user.Matricule}/livrables`)
        .then(response => {
          setLivrables(response.data);
          setLoading(false);
        })
        .catch(error => {
          console.error("Erreur lors du chargement des livrables:", error);
          setLoading(false);
        });
    }
  }, [user]); // Ce useEffect dépend de `user`

  // useEffect séparé pour gérer les icônes après le rendu
  useEffect(() => {
    if (!loading) {
      feather.replace();
    }
  }, [loading, livrables]); // Se déclenche après le chargement et la mise à jour des livrables

  // --- NOUVEAU : useEffect pour gérer le filtrage ---
  useEffect(() => {
    let result = livrables;

    // 1. Filtrage par recherche
    if (searchTerm) {
      result = result.filter(livrable =>
        (livrable.Titre && livrable.Titre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (livrable.Nom_projet && livrable.Nom_projet.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 2. Filtrage par statut
    if (selectedStatus !== "Tous les statuts") {
      result = result.filter(livrable => livrable.Status === selectedStatus);
    }

    // 3. Filtrage par étudiant
    if (selectedStudent !== "Tous les étudiants") {
      result = result.filter(livrable => livrable.Nom_etudiant === selectedStudent);
    }

    setFilteredLivrables(result);
  }, [searchTerm, selectedStatus, selectedStudent, livrables]);

  // Récupérer la liste unique des étudiants pour le filtre
  const studentNames = [...new Set(livrables.map(l => l.Nom_etudiant))].sort();

  // Fonction pour télécharger un livrable
  const handleDownloadFile = async (livrableId, titre) => {
    try {
      console.log(`Debut téléchargement livrable ${livrableId}`);

      const response = await fetch(
        `http://localhost:5000/livrables/${livrableId}/download`
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = titre || `livrable_${livrableId}`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log(`Téléchargement réussi: ${filename}`);
    } catch (error) {
      console.error("Erreur lors du téléchargement :", error);
      alert("Erreur lors du téléchargement du fichier. Veuillez réessayer.");
    }
  };

  // Fonction pour valider un livrable
  const handleValidateLivrable = async (livrableId) => {
    if (!window.confirm("Voulez-vous vraiment valider ce livrable ?")) return;
    try {
      await axios.put(`http://localhost:5000/livrables/${livrableId}`, {
        Status: "Validé"
      });
      alert("Livrable validé avec succès !");
      // Recharger les données
      if (user && user.Matricule) {
        const response = await axios.get(`http://localhost:5000/encadreurs/${user.Matricule}/livrables`);
        setLivrables(response.data);
      }
    } catch (error) {
      console.error("Erreur lors de la validation :", error);
      alert("Erreur lors de la validation du livrable");
    }
  };

  // Fonction pour rejeter un livrable
  const handleRejectLivrable = async (livrableId) => {
    if (!window.confirm("Voulez-vous vraiment rejeter ce livrable ?")) return;
    try {
      await axios.put(`http://localhost:5000/livrables/${livrableId}`, {
        Status: "Rejeté"
      });
      alert("Livrable rejeté avec succès !");
      // Recharger les données
      if (user && user.Matricule) {
        const response = await axios.get(`http://localhost:5000/encadreurs/${user.Matricule}/livrables`);
        setLivrables(response.data);
      }
    } catch (error) {
      console.error("Erreur lors du rejet :", error);
      alert("Erreur lors du rejet du livrable");
    }
  };

  // NOUVEAU : Fonction pour déterminer la couleur du statut
  const getStatutClasses = (status) => {
    const statusMap = {
      "Validé": "bg-green-100 text-green-800",
      "En attente": "bg-yellow-100 text-yellow-800",
      "Rejeté": "bg-red-100 text-red-800",
      "Soumis": "bg-blue-100 text-blue-800",
      "À corriger": "bg-purple-100 text-purple-800",
    };
    return `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusMap[status] || "bg-gray-100 text-gray-800"}`;
  };

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
    <div className="bg-gray-50 font-sans min-h-screen">
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
              <div className="flex items-center">
                <img
                  className="h-8 w-8 rounded-full"
                  src={user?.Avatar ? `http://localhost:5000${user.Avatar}` : "http://static.photos/people/200x200/1"}
                  alt="Profil"
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
              alt="Profil"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.Nom || "Utilisateur"}</p>
              <p className="text-xs text-gray-500">{user?.Titre || "Encadreur"}</p>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            {/* Remplacer les balises <a> par des balises <Link> */}
            <Link
              to="/index"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50"
            >
              <i data-feather="home" className="mr-3 h-5 w-5"></i> Dashboard
            </Link>
            <Link
              to="/etudiant"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50"
            >
              <i data-feather="users" className="mr-3 h-5 w-5"></i> Étudiants
            </Link>
            <Link
              to="/projet"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50"
            >
              <i data-feather="briefcase" className="mr-3 h-5 w-5"></i> Projets
            </Link>
            <Link
              to="/calendrier"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50"
            >
              <i data-feather="calendar" className="mr-3 h-5 w-5"></i> Calendrier
            </Link>
            <Link
              to="/livrable"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/livrable")}`}
            >
              <i data-feather="file-text" className="mr-3 h-5 w-5"></i> Livrables
            </Link>
            <div className="mt-8">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Administration
              </h3>
              <div className="mt-1 space-y-1">
                <Link
                  to="/parametre"
                  className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  <i data-feather="settings" className="mr-3 h-5 w-5"></i>
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

        {/* MODIFICATION : Ajout de 'overflow-hidden' pour empêcher le scroll au niveau parent */}
        <main className="flex-1 p-4 md:p-8 overflow-hidden">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Gestion des livrables
            </h1>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1 min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rechercher
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="search-livrable"
                    placeholder="Rechercher un livrable ou projet..."
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full lg:w-40">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filtrer par statut
                </label>
                <select
                  id="filter-status"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option>Tous les statuts</option>
                  <option>Soumis</option>
                  <option>En attente</option>
                  <option>Validé</option>
                  <option>Rejeté</option>
                  <option>À corriger</option>
                </select>
              </div>
              <div className="w-full lg:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filtrer par étudiant
                </label>
                <select
                  id="filter-student"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                >
                  <option>Tous les étudiants</option>
                  {studentNames.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* MODIFICATION : La grille de statistiques est maintenant responsive */}
          {/* Elle passe à 1 colonne sur mobile, 2 sur tablette, et 4 sur grand écran */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: "Livrables affichés", value: filteredLivrables.length, icon: "file-text", color: "blue" },
              { label: "En attente", value: filteredLivrables.filter(l => l.Status === "En attente").length, icon: "clock", color: "yellow" },
              { label: "Validés", value: filteredLivrables.filter(l => l.Status === "Validé").length, icon: "check-circle", color: "green" },
              { label: "À corriger/Rejetés", value: filteredLivrables.filter(l => l.Status === "À corriger" || l.Status === "Rejeté").length, icon: "alert-triangle", color: "red" },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4 md:p-6">
                <div className="flex items-center">
                  <div className={`p-2 md:p-3 rounded-full bg-${card.color}-100 text-${card.color}-600`}>
                    <i data-feather={card.icon} className="h-5 w-5 md:h-6 md:w-6"></i>
                  </div>
                  <div className="ml-3 md:ml-4">
                    <p className="text-xs md:text-sm font-medium text-gray-500">{card.label}</p>
                    <p className="text-xl md:text-2xl font-semibold text-gray-800">{card.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* MODIFICATION : Rendu dynamique de la table */}
          <div className="bg-white shadow rounded-lg overflow-x-auto">
            {loading ? (
              <div className="text-center p-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Chargement des livrables...</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {/* MODIFICATION : Suppression de toutes les classes de largeur fixes (w-XX) */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Livrable</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Étudiant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projet</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLivrables.length > 0 ? (
                    filteredLivrables.map((livrable) => (
                      <tr key={livrable.Id_livrable} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-start">
                            <i data-feather="file-text" className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0"></i>
                            {/* MODIFICATION : Ajout de 'break-words' pour forcer le retour à la ligne */}
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 break-words">{livrable.Titre || livrable.Nom_fichier}</p>
                              <p className="text-xs text-gray-500">{`${livrable.Type || ''} - ${livrable.Taille_fichier || ''}`}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <img
                              className="h-8 w-8 rounded-full mr-3 flex-shrink-0"
                              src={livrable.Avatar_etudiant ? `http://localhost:5000${livrable.Avatar_etudiant}` : `http://static.photos/people/200x200/${livrable.Id_livrable % 10 + 1}`}
                              alt={livrable.Nom_etudiant}
                            />
                            <p className="text-sm text-gray-900 break-words min-w-0">{livrable.Nom_etudiant}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900 break-words">{livrable.Nom_projet}</p>
                        </td>
                        <td className="px-3 md:px-6 py-4">
                          <div className="text-sm text-gray-500 break-words">
                            {new Date(livrable.Date_soumission).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-3 md:px-6 py-4">
                          <span className={`${getStatutClasses(livrable.Status)} break-words`}>
                            {livrable.Status}
                          </span>
                        </td>
                        {/* MODIFICATION : Ajout de 'whitespace-nowrap' pour que les boutons restent sur une ligne */}
                         <td className="px-6 py-4 whitespace-nowrap">
                           <div className="flex items-center space-x-2">
                             {/* Bouton de téléchargement conditionnel : affiché seulement si le fichier existe */}
                             {livrable.Taille_fichier && (
                               <button
                                 type="button"
                                 aria-label="Télécharger"
                                 className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"
                                 onClick={() => handleDownloadFile(livrable.Id_livrable, livrable.Titre)}
                               >
                                 <i data-feather="download" className="h-4 w-4"></i>
                               </button>
                             )}
                             {/* Bouton de validation conditionnel : affiché seulement si le statut n'est pas déjà "Validé" */}
                             {livrable.Status !== "Validé" && (
                               <button
                                 type="button"
                                 aria-label="Valider"
                                 className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-100"
                                 onClick={() => handleValidateLivrable(livrable.Id_livrable)}
                               >
                                 <i data-feather="check-circle" className="h-4 w-4"></i>
                               </button>
                             )}
                             {/* Bouton de rejet conditionnel : affiché seulement si le statut n'est pas déjà "Rejeté" */}
                             {livrable.Status !== "Rejeté" && (
                               <button
                                 type="button"
                                 aria-label="Rejeter"
                                 className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"
                                 onClick={() => handleRejectLivrable(livrable.Id_livrable)}
                               >
                                 <i data-feather="x-circle" className="h-4 w-4"></i>
                               </button>
                             )}
                           </div>
                         </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-10 text-gray-500">
                        Vous n'avez aucun livrable à corriger pour le moment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Livrable;