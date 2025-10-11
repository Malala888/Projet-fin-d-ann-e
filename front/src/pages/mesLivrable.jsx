import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import feather from "feather-icons";
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";
import ModalAjoutLivrable from "./ModalAjoutLivrable";
import ModalModifierLivrable from "./ModalModifierLivrable";

// CONFIGURATION AXIOS POUR DÉSACTIVER LE CACHE
axios.defaults.headers.get['Cache-Control'] = 'no-cache';
axios.defaults.headers.get['Pragma'] = 'no-cache';
axios.defaults.headers.get['Expires'] = '0';

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [livrableSelectionne, setLivrableSelectionne] = useState(null);

  // CLÉ POUR FORCER LE RE-RENDER DE LA LISTE
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLogout = useCallback(() => {
    localStorage.clear();
    navigate("/login");
  }, [navigate]);

  const getStatusClasses = (category) => {
    const normalized = normalizeStatus(category);

    if (normalized === "validé" || normalized === "contient fichier" || normalized === "valide") {
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
        title: liv.Titre || liv.Titre_livrable || liv.Nom || `Livrable #${liv.Id_livrable}`,
        project: liv.Nom_projet || liv.Projet || "Projet Inconnu",
        date: liv.Date_soumission
          ? (() => {
              try {
                console.log(`🔍 FORMATAGE DATE pour ${liv.title}:`);
                console.log(`  Date originale: ${liv.Date_soumission}`);

                // Utiliser la même logique que projetDetail.jsx pour la cohérence
                const dateObj = new Date(liv.Date_soumission);
                if (!isNaN(dateObj.getTime())) {
                  const formattedDate = dateObj.toLocaleDateString('fr-FR');
                  console.log(`  Date formatée (toLocaleDateString): ${formattedDate}`);
                  console.log(`  Date ISO: ${dateObj.toISOString()}`);
                  return formattedDate;
                }

                console.log(`  ❌ Date invalide après parsing`);
                return "Date invalide";
              } catch (error) {
                console.error("❌ Erreur formatage date:", error, "pour:", liv.Date_soumission);
                return "Erreur date";
              }
            })()
          : "Non défini",
        categories,
        hasFichier,
        isFuture: dateSoumissionTimestamp > todayTimestamp,
        originalStatus: status,
        Date_soumission: liv.Date_soumission,
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
      console.log(`Debut téléchargement livrable ${livrableId}`);

      const response = await fetch(`http://localhost:5000/livrables/${livrableId}/download`);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = titre || `livrable_${livrableId}`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log(`Téléchargement réussi: ${filename}`);
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

  const handleEditLivrable = (livrable) => {
    console.log("Ouverture du modal de modification pour:", livrable);
    setLivrableSelectionne(livrable);
    setIsEditModalOpen(true);
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

  // ✅ FONCTION CORRIGÉE POUR LA MODIFICATION - VERSION ULTRA-AGRESSIVE
  const handleUpdateLivrable = async (livrableId, formData) => {
    try {
      console.log("🚀 === DÉBUT MODIFICATION ULTRA-AGRESSIVE ===");
      console.log("ID du livrable:", livrableId);

      // Afficher tout le contenu du FormData
      console.log("📝 Contenu du FormData:");
      for (let pair of formData.entries()) {
        console.log(`  ${pair[0]}: ${pair[1]}`);

        // Logging spécial pour la date
        if (pair[0] === 'Date_soumission') {
          console.log(`  📅 DATE SOUMISSION DÉTAILLÉE:`);
          console.log(`    Valeur reçue: ${pair[1]}`);
          console.log(`    Type: ${typeof pair[1]}`);

          // Essayer de parser la date
          try {
            const dateObj = new Date(pair[1]);
            console.log(`    Date parsée: ${dateObj.toISOString()}`);
            console.log(`    Date locale: ${dateObj.toLocaleDateString('fr-FR')}`);
          } catch (dateError) {
            console.error(`    ❌ Erreur parsing date:`, dateError);
          }
        }
      }

      // Envoyer la requête
      const response = await axios.put(
        `http://localhost:5000/livrables/${livrableId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ Réponse du serveur:", response.data);
      console.log("🚀 === FIN MODIFICATION ===");

      alert("Livrable modifié avec succès !");

      // Fermer le modal
      setIsEditModalOpen(false);
      setLivrableSelectionne(null);

      // APPROCHE ULTRA-AGRESSIVE POUR FORCER LE RAFRAÎCHISSEMENT
      console.log("🔥 RAFRAÎCHISSEMENT AGRESSIF...");

      // 1. Forcer le rechargement avec un timestamp unique
      const newTimestamp = new Date().getTime();
      console.log("🔄 Timestamp unique:", newTimestamp);

      // 2. Incrémenter la clé de refresh pour forcer le re-render
      setRefreshKey(prev => prev + 1);

      // 3. Recharger les données de manière agressive
      setTimeout(async () => {
        console.log("💪 RECHARGEMENT AGRESSIF - Phase 1");
        setLivrables([]); // Vider d'abord
        setStats([]);
        await fetchData();

        // Double vérification après 1 seconde
        setTimeout(async () => {
          console.log("💪 RECHARGEMENT AGRESSIF - Phase 2");
          await fetchData();
        }, 1000);
      }, 300);

    } catch (error) {
      console.error("❌ === ERREUR MODIFICATION ===");
      console.error("Erreur complète:", error);
      console.error("Réponse du serveur:", error.response?.data);

      const errorMessage = error.response?.data?.error
        || error.response?.data?.details
        || error.message
        || "Erreur inconnue";

      alert("Erreur lors de la modification : " + errorMessage);
    }
  };

  const fetchData = useCallback(async () => {
    if (!etudiant) return;
    try {
      console.log("🔄 Récupération des données pour l'étudiant:", etudiant.Immatricule);

      // AJOUTER UN TIMESTAMP POUR ÉVITER LE CACHE
      const timestamp = new Date().getTime();
      console.log("🕒 Timestamp généré:", timestamp);

      const [livrablesResponse, projetsResponse] = await Promise.all([
        axios.get(`http://localhost:5000/etudiants/${etudiant.Immatricule}/livrables?_=${timestamp}`),
        axios.get(`http://localhost:5000/etudiants/${etudiant.Immatricule}/projets?_=${timestamp}`),
      ]);

      console.log("📦 DONNÉES BRUTES REÇUES:");
      console.log("Nombre de livrables:", livrablesResponse.data.length);
      console.log("Livrables reçus:", livrablesResponse.data);

      // Vérifier si les données ont changé
      console.log("🔍 VÉRIFICATION DES DATES:");
      livrablesResponse.data.forEach((liv, index) => {
        console.log(`Livrable ${index + 1}: ID=${liv.Id_livrable}, Date=${liv.Date_soumission}, Titre=${liv.Titre}`);
      });

      const formattedLivrables = formatLivrables(livrablesResponse.data);
      console.log("📋 DONNÉES FORMATÉES:");
      console.log("Nombre après formatage:", formattedLivrables.length);
      formattedLivrables.forEach((liv, index) => {
        console.log(`Formaté ${index + 1}: titre=${liv.title}, date=${liv.date}, projet=${liv.project}`);
      });

      setLivrables(formattedLivrables);
      setStats(calculateStats(formattedLivrables));
      setProjets(projetsResponse.data);

      console.log("✅ STATE MIS À JOUR - Nouvelles données appliquées");
      setTimeout(() => feather.replace(), 0);
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des données :", error);
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

  // DEBUG: Afficher les données filtrées
  console.log("🔍 DONNÉES FILTRÉES:");
  console.log("Filtre actif:", activeFilter);
  console.log("Recherche:", searchQuery);
  console.log("Nombre de livrables affichés:", filteredLivrables.length);
  filteredLivrables.forEach((liv, index) => {
    console.log(`Affiché ${index + 1}: ${liv.title} - ${liv.date} - ${liv.project}`);
  });

  // FONCTION DE DIAGNOSTIC POUR VÉRIFIER LES DONNÉES
  const checkDataIntegrity = () => {
    console.log("🔬 DIAGNOSTIC DES DONNÉES:");
    console.log("État livrables:", livrables.length, "éléments");
    console.log("État projets:", projets.length, "éléments");
    console.log("État stats:", stats.length, "éléments");
    console.log("Refresh key:", refreshKey);
    console.log("Loading:", loading);
    console.log("Etudiant:", etudiant?.Immatricule);
  };

  // Exécuter le diagnostic à chaque render (temporaire pour debug)
  if (livrables.length > 0) {
    checkDataIntegrity();
  }

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

  // Écouter les changements dans localStorage pour mettre à jour les données utilisateur
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "user" && e.newValue) {
        try {
          const updatedUser = JSON.parse(e.newValue);
          setEtudiant(updatedUser);
          console.log("🔄 Données utilisateur mises à jour dans livrables:", updatedUser);
        } catch (error) {
          console.error("❌ Erreur lors de la mise à jour des données:", error);
        }
      }
    };

    // Écouter les événements personnalisés de mise à jour utilisateur
    const handleUserUpdate = (e) => {
      const updatedUser = e.detail;
      setEtudiant(updatedUser);
      console.log("🔄 Données utilisateur mises à jour via événement personnalisé:", updatedUser);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userProfileUpdated", handleUserUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userProfileUpdated", handleUserUpdate);
    };
  }, []);

  const filterButtons = ["Tous", "À venir", "En attente", "Validé"];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-blue-600">🔄 Chargement des données...</p>
      </div>
    );
  }

  // Construire l'URL de l'image avec cache busting
  const profileImageUrl = etudiant?.Image && !etudiant.Image.startsWith('http')
    ? `http://localhost:5000${etudiant.Image}${etudiant.Image.includes('?') ? '&' : '?'}t=${new Date().getTime()}`
    : etudiant?.Image || "http://static.photos/people/200x200/2";

  return (
    <div className="bg-gray-50 font-sans min-h-screen flex flex-col">
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
              <div className="group relative">
                <div className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-blue-600 transition">
                  <img
                    className="h-8 w-8 rounded-full"
                    src={profileImageUrl}
                    alt="Profile"
                  />
                  <span className="ml-2 text-sm font-medium">
                    {etudiant?.Nom}
                  </span>
                  <i data-feather="chevron-down" className="ml-1 h-4 w-4"></i>
                </div>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <i data-feather="log-out" className="mr-2 h-4 w-4"></i> Déconnexion
                  </button>
                </div>
              </div>
            </div>
            <button onClick={handleLogout} className="md:hidden p-2 rounded text-white hover:bg-blue-600">
              <i data-feather="log-out" className="h-6 w-6"></i>
            </button>
          </div>
        </div>
      </nav>

      <div className="flex flex-1">
        <aside
          className={`sidebar bg-white w-64 min-h-screen border-r ${sidebarOpen ? "" : "hidden"
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
                {etudiant?.Nom}
              </p>
              <p className="text-xs text-gray-500">Étudiant {etudiant?.Niveau}</p>
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
              to="/mes_projet"
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Mes livrables</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  console.log("🔄 RECHARGEMENT MANUEL DEMANDÉ");
                  setRefreshKey(prev => prev + 1);
                  fetchData();
                }}
                className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center text-sm"
                title="Recharger les données"
              >
                <i data-feather="refresh-cw" className="mr-2 h-4 w-4"></i> Recharger
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <i data-feather="plus" className="mr-2 h-4 w-4"></i> Nouveau livrable
              </button>
            </div>
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
                    key={`${liv.Id_livrable}-${refreshKey}-${index}`}
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

      {isModalOpen && (
        <ModalAjoutLivrable
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAjoutLivrable}
          projets={projets}
          etudiantId={etudiant?.Immatricule}
        />
      )}

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