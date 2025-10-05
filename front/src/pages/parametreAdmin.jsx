import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function AdminSettings() {
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("admin@eni.fr");
  const [avatar, setAvatar] = useState("http://static.photos/people/200x200/1");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (window.feather) {
      window.feather.replace();
    }
    if (window.AOS) {
      window.AOS.init();
    }
  }, []);

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    alert("Profil mis à jour !");
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas !");
      return;
    }
    alert("Mot de passe mis à jour !");
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
    <img
      className="h-10 w-10 rounded-full"
      src="http://static.photos/people/200x200/1"
      alt=""
    />
    <div className="ml-3">
      <p className="text-sm font-medium text-gray-700">Admin</p>
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
      to="/admin/settings"
      className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50"
    >
      <i data-feather="settings" className="mr-3 h-5 w-5"></i> Paramètres
    </Link>
  </nav>
</aside>

        {/* Main content */}
        <main className="flex-1 p-8 space-y-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Paramètres du compte
          </h1>

          {/* Profil */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Informations du profil
            </h2>
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

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Photo de profil (URL)
                </label>
                <input
                  type="text"
                  className="mt-1 px-4 py-2 border rounded-lg w-full shadow-sm focus:ring focus:ring-blue-200"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
              >
                Mettre à jour
              </button>
            </form>
          </section>

          {/* Mot de passe */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Changer le mot de passe
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
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
