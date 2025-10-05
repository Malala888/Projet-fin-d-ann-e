import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import feather from "feather-icons";
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";
import ModalAjoutLivrable from "./ModalAjoutLivrable";
// ✨ 1. Importer le nouveau modal de modification
import ModalModifierLivrable from "./ModalModifierLivrable"; 

const normalizeStatus = (status) => {
  if (!status) return "";
  return String(status)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
};

const MesLivrables = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [etudiant, setEtudiant] = useState(null);
  const [livrables, setLivrables] = useState([]);
  const [projets, setProjets] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  
  // State pour le modal d'ajout
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✨ 2. Nouveaux états pour le modal de modification
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [livrableSelectionne, setLivrableSelectionne] = useState(null);


  const handleLogout = useCallback(() => {
    localStorage.clear();
    navigate("/login");
  }, [navigate]);

  const getStatusClasses = (category) => {
    const normalized = normalizeStatus(category);

    if (normalized === "validé" || normalized === "contient fichier") {
      return {
        statusColor: "bg-green-100 text-green-800",
        label: "Validé",
      };
    } else if (normalized === "à venir" || normalized === "a venir") {
      return {
        statusColor: "bg-purple-100 text-purple-800",
        label: "À venir",
      };
    } else if (normalized === "en attente" || normalized === "attente") {
      return {
        statusColor: "bg-yellow-100 text-yellow-800",
        label: "En attente",
      };
    } else {
      return {
        statusColor: "bg-gray-100 text-gray-800",
        label: category || "Non défini",
      };
    }
  };

  const formatLivrables = useCallback((data) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const todayTimestamp = now.getTime();

    return data.map((liv) => {
      const hasFichier = !!(
        liv.Chemin_fichier &&
        String(liv.Chemin_fichier).trim() !== "" &&
        liv.Chemin_fichier !== "null" &&
        liv.Chemin_fichier !== "undefined"
      );

      let dateSoumissionTimestamp = 0;
      if (liv.Date_soumission) {
        const dateLivrable = new Date(liv.Date_soumission);
        if (!isNaN(dateLivrable.getTime())) {
          dateLivrable.setHours(0, 0, 0, 0);
          dateSoumissionTimestamp = dateLivrable.getTime();
        }
      }

      // Utiliser le statut de la base de données s'il existe, sinon déterminer basé sur les fichiers
      let status = liv.Status;
      if (!status) {
        if (hasFichier) {
          status = "Validé";
        } else if (dateSoumissionTimestamp > todayTimestamp) {
          status = "À venir";
        } else {
          status = "En attente";
        }
      }

      // Déterminer les catégories multiples basées sur le statut et la date
      let categories = [];
      const normalizedStatus = normalizeStatus(status);

      if (normalizedStatus.includes("valide") || hasFichier) {
        categories.push("Validé");
      } else if (normalizedStatus.includes("attente") || !hasFichier) {
        categories.push("En attente");
      }

      if (dateSoumissionTimestamp > todayTimestamp) {
        categories.push("À venir");
      }

      return {
        ...liv,
        title:
          liv.Titre ||
          liv.Titre_livrable ||
          liv.Nom ||
          `Livrable #${liv.Id_livrable}`,
        project: liv.Nom_projet || liv.Projet || "Projet Inconnu",
        date: liv.Date_soumission
          ? new Date(liv.Date_soumission).toLocaleDateString("fr-FR")
          : "Non défini",
        categories,
        hasFichier,
        isFuture: dateSoumissionTimestamp > todayTimestamp,
        originalStatus: status,
      };
    });
  }, []);

  const calculateStats = useCallback((formattedLivrables) => {
    let total = formattedLivrables.length;
    let withFile = 0;
    let pending = 0;
    let upcoming = 0;

    formattedLivrables.forEach((l) => {
      if (l.categories.includes("Validé")) withFile++;
      if (l.categories.includes("En attente")) pending++;
      if (l.categories.includes("À venir")) upcoming++;
    });

    return [
      {
        icon: "file-text",
        label: "Total des livrables",
        value: total,
        bg: "bg-blue-100",
        color: "text-blue-600",
      },
      {
        icon: "check-circle",
        label: "Validé",
        value: withFile,
        bg: "bg-green-100",
        color: "text-green-600",
      },
      {
        icon: "clock",
        label: "En attente",
        value: pending,
        bg: "bg-yellow-100",
        color: "text-yellow-600",
      },
      {
        icon: "calendar",
        label: "À venir",
        value: upcoming,
        bg: "bg-purple-100",
        color: "text-purple-600",
      },
    ];
  }, []);

  const handleDownloadFile = async (livrableId, titre) => {
    try {
      console.log(`📥 Début téléchargement livrable ${livrableId}`);

      // Faire une requête fetch pour obtenir le fichier
      const response = await fetch(`http://localhost:5000/livrables/${livrableId}/download`);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      // Récupérer le nom du fichier depuis les headers
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = titre || `livrable_${livrableId}`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Convertir la réponse en blob
      const blob = await response.blob();

      // Créer une URL pour le blob
      const url = window.URL.createObjectURL(blob);

      // Créer un lien temporaire et déclencher le téléchargement
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();

      // Nettoyer
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log(`✅ Téléchargement réussi: ${filename}`);
    } catch (error) {
      console.error('Erreur lors du téléchargement :', error);
      alert('Erreur lors du téléchargement du fichier. Veuillez réessayer.');
    }
  };

  const handleDeleteLivrable = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce livrable ?")) return;
    try {
      await axios.delete(`http://localhost:5000/livrables/${id}`);
      alert("Livrable supprimé avec succès !");
      fetchData();
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      alert("Erreur lors de la suppression du livrable");
    }
  };

  // ✨ 3. Mettre à jour la fonction pour ouvrir le modal de MODIFICATION
  const handleEditLivrable = (livrable) => {
    setLivrableSelectionne(livrable); // Mémoriser le livrable à éditer
    setIsEditModalOpen(true); // Ouvrir le modal de modification
  };

  const handleAjoutLivrable = async (formData) => {
    try {
      await axios.post("http://localhost:5000/livrables", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Livrable ajouté avec succès !");
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Erreur lors de l'ajout du livrable :", error);
      alert(
        "Erreur lors de l'ajout du livrable : " +
          (error.response?.data?.error || error.message)
      );
    }
  };
  
  // ✨ 4. Nouvelle fonction pour gérer la soumission de la modification
  const handleUpdateLivrable = async (livrableId, formData) => {
    try {
      await axios.put(`http://localhost:5000/livrables/${livrableId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Livrable modifié avec succès !");
      setIsEditModalOpen(false); // Fermer le modal de modification
      setLivrableSelectionne(null); // Réinitialiser la sélection
      fetchData(); // Rafraîchir les données
    } catch (error) {
      console.error("Erreur lors de la modification du livrable :", error);
      alert(
        "Erreur lors de la modification du livrable : " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  const fetchData = useCallback(async () => {
    if (!etudiant) return;
    try {
      const [livrablesResponse, projetsResponse] = await Promise.all([
        axios.get(
          `http://localhost:5000/etudiants/${etudiant.Immatricule}/livrables`
        ),
        axios.get(
          `http://localhost:5000/etudiants/${etudiant.Immatricule}/projets`
        ),
      ]);

      const formattedLivrables = formatLivrables(livrablesResponse.data);
      setLivrables(formattedLivrables);
      setStats(calculateStats(formattedLivrables));
      setProjets(projetsResponse.data);

      setTimeout(() => feather.replace(), 0);
    } catch (error) {
      console.error("Erreur lors de la récupération des données :", error);
    } finally {
      setLoading(false);
    }
  }, [etudiant, formatLivrables, calculateStats]);

  const filteredLivrables = livrables.filter((livrable) => {
    if (activeFilter === "Tous") return true;

    const normalizedFilter = normalizeStatus(activeFilter);
    return livrable.categories.some(
      (cat) => normalizeStatus(cat) === normalizedFilter
    );
  }).filter((livrable) => {
    if (searchQuery && searchQuery.length > 0) {
      const q = normalizeStatus(searchQuery);
      return (
        normalizeStatus(livrable.title).includes(q) ||
        normalizeStatus(livrable.project).includes(q)
      );
    }
    return true;
  });

  useEffect(() => {
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
    } catch (error) {
      console.error("Erreur de parsing de l'utilisateur :", error);
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (etudiant) {
      setLoading(true);
      fetchData();
    }
  }, [etudiant, fetchData]);

  const filterButtons = ["Tous", "À venir", "En attente", "Validé"];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-blue-600">Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 font-sans min-h-screen flex flex-col">
      {/* ... (Le reste du JSX de la Navbar et de la Sidebar ne change pas) ... */}
      <nav className="bg-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                type="button"
                className="md:hidden mr-3 p-2 rounded text-white hover:bg-blue-600"
                onClick={() => setSidebarOpen((s) => !s)}
              >
                <i data-feather="menu" className="h-6 w-6" />
              </button>
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
                  src={etudiant?.Image || "https://via.placeholder.com/200x200"}
                  alt="Profile"
                />
                <span className="ml-2 text-sm font-medium">
                  {etudiant?.Nom}
                </span>
                <i data-feather="chevron-down" className="ml-1 h-4 w-4"></i>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1">
        <aside
          className={`sidebar bg-white w-64 min-h-screen border-r ${
            sidebarOpen ? "" : "hidden"
          } md:block`}
        >
          <div className="p-4 border-b flex items-center">
            <img
              className="h-10 w-10 rounded-full"
              src={etudiant?.Image || "https://via.placeholder.com/200x200"}
              alt=""
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">
                {etudiant?.Nom}
              </p>
              <p className="text-xs text-gray-500">Étudiant</p>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            <Link
              to="/dashboard"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
            >
              <i data-feather="home" className="mr-3 h-5 w-5"></i> Tableau de bord
            </Link>
            <Link
              to="/mes_projets"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
            >
              <i data-feather="briefcase" className="mr-3 h-5 w-5"></i> Mes projets
            </Link>
            <Link
              to="/mes_livrables"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700"
            >
              <i data-feather="file-text" className="mr-3 h-5 w-5"></i> Mes livrables
            </Link>
            <Link
              to="/calendrierEtudiant"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
            >
              <i data-feather="calendar" className="mr-3 h-5 w-5"></i> Calendrier
            </Link>
            <Link
              to="/statistique_etudiant"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
            >
              <i data-feather="bar-chart-2" className="mr-3 h-5 w-5"></i> Mes statistiques
            </Link>
            <Link
              to="/parametre_etudiant"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
            >
              <i data-feather="settings" className="mr-3 h-5 w-5"></i> Paramètres
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-2 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50"
            >
              <i data-feather="log-out" className="mr-3 h-5 w-5"></i> Déconnexion
            </button>
          </nav>
        </aside>
      
        <main className="flex-1 p-8">
            {/* ... (Le reste du JSX du titre, filtres et stats ne change pas) ... */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Mes livrables</h1>
                <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                <i data-feather="plus" className="mr-2 h-4 w-4"></i> Nouveau livrable
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Filtrer :</span>
                {filterButtons.map((filter) => (
                    <button
                    key={filter}
                    onClick={() => {
                        setActiveFilter(filter);
                        setTimeout(() => feather.replace(), 0);
                    }}
                    className={`px-3 py-1 text-sm rounded-full border transition ${
                        activeFilter === filter
                        ? "bg-blue-600 text-white border-blue-600"
                        : "hover:bg-gray-100 text-gray-700 border-gray-300"
                    }`}
                    >
                    {filter}
                    </button>
                ))}
                <div className="ml-auto flex items-center">
                    <i data-feather="search" className="text-gray-400 mr-2"></i>
                    <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                <div
                    key={index}
                    className="bg-white rounded-lg shadow p-6"
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                >
                    <div className="flex items-center">
                    <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}>
                        <i data-feather={stat.icon}></i>
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                        <p className="text-2xl font-semibold text-gray-800">{stat.value}</p>
                    </div>
                    </div>
                </div>
                ))}
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                    {activeFilter === "Tous"
                    ? "Tous mes livrables"
                    : `Livrables : ${activeFilter} (${filteredLivrables.length})`}
                </h2>
                </div>
                <div className="divide-y divide-gray-200">
                {filteredLivrables.length > 0 ? (
                    filteredLivrables.map((liv, index) => (
                    <div
                        key={liv.Id_livrable || index}
                        className="px-6 py-4 transition hover:shadow-lg"
                    >
                        <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-gray-100">
                            <i data-feather="file-text" className="h-5 w-5 text-gray-600"></i>
                            </div>
                            <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-900">
                                {liv.title}
                            </h3>
                            <p className="text-sm text-gray-500">{liv.project}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex space-x-1">
                            {liv.categories.map((cat, i) => {
                                const classes = getStatusClasses(cat);
                                return (
                                <span
                                    key={i}
                                    className={`px-2 py-1 text-xs font-medium rounded-full ${classes.statusColor}`}
                                >
                                    {classes.label}
                                </span>
                                );
                            })}
                            </div>

                            <span className="text-sm text-gray-500">{liv.date}</span>

                            <div className="flex space-x-2">
                            <button
                                className="p-1 text-yellow-600 hover:text-yellow-800"
                                title="Modifier"
                                onClick={() => handleEditLivrable(liv)}
                            >
                                <i data-feather="edit" className="h-4 w-4"></i>
                            </button>
                            <button
                                className="p-1 text-red-600 hover:text-red-800"
                                title="Supprimer"
                                onClick={() => handleDeleteLivrable(liv.Id_livrable)}
                            >
                                <i data-feather="trash-2" className="h-4 w-4"></i>
                            </button>
                            {/* Afficher le bouton si le statut est Validé OU s'il y a un fichier */}
                            {(liv.categories.includes("Validé") || liv.hasFichier) && (
                                <button
                                className="p-1 text-blue-600 hover:text-blue-800"
                                title="Télécharger"
                                onClick={() => handleDownloadFile(liv.Id_livrable, liv.title)}
                                >
                                <i data-feather="download" className="h-4 w-4"></i>
                                </button>
                            )}
                            </div>
                        </div>
                        </div>
                    </div>
                    ))
                ) : (
                    <p className="px-6 py-4 text-sm text-gray-500">
                    Aucun livrable trouvé.
                    </p>
                )}
                </div>
            </div>
        </main>
      </div>

      {/* Modal pour l'ajout */}
      {isModalOpen && (
        <ModalAjoutLivrable
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAjoutLivrable}
          projets={projets}
          etudiantId={etudiant?.Immatricule}
        />
      )}

      {/* ✨ 5. Ajouter le nouveau modal pour la modification */}
      {isEditModalOpen && (
        <ModalModifierLivrable
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setLivrableSelectionne(null);
          }}
          onSubmit={handleUpdateLivrable}
          projets={projets}
          livrableAModifier={livrableSelectionne}
          etudiantId={etudiant?.Immatricule}
        />
      )}
    </div>
  );
};

export default MesLivrables;