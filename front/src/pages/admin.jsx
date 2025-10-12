// AdminUsers.jsx - VERSION CORRIGÉE
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

// --- DÉBUT DES ÉLÉMENTS DÉPLACÉS ---
// On définit la configuration et les fonctions utilitaires en dehors du composant.
// Elles ne seront ainsi créées qu'une seule fois et ne causeront pas d'avertissements de dépendances.

// Configuration axios avec headers corrects
const axiosConfig = {
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000, // 10 secondes de timeout
};

// Fonction pour construire l'URL de l'avatar depuis la base de données
const getAvatarUrl = (user, role) => {
  // La colonne pour l'avatar est 'Image' pour les étudiants et 'Avatar' pour les autres
  const avatarPath = role === "Étudiant" ? user.Image : user.Avatar;

  // Si le chemin existe et n'est pas un placeholder, on construit l'URL complète
  if (avatarPath && !avatarPath.startsWith('http')) {
    return `http://localhost:5000${avatarPath}`;
  }
  // Sinon, on retourne le chemin tel quel (pour les placeholders http) ou null
  return avatarPath;
};

// Fonction de secours pour générer un avatar si celui de la BDD est manquant
const generateFallbackAvatar = (name, role) => {
  const safeName = name || "User";
  // La ligne ci-dessous a été supprimée car la variable 'initials' n'était jamais utilisée.
  // const initials = safeName.substring(0, 2).toUpperCase(); 
  
  const backgroundColor = role === "Étudiant" ? "3B82F6" : "10B981";
  const encodedName = encodeURIComponent(safeName);

  // L'API ui-avatars.com génère les initiales automatiquement à partir du paramètre 'name'
  return `https://ui-avatars.com/api/?name=${encodedName}&background=${backgroundColor}&color=fff&size=40`;
};

// Fonction de normalisation de texte
const normalize = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

// --- FIN DES ÉLÉMENTS DÉPLACÉS ---

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminName, setAdminName] = useState("Admin");
  const [adminAvatar, setAdminAvatar] = useState("");

  // NOUVEAU : Récupérer les informations de l'admin depuis localStorage
  useEffect(() => {
    // Récupérer les données admin depuis localStorage (comme dans parametreAdmin.jsx)
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    const role = localStorage.getItem("role");

    if (loggedInUser && role === "admin") {
      setAdminName(loggedInUser.Nom || "Admin");
      setAdminAvatar(loggedInUser.Avatar || "");
    }

    if (window.feather) window.feather.replace();
    if (window.AOS) window.AOS.init();

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError("");

        console.log("📄 Récupération des utilisateurs...");

        const [etudiantsRes, encadreursRes] = await Promise.all([
          axios.get("http://localhost:5000/etudiants", axiosConfig),
          axios.get("http://localhost:5000/encadreurs", axiosConfig),
        ]);

        console.log("✅ Étudiants récupérés:", etudiantsRes.data);
        console.log("✅ Encadreurs récupérés:", encadreursRes.data);

        // MODIFIÉ : On traite les étudiants pour inclure leur avatar de la BDD
        const etudiants = etudiantsRes.data.map((e) => ({
          id: e.Immatricule,
          nom: e.Nom || "",
          email: e.Email || "",
          role: "Étudiant",
          // On utilise l'avatar de la BDD, sinon on génère un fallback
          avatar: getAvatarUrl(e, "Étudiant") || generateFallbackAvatar(e.Nom, "Étudiant"),
          originalData: e,
        }));

        // MODIFIÉ : On traite les encadreurs pour inclure leur avatar de la BDD
        const encadreurs = encadreursRes.data.map((e) => ({
          id: e.Matricule,
          nom: e.Nom || "",
          email: e.Email || "",
          role: "Encadreur",
          avatar: getAvatarUrl(e, "Encadreur") || generateFallbackAvatar(e.Nom, "Encadreur"),
          originalData: e,
        }));

        setUsers([...etudiants, ...encadreurs]);
        console.log(
          "👥 Total utilisateurs:",
          etudiants.length + encadreurs.length
        );
      } catch (error) {
        console.error("❌ Erreur récupération utilisateurs :", error);
        console.error("Détails de l'erreur:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        setError(`Erreur lors du chargement: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const searchNormalized = normalize(search);
    const matchName = normalize(user.nom).includes(searchNormalized);
    const matchEmail = normalize(user.email).includes(searchNormalized);
    const matchSearch = !search || matchName || matchEmail;

    const matchRole = filter === "all" || user.role === filter;

    return matchSearch && matchRole;
  });

  const handleDeleteUser = async (userId, userRole, userName) => {
    if (!window.confirm(`Supprimer "${userName}" ?`)) return;

    try {
      const endpoint = userRole === "Étudiant" ? "etudiants" : "encadreurs";
      const deleteUrl = `http://localhost:5000/${endpoint}/${userId}`;
      
      console.log(`🗑 Tentative suppression:`);
      console.log(`- Nom: ${userName}`);
      console.log(`- Rôle: ${userRole}`);
      console.log(`- ID: ${userId}`);
      console.log(`- URL: ${deleteUrl}`);

      const response = await axios.delete(deleteUrl, axiosConfig);
      console.log("✅ Réponse serveur:", response.data);

      setUsers((prev) => prev.filter((u) => u.id !== userId));
      alert(`✅ ${userName} supprimé !`);
    } catch (error) {
      console.error("❌ Erreur complète:", error);
      console.error("❌ Status:", error.response?.status);
      console.error("❌ Data:", error.response?.data);
      console.error("❌ URL tentée:", error.config?.url);
      
      alert(
        `Échec suppression: ${error.response?.data?.error || error.message}`
      );
    }
  };

  const clearSearch = () => {
    setSearch("");
  };

  // NOUVEAU : Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  // Test de connexion serveur
  const testServerConnection = async () => {
    try {
      console.log("🔍 Test de connexion serveur...");
      
      // Test route principale
      const response = await axios.get("http://localhost:5000/", axiosConfig);
      console.log("✅ Serveur accessible:", response.data);

      // Test des routes debug
      const debugResponse = await axios.get(
        "http://localhost:5000/debug",
        axiosConfig
      );
      console.log("📋 Informations serveur:", debugResponse.data);

      // Test routes utilisateurs
      try {
        const etudiantsTest = await axios.get("http://localhost:5000/etudiants", axiosConfig);
        console.log("👨‍🎓 Route étudiants OK:", etudiantsTest.data.length, "étudiants");
      } catch (err) {
        console.error("❌ Route étudiants échoue:", err.message);
      }

      try {
        const encadreursTest = await axios.get("http://localhost:5000/encadreurs", axiosConfig);
        console.log("👨‍🏫 Route encadreurs OK:", encadreursTest.data.length, "encadreurs");
      } catch (err) {
        console.error("❌ Route encadreurs échoue:", err.message);
      }

      alert("Tests terminés ! Vérifiez la console pour les détails.");
    } catch (error) {
      console.error("❌ Serveur inaccessible:", error);
      alert(`Serveur inaccessible: ${error.message}`);
    }
  };

  // Test spécifique des routes de suppression
  const testDeleteRoutes = async () => {
    try {
      console.log("🧪 Test des routes de suppression...");
      
      // Test avec un ID qui n'existe probablement pas
      const testId = 99999;
      
      try {
        await axios.delete(`http://localhost:5000/etudiants/${testId}`, axiosConfig);
      } catch (err) {
        console.log("🧪 Test étudiant (attendu 404):", err.response?.status, err.response?.data);
      }
      
      try {
        await axios.delete(`http://localhost:5000/encadreurs/${testId}`, axiosConfig);
      } catch (err) {
        console.log("🧪 Test encadreur (attendu 404):", err.response?.status, err.response?.data);
      }
      
      alert("Tests des routes DELETE terminés ! Vérifiez la console.");
    } catch (error) {
      console.error("❌ Erreur test:", error);
    }
  };

  // NOUVEAU : Composant Avatar intelligent avec gestion d'erreur
  const Avatar = ({ user }) => {
    const [imgSrc, setImgSrc] = useState(user.avatar);

    // Si l'image ne se charge pas, on utilise le fallback
    const handleError = () => {
      setImgSrc(generateFallbackAvatar(user.nom, user.role));
    };

    useEffect(() => {
      setImgSrc(user.avatar); // Mettre à jour si l'utilisateur change
    }, [user.avatar]);

    return (
      <img
        className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
        src={imgSrc}
        alt={`Avatar de ${user.nom}`}
        onError={handleError}
        loading="lazy"
      />
    );
  };

  return (
    <div className="bg-gray-50 font-sans min-h-screen">
      {/* Navbar */}
      <nav className="bg-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <i data-feather="book-open" className="h-8 w-8"></i>
              <div className="hidden md:block ml-10 space-x-4">
                <p className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-300 to-white bg-clip-text text-transparent">
                  Gestion des utilisateurs - Admin
                </p>
              </div>
            </div>
            {/* Boutons de test serveur */}
            <div className="flex space-x-2">
              <button
                onClick={testServerConnection}
                className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-sm transition-colors"
              >
                Test Serveur
              </button>
              <button
                onClick={testDeleteRoutes}
                className="bg-orange-600 hover:bg-orange-500 px-3 py-1 rounded text-sm transition-colors"
              >
                Test DELETE
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="bg-white w-64 min-h-screen border-r hidden md:block">
          <div className="p-4 border-b flex items-center">
            {/* MODIFIÉ : Avatar dynamique de l'admin depuis localStorage */}
            <img
              className="h-10 w-10 rounded-full object-cover"
              src={adminAvatar && !adminAvatar.startsWith('http') ? `http://localhost:5000${adminAvatar}` : (adminAvatar || "https://ui-avatars.com/api/?name=AD&background=A9A9A9&color=fff")}
              alt="Avatar Admin"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{adminName}</p>
              <p className="text-xs text-gray-500">Administrateur</p>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            <Link
              to="/admin/users"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700"
            >
              <i data-feather="users" className="mr-3 h-5 w-5"></i> Utilisateurs
            </Link>
            <Link
              to="/admin/setting"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              <i data-feather="settings" className="mr-3 h-5 w-5"></i>{" "}
              Paramètres
            </Link>
            {/* NOUVEAU : Bouton de déconnexion */}
            <button
              onClick={handleLogout}
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-red-50 hover:text-red-700 text-gray-600 transition-colors w-full text-left"
            >
              <i data-feather="log-out" className="mr-3 h-5 w-5"></i>{" "}
              Déconnexion
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Gestion des utilisateurs
            </h1>
            <div className="text-sm text-gray-600">
              {filteredUsers.length} utilisateur
              {filteredUsers.length > 1 ? "s" : ""} trouvé
              {filteredUsers.length > 1 ? "s" : ""}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
            <div className="relative w-full sm:w-1/3">
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 pl-10 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors"
              />
              <i
                data-feather="search"
                className="absolute left-3 top-3 h-4 w-4 text-gray-400"
              ></i>
              {search && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                >
                  <i data-feather="x"></i>
                </button>
              )}
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 bg-white transition-colors"
            >
              <option value="all">Tous les rôles</option>
              <option value="Étudiant">Étudiants seulement</option>
              <option value="Encadreur">Encadreurs seulement</option>
            </select>

            {(search || filter !== "all") && (
              <button
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Réinitialiser
              </button>
            )}
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">
                Chargement des utilisateurs...
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
              <button
                onClick={testServerConnection}
                className="ml-4 underline hover:no-underline"
              >
                Tester la connexion
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="overflow-x-auto bg-white shadow rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr
                      key={`${user.role}-${user.id}`}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar user={user} />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.nom || "Nom non défini"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email || "Email non défini"}
                            </div>
                            <div className="text-xs text-gray-400">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === "Étudiant"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => 
                            handleDeleteUser(user.id, user.role, user.nom)
                          }
                          className="text-red-600 hover:text-red-900 transition-colors mr-4"
                        >
                          Supprimer
                        </button>
                        
                      </td>
                    </tr>
                  ))}

                  {filteredUsers.length === 0 && !loading && (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        {search || filter !== "all"
                          ? "Aucun utilisateur trouvé avec ces critères"
                          : "Aucun utilisateur trouvé"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminUsers;