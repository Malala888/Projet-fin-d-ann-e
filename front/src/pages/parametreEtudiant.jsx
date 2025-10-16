import React, { useEffect, useState } from "react";
import feather from "feather-icons";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";

const ParametreEtudiant = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [etudiant, setEtudiant] = useState(null);
  const [formData, setFormData] = useState({
    Nom: "",
    Email: "",
    Mot_de_passe: "",
    Filiere: "",
    Parcours: "",
    Niveau: "",
  });
  const [newPhoto, setNewPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Récupérer les données de l'utilisateur au chargement
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

      // Initialiser le formulaire avec les données
      setFormData({
        Nom: userData.Nom || "",
        Email: userData.Email || "",
        Mot_de_passe: userData.Mot_de_passe || "",
        Filiere: userData.Filiere || "",
        Parcours: userData.Parcours || "",
        Niveau: userData.Niveau || "",
      });

      setLoading(false);
      console.log("✅ Données utilisateur chargées:", userData);
    } catch (error) {
      console.error("❌ Erreur de chargement:", error);
      localStorage.clear();
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    feather.replace();
  });

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    console.log(`📝 Champ ${id} modifié:`, value);
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!etudiant) return;

    console.log("🚀 Soumission du formulaire avec les données:", formData);

    try {
      // Étape 1: Mettre à jour les données textuelles
      const response = await axios.put(
        `http://localhost:5000/etudiants/${etudiant.Immatricule}`,
        formData
      );
      console.log("✅ Réponse du serveur:", response.data);

      // Étape 2: Si une nouvelle photo a été sélectionnée, l'uploader séparément
      if (newPhoto) {
        console.log("📸 Upload de la nouvelle photo...");
        console.log("📎 Informations du fichier:", {
          name: newPhoto.name,
          size: newPhoto.size,
          type: newPhoto.type,
        });

        const photoFormData = new FormData();
        photoFormData.append("photo", newPhoto);

        try {
          const photoResponse = await axios.post(
            `http://localhost:5000/etudiants/${etudiant.Immatricule}/photo`,
            photoFormData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          console.log("✅ Photo uploadée:", photoResponse.data);

          // Mettre à jour l'image dans les données utilisateur
          response.data.user.Image = photoResponse.data.imagePath;
        } catch (photoError) {
          console.error(
            "❌ Erreur lors de l'upload de la photo:",
            photoError.response ? photoError.response.data : photoError.message
          );
          // Continuer même si l'upload de la photo échoue
        }
      }

      // Mettre à jour les données locales
      const updatedUser = response.data.user;
      setEtudiant(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Forcer la mise à jour de l'image en ajoutant un timestamp
      if (updatedUser.Image) {
        const timestamp = new Date().getTime();
        updatedUser.Image =
          updatedUser.Image +
          (updatedUser.Image.includes("?") ? "&" : "?") +
          "_t=" +
          timestamp;
      }

      // Mettre à jour l'état local avec les nouvelles données
      setEtudiant(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Réinitialiser la nouvelle photo
      setNewPhoto(null);

      // Déclencher un événement personnalisé pour notifier les autres composants
      window.dispatchEvent(
        new CustomEvent("userProfileUpdated", { detail: updatedUser })
      );

      alert("✅ Profil mis à jour avec succès !");
    } catch (error) {
      console.error(
        "❌ Erreur lors de la mise à jour:",
        error.response ? error.response.data : error.message
      );
      alert("❌ Une erreur est survenue lors de la mise à jour.");
    }
  };

  if (loading || !etudiant) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl text-gray-700">🔄 Chargement...</p>
      </div>
    );
  }

  // Construire l'URL de l'image
  const profileImageUrl =
    etudiant.Image && !etudiant.Image.startsWith("http")
      ? `http://localhost:5000${etudiant.Image}`
      : etudiant.Image || "http://static.photos/people/200x200/2";

  return (
    <div className="bg-gray-50 font-sans min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                type="button"
                className="md:hidden mr-3 p-2 rounded text-white hover:bg-blue-600"
                onClick={() => setSidebarOpen((s) => !s)}
                aria-label="Toggle menu"
              >
                <i data-feather="menu" className="h-6 w-6" />
              </button>
              <i data-feather="book-open" className="h-8 w-8"></i>
              <div className="hidden md:block ml-3 sm:ml-10">
                <p className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-300 to-white bg-clip-text text-transparent">
                  Espace Étudiant
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="group relative">
                <div className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-blue-600 transition">
                  <img
                    className="h-8 w-8 rounded-full"
                    src={profileImageUrl}
                    alt="Profile"
                  />
                  <span className="ml-2 text-sm font-medium">
                    {etudiant.Nom}
                  </span>
                </div>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <i data-feather="log-out" className="mr-2 h-4 w-4"></i>{" "}
                    Déconnexion
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="md:hidden p-2 rounded text-white hover:bg-blue-600"
            >
              <i data-feather="log-out" className="h-6 w-6"></i>
            </button>
          </div>
        </div>
      </nav>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`sidebar bg-white w-64 min-h-screen border-r ${
            sidebarOpen ? "" : "hidden"
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
                {etudiant.Nom}
              </p>
              <p className="text-xs text-gray-500">
                Étudiant {etudiant.Niveau}
              </p>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            <Link
              to="/dashboard"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
            >
              <i data-feather="home" className="mr-3 h-5 w-5"></i> Tableau de
              bord
            </Link>
            <Link
              to="/mes_projet"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
            >
              <i data-feather="briefcase" className="mr-3 h-5 w-5"></i> Mes
              projets
            </Link>
            <Link
              to="/mes_livrables"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
            >
              <i data-feather="file-text" className="mr-3 h-5 w-5"></i> Mes
              livrables
            </Link>
            <Link
              to="/calendrierEtudiant"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
            >
              <i data-feather="calendar" className="mr-3 h-5 w-5"></i>{" "}
              Calendrier
            </Link>
            <Link
              to="/parametre_etudiant"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700"
            >
              <i data-feather="settings" className="mr-3 h-5 w-5"></i>{" "}
              Paramètres
            </Link>
            {/* Logout Section */}
            <div className="mt-8 pt-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 w-full text-left"
              >
                <i data-feather="log-out" className="mr-3 h-5 w-5"></i> Déconnexion
              </button>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <h1
            data-aos="fade-down"
            className="text-3xl font-bold text-gray-800 mb-6"
          >
            Paramètres de mon compte
          </h1>

          <section
            data-aos="fade-up"
            className="bg-white rounded-lg shadow-xl p-6 mb-8 border border-gray-200"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
              Informations personnelles
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Nom, Email, Mdp restent identiques */}
              <div>
                <label
                  htmlFor="Nom"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nom complet
                </label>
                <input
                  id="Nom"
                  type="text"
                  value={formData.Nom}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="Email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Adresse email
                </label>
                <input
                  id="Email"
                  type="email"
                  value={formData.Email}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="Mot_de_passe"
                  className="block text-sm font-medium text-gray-700"
                >
                  Mot de passe
                </label>
                <input
                  id="Mot_de_passe"
                  type="password"
                  value={formData.Mot_de_passe}
                  onChange={handleChange}
                  placeholder="Laissez vide pour ne pas changer"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Nouveaux champs pour Filiere, Parcours et Niveau */}
              <div>
                <label
                  htmlFor="Filiere"
                  className="block text-sm font-medium text-gray-700"
                >
                  Filière
                </label>
                <input
                  id="Filiere"
                  type="text"
                  value={formData.Filiere}
                  onChange={handleChange}
                  placeholder="Ex: Informatique"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="Parcours"
                  className="block text-sm font-medium text-gray-700"
                >
                  Parcours
                </label>
                <input
                  id="Parcours"
                  type="text"
                  value={formData.Parcours}
                  onChange={handleChange}
                  placeholder="Ex: IA, GL, Réseaux"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="Niveau"
                  className="block text-sm font-medium text-gray-700"
                >
                  Niveau
                </label>
                <select
                  id="Niveau"
                  value={formData.Niveau}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner un niveau</option>
                  <option value="L1">Licence 1</option>
                  <option value="L2">Licence 2</option>
                  <option value="L3">Licence 3</option>
                  <option value="M1">Master 1</option>
                  <option value="M2">Master 2</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="photo"
                  className="block text-sm font-medium text-gray-700"
                >
                  Photo de profil
                </label>
                <input
                  id="photo"
                  type="file"
                  onChange={handlePhotoChange}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                💾 Enregistrer les modifications
              </button>
            </form>
          </section>

          {/* Debug info */}
          <section className="bg-white rounded-lg shadow-xl p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
              🔍 Informations de debug
            </h2>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>Nom:</strong> {etudiant.Nom}
              </p>
              <p>
                <strong>Email:</strong> {etudiant.Email}
              </p>
              <p>
                <strong>Filière:</strong> {etudiant.Filiere || "Non définie"}
              </p>
              <p>
                <strong>Parcours:</strong> {etudiant.Parcours || "Non défini"}
              </p>
              <p>
                <strong>Niveau:</strong> {etudiant.Niveau || "Non défini"}
              </p>
              <p>
                <strong>Immatricule:</strong> {etudiant.Immatricule}
              </p>

              <details className="mt-4">
                <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                  📋 Voir les données complètes (JSON)
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                  {JSON.stringify(etudiant, null, 2)}
                </pre>
              </details>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ParametreEtudiant;
