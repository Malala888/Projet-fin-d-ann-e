import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import feather from "feather-icons";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

const Parametres = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // NOUVELLE LIGNE : État pour la visibilité de la fenêtre de débogage
  const [showDebug, setShowDebug] = useState(true);

  const location = useLocation();

  useEffect(() => {
    // NOUVELLE SECTION : Gérer la persistance de l'affichage du debug
    const hideDebug = localStorage.getItem('hideDebugInfo');
    if (hideDebug === 'true') {
      setShowDebug(false);
    }

    AOS.init();
    feather.replace();

    // Récupérer les données utilisateur du localStorage
    const userData = localStorage.getItem("user");
    const userRole = localStorage.getItem("role");

    console.log("🔍 Debug - userData:", userData);
    console.log("🔍 Debug - userRole:", userRole);

    if (userData && userRole === "encadreur") {
      try {
        console.log("✅ Utilisateur encadreur autorisé à voir les paramètres");
        const userInfo = JSON.parse(userData);

        // Vérifier que les données utilisateur sont complètes
        if (!userInfo.Matricule || !userInfo.Nom) {
          console.error("❌ Données utilisateur incomplètes:", userInfo);
          alert("Erreur: Données utilisateur incomplètes. Reconnexion nécessaire.");
          localStorage.clear();
          window.location.href = "/login";
          return;
        }

        setUser(userInfo);
        // Initialiser les données du formulaire avec les données utilisateur
        setFormData({
          nomComplet: userInfo.Nom || '',
          email: userInfo.Email || '',
          titre: userInfo.Titre || ''
        });

        console.log("✅ Profil chargé avec succès:", userInfo.Nom);
      } catch (error) {
        console.error("❌ Erreur parsing données utilisateur:", error);
        localStorage.clear();
        window.location.href = "/login";
      }
    } else {
      console.log("❌ Pas d'utilisateur autorisé, redirection vers login");
      // Rediriger si l'utilisateur n'est pas connecté ou n'est pas un encadreur
      window.location.href = "/login";
    }
  }, []);

  // useEffect séparé pour gérer les icônes après le rendu
  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.feather) {
        window.feather.replace();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);


  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.put(
        `http://localhost:5000/encadreurs/${user.Matricule}`,
        {
          Nom: formData.nomComplet,
          Email: formData.email,
          Titre: formData.titre
        }
      );

      console.log("✅ Réponse du serveur:", response.data);

      // Récupérer l'utilisateur mis à jour depuis la réponse du serveur
      const updatedUser = response.data.user;
      console.log('🔍 Debug - Ancien utilisateur:', user);
      console.log('🔍 Debug - Nouvel utilisateur:', updatedUser);

      // Vérifier que l'avatar est présent dans la réponse
      if (updatedUser && updatedUser.Avatar) {
        console.log('📸 Avatar récupéré depuis le serveur:', updatedUser.Avatar);
      } else {
        console.log('⚠️ Aucun avatar dans la réponse du serveur');
      }

      // Mettre à jour les données locales avec l'utilisateur complet
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Forcer le rafraîchissement des données du formulaire
      setFormData({
        nomComplet: updatedUser.Nom || '',
        email: updatedUser.Email || '',
        titre: updatedUser.Titre || ''
      });

      console.log('🔍 Debug - Données mises à jour:', {
        nomComplet: updatedUser.Nom,
        email: updatedUser.Email,
        titre: updatedUser.Titre,
        avatar: updatedUser.Avatar
      });

      setMessage({ type: 'success', text: 'Profil mis à jour avec succès!' });
    } catch (error) {
      console.error('Erreur:', error.response ? error.response.data : error.message);
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du profil.' });
    } finally {
      setLoading(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const currentPassword = e.target.currentPassword.value;
    const newPassword = e.target.newPassword.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/encadreurs/${user.Matricule}/password`,
        {
          currentPassword,
          newPassword
        }
      );

      console.log("✅ Mot de passe mis à jour:", response.data);
      setMessage({ type: 'success', text: 'Mot de passe mis à jour avec succès!' });
      e.target.reset();
    } catch (error) {
      console.error('Erreur:', error.response ? error.response.data : error.message);
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du mot de passe.' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.match('image.*')) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner une image valide.' });
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'L\'image ne doit pas dépasser 5MB.' });
      return;
    }

    // Vérifier que le matricule existe avant de continuer
    if (!user?.Matricule) {
      console.error('❌ Matricule manquant:', user);
      setMessage({ type: 'error', text: 'Erreur: Matricule utilisateur manquant.' });
      return;
    }

    console.log('🔍 Debug - Matricule avant upload:', user.Matricule);

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      console.log('🔍 Debug - URL appelée:', `http://localhost:5000/encadreurs/${user.Matricule}/image`);

      const response = await axios.post(
        `http://localhost:5000/encadreurs/${user.Matricule}/image`,
        formDataUpload,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log("✅ Image uploadée:", response.data);

      // Récupérer l'utilisateur mis à jour depuis la réponse du serveur
      const updatedUser = response.data.user || response.data;

      console.log('🔍 Debug - Utilisateur avant mise à jour:', user);
      console.log('🔍 Debug - Utilisateur après mise à jour:', updatedUser);

      if (updatedUser && updatedUser.Avatar) {
        console.log('📸 Avatar récupéré depuis le serveur:', updatedUser.Avatar);

        // Ajouter un timestamp pour forcer le cache à se vider
        const timestamp = new Date().getTime();
        const newAvatarUrl = `${updatedUser.Avatar}?t=${timestamp}`;

        // Créer l'utilisateur final avec l'avatar mis à jour
        const finalUpdatedUser = {
          ...updatedUser,
          Avatar: newAvatarUrl
        };

        // Mettre à jour l'état React
        setUser(finalUpdatedUser);

        // Mettre à jour le localStorage
        localStorage.setItem('user', JSON.stringify(finalUpdatedUser));

        console.log('✅ Avatar mis à jour avec succès:', newAvatarUrl);
      } else {
        console.log('⚠️ Aucun avatar dans la réponse du serveur');
        // Mettre à jour quand même les autres informations
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      setMessage({ type: 'success', text: 'Photo de profil mise à jour avec succès!' });
    } catch (error) {
      console.error('Erreur:', error.response ? error.response.data : error.message);
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour de la photo.' });
    } finally {
      setLoading(false);
    }
  };

  const deleteProfileImage = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    // Vérifier que le matricule existe avant de continuer
    if (!user?.Matricule) {
      console.error('❌ Matricule manquant:', user);
      setMessage({ type: 'error', text: 'Erreur: Matricule utilisateur manquant.' });
      return;
    }

    setShowDeleteConfirm(false);
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      console.log('🔍 Debug - Matricule avant suppression:', user.Matricule);

      const response = await axios.delete(
        `http://localhost:5000/encadreurs/${user.Matricule}/image`
      );

      console.log("✅ Image supprimée:", response.data);

      // Mettre à jour les données locales avec vérification
      let updatedUser;
      if (response.data.user) {
        updatedUser = response.data.user;
      } else if (response.data.Matricule) {
        updatedUser = response.data;
      } else {
        // Si pas de données utilisateur, garder l'utilisateur actuel mais supprimer l'avatar
        updatedUser = { ...user, Avatar: null };
      }

      console.log('🔍 Debug - Utilisateur après suppression:', updatedUser);

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setMessage({ type: 'success', text: 'Photo de profil supprimée avec succès!' });
    } catch (error) {
      console.error('Erreur:', error.response ? error.response.data : error.message);
      setMessage({ type: 'error', text: 'Erreur lors de la suppression de la photo.' });
    } finally {
      setLoading(false);
    }
  };

  const isActive = (path) => {
    return location.pathname === path
      ? "bg-blue-50 text-blue-700"
      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900";
  };


  // Si l'utilisateur n'est pas encore chargé, afficher un indicateur de chargement
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du profil...</p>
          <p className="mt-2 text-sm text-gray-500">
            Si le chargement dure trop longtemps, essayez de vous reconnecter.
          </p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Retour au login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Navbar */}
      <nav className="bg-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <i data-feather="book-open" className="h-8 w-8"></i>
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
                  alt="Profile"
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
              alt="Profile"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.Nom || "Utilisateur"}</p>
              <p className="text-xs text-gray-500">{user?.Titre || "Encadreur"}</p>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            <Link
              to="/index"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                "/index"
              )}`}
            >
              <i data-feather="home" className="mr-3 h-5 w-5"></i> Dashboard
            </Link>
            <Link
              to="/etudiant"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                "/etudiant"
              )}`}
            >
              <i data-feather="users" className="mr-3 h-5 w-5"></i> Étudiants
            </Link>
            <Link
              to="/projet"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                "/projet"
              )}`}
            >
              <i data-feather="briefcase" className="mr-3 h-5 w-5"></i> Projets
            </Link>
            <Link
              to="/calendrier"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                "/calendrier"
              )}`}
            >
              <i data-feather="calendar" className="mr-3 h-5 w-5"></i> Calendrier
            </Link>
            <Link
              to="/livrable"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                "/livrable"
              )}`}
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
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                    "/parametre"
                  )}`}
                >
                  <i data-feather="settings" className="mr-3 h-5 w-5"></i>{" "}
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

        {/* Main */}
        <main className="flex-1 p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Paramètres du compte
            </h1>
            <p className="text-sm text-gray-600">
              Connecté en tant que : <strong>{user?.Nom || "Utilisateur"}</strong> ({user?.Titre || "Encadreur"})
            </p>
          </div>

          {/* Section d'aide si problème */}
          {(!user?.Avatar && !user?.Nom) && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">⚠️ Problème détecté</h3>
              <p className="text-sm text-yellow-700 mb-3">
                Il semble y avoir un problème avec le chargement de votre profil.
              </p>
              <div className="space-x-2">
                <button
                  onClick={() => window.location.reload()}
                  className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
                >
                  🔄 Réessayer
                </button>
                <button
                  onClick={() => {
                    localStorage.clear();
                    window.location.href = "/login";
                  }}
                  className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                >
                  🔑 Reconnexion
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile settings */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Informations personnelles
                  </h2>
                </div>
                <div className="px-6 py-4">
                  <form onSubmit={saveProfile} className="space-y-4">
                    <div>
                      <label
                        htmlFor="nomComplet"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Nom et prénoms
                      </label>
                      <input
                        id="nomComplet"
                        type="text"
                        value={formData.nomComplet}
                        onChange={handleInputChange}
                        placeholder="Ex: Dr. Rakoto Jean"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="titre"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Titre
                      </label>
                      <input
                        id="titre"
                        type="text"
                        value={formData.titre}
                        onChange={handleInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    {message.text && (
                      <div className={`p-3 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                        {message.text}
                      </div>
                    )}
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className={`px-4 py-2 rounded-md text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                      >
                        {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Password settings */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Changer le mot de passe
                  </h2>
                </div>
                <div className="px-6 py-4">
                  <form onSubmit={savePassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mot de passe actuel
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        required
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        required
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmer le nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        required
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className={`px-4 py-2 rounded-md text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                      >
                        {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Profile photo */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Photo de profil
                  </h2>
                </div>
                <div className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="mr-4">
                      <img
                        className="h-16 w-16 rounded-full"
                        src={user?.Avatar ? `http://localhost:5000${user.Avatar}` : "http://static.photos/people/200x200/1"}
                        alt="Profile"
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          id="imageUpload"
                        />
                        <label
                          htmlFor="imageUpload"
                          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm cursor-pointer inline-block"
                        >
                          Changer la photo
                        </label>
                      </div>
                      <button
                        onClick={deleteProfileImage}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                      >
                        {showDeleteConfirm ? 'Confirmer la suppression' : 'Supprimer'}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">
                    Formats recommandés: JPG, PNG ou GIF. Taille max: 5MB.
                  </p>
                </div>
              </div>




            </div>
          </div>
        </main>
      </div>

      {/* Debug section - Maintenant conditionnelle */}
      {showDebug && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 border max-w-md">
          <h3 className="text-sm font-bold text-gray-900 mb-2">🔍 Debug Info</h3>
          <div className="space-y-1 text-xs text-gray-700">
            <p><strong>Nom:</strong> {user?.Nom || 'N/A'}</p>
            <p><strong>Email:</strong> {user?.Email || 'N/A'}</p>
            <p><strong>Matricule:</strong> {user?.Matricule || 'N/A'}</p>
            <p><strong>Titre:</strong> {user?.Titre || 'N/A'}</p>
            <p><strong>Avatar:</strong> {user?.Avatar || 'N/A'}</p>
            <div className="mt-2 space-x-2">
              <button
                onClick={() => window.location.reload()}
                className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
              >
                🔄 Actualiser
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/login';
                }}
                className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
              >
                🚪 Déconnexion
              </button>
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer text-blue-600">📋 Données complètes</summary>
              <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                {JSON.stringify(user, null, 2)}
              </pre>
            </details>
            <details className="mt-2">
              <summary className="cursor-pointer text-blue-600">📋 Form Data</summary>
              <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </details>

            {/* --- DÉBUT DES AJOUTS --- */}
            <div className="mt-4 pt-2 border-t flex justify-end space-x-2">
              <button
                onClick={() => setShowDebug(false)}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  localStorage.setItem('hideDebugInfo', 'true');
                  setShowDebug(false);
                }}
                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
              >
                Ne plus montrer
              </button>
            </div>
            {/* --- FIN DES AJOUTS --- */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Parametres;
