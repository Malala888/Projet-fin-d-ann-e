// parametreAdmin.jsx - VERSION DYNAMIQUE ET FONCTIONNELLE
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function AdminSettings() {
  // États pour les données de l'admin, initialisés à vide
  const [adminId, setAdminId] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState(""); // Stockera le chemin de l'avatar

  // États pour le changement de mot de passe
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // NOUVEAU : État pour gérer le fichier d'avatar sélectionné
  const [avatarFile, setAvatarFile] = useState(null);

  const axiosConfig = {
    headers: { "Content-Type": "application/json" },
  };

  // Récupérer les informations de l'admin au chargement
  useEffect(() => {
    // On suppose que les infos de l'utilisateur sont dans le localStorage après connexion
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    const role = localStorage.getItem("role");

    if (loggedInUser && role === "admin") {
      setAdminId(loggedInUser.Id_admin);
      setName(loggedInUser.Nom || "");
      setEmail(loggedInUser.Email || "");
      setAvatar(loggedInUser.Avatar || "");
    }

    if (window.feather) {
      window.feather.replace();
    }
  }, []);

  // Gérer la mise à jour du profil
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!adminId) return;

    try {
      await axios.put(
        `http://localhost:5000/admin/${adminId}`,
        { Nom: name, Email: email },
        axiosConfig
      );

      // Mettre à jour le localStorage pour que les changements soient persistants
      const updatedUser = { ...JSON.parse(localStorage.getItem("user")), Nom: name, Email: email };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      alert("Profil mis à jour avec succès !");
    } catch (error) {
      console.error("Erreur mise à jour profil:", error);
      alert(`Échec de la mise à jour: ${error.response?.data?.error || error.message}`);
    }
  };

  // Gérer le changement de mot de passe
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Les nouveaux mots de passe ne correspondent pas !");
      return;
    }
    if (!adminId || !currentPassword || !newPassword) {
      alert("Veuillez remplir tous les champs de mot de passe.");
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/admin/${adminId}/password`,
        { currentPassword, newPassword },
        axiosConfig
      );
      alert("Mot de passe mis à jour avec succès !");
      // Vider les champs après succès
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Erreur changement mot de passe:", error);
      alert(`Échec de la mise à jour: ${error.response?.data?.error || error.message}`);
    }
  };

  // Gérer le changement de l'avatar
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      // Créer une URL temporaire pour la prévisualisation de l'image
      setAvatar(URL.createObjectURL(file));
    }
  };

  // Gérer le téléversement de l'avatar
  const handleAvatarUpload = async () => {
    if (!avatarFile || !adminId) {
      alert("Veuillez sélectionner un fichier avant de mettre à jour.");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", avatarFile); // Le nom 'avatar' doit correspondre à celui dans `upload.single()`

    try {
      const response = await axios.post(
        `http://localhost:5000/admin/${adminId}/photo`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const { avatarPath } = response.data;

      // Mettre à jour l'état local et le localStorage
      setAvatar(avatarPath);
      const updatedUser = { ...JSON.parse(localStorage.getItem("user")), Avatar: avatarPath };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      alert("Avatar mis à jour ! La page va se rafraîchir pour appliquer le changement partout.");

      // Recharger la page pour que la sidebar se mette à jour
      window.location.reload();

    } catch (error) {
      console.error("Erreur téléversement avatar:", error);
      alert(`Échec du téléversement: ${error.response?.data?.error || error.message}`);
    }
  };

  // NOUVEAU : Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  return (
    <div className="bg-gray-50 font-sans">
      {/* Navbar */}
      <nav className="bg-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <i data-feather="book-open" className="h-8 w-8"></i>
              <p className="ml-4 text-xl font-bold tracking-tight bg-gradient-to-r from-blue-300 to-white bg-clip-text text-transparent">
                Paramètres - Admin
              </p>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="bg-white w-64 min-h-screen border-r hidden md:block">
          <div className="p-4 border-b flex items-center">
            {/* Avatar dynamique dans la sidebar */}
            <img
              className="h-10 w-10 rounded-full object-cover"
              src={avatar && !avatar.startsWith('blob:') ? `http://localhost:5000${avatar}` : avatar || "http://static.photos/people/200x200/1"}
              alt="Avatar Admin"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{name || "Admin"}</p>
              <p className="text-xs text-gray-500">Administrateur</p>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            <Link to="/admin/users" className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors">
              <i data-feather="users" className="mr-3 h-5 w-5"></i> Utilisateurs
            </Link>
            <Link to="/admin/setting" className="flex items-center px-2 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700">
              <i data-feather="settings" className="mr-3 h-5 w-5"></i> Paramètres
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

        {/* Main content */}
        <main className="flex-1 p-8 space-y-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Paramètres du compte
          </h1>

          {/* Section Avatar */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Photo de profil
            </h2>
            <div className="flex items-center space-x-6">
              <img
                className="h-24 w-24 rounded-full object-cover"
                src={avatar && !avatar.startsWith('blob:') ? `http://localhost:5000${avatar}` : avatar || "http://static.photos/people/200x200/1"}
                alt="Avatar actuel"
              />
              <div className="flex flex-col space-y-2">
                <label className="block text-sm font-medium text-gray-600">
                  Changer l'avatar
                </label>
                {/* Input de type 'file' */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                 {avatarFile && (
                  <button
                    onClick={handleAvatarUpload}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 w-fit"
                  >
                    Mettre à jour l'avatar
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Profil */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Informations du profil
            </h2>
            {/* onSubmit pointe vers la nouvelle fonction */}
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Nom complet
                </label>
                <input
                  type="text"
                  className="mt-1 px-4 py-2 border rounded-lg w-full shadow-sm focus:ring focus:ring-blue-200"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Email
                </label>
                <input
                  type="email"
                  className="mt-1 px-4 py-2 border rounded-lg w-full shadow-sm focus:ring focus:ring-blue-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
              >
                Mettre à jour les informations
              </button>
            </form>
          </section>

          {/* Mot de passe */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Changer le mot de passe
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {/* Inputs pour le mot de passe (avec value et onChange) */}
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  className="mt-1 px-4 py-2 border rounded-lg w-full shadow-sm focus:ring focus:ring-blue-200"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  className="mt-1 px-4 py-2 border rounded-lg w-full shadow-sm focus:ring focus:ring-blue-200"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  className="mt-1 px-4 py-2 border rounded-lg w-full shadow-sm focus:ring focus:ring-blue-200"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
              >
                Mettre à jour le mot de passe
              </button>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}

export default AdminSettings;
