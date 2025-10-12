// src/pages/Calendrier.jsx
import React, { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
// Import Link for routing
import { Link } from "react-router-dom";

// Pas d'import CSS - styles définis dans index.html ou CSS global

import "aos/dist/aos.css";
import AOS from "aos";
import feather from "feather-icons";

// Styles CSS personnalisés pour FullCalendar
const calendarStyles = `
  .fc {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  .fc-toolbar-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
  }
  .fc-button {
    background: #3b82f6;
    border: 1px solid #3b82f6;
    border-radius: 0.375rem;
  }
  .fc-button:hover {
    background: #2563eb;
    border-color: #2563eb;
  }
  .fc-event {
    border-radius: 0.25rem;
    border: none;
    font-size: 0.875rem;
  }
  .fc-daygrid-event {
    margin: 1px 2px;
  }
`;

const Calendrier = () => {
  const calendarRef = useRef(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 600 });
    feather.replace();

    // Inject custom styles for FullCalendar
    const styleSheet = document.createElement('style');
    styleSheet.textContent = calendarStyles;
    document.head.appendChild(styleSheet);

    // Récupérer les données utilisateur du localStorage
    const userData = localStorage.getItem("user");
    const userRole = localStorage.getItem("role");

    console.log("🔍 Debug - userData:", userData);
    console.log("🔍 Debug - userRole:", userRole);

    if (userData && userRole === "encadreur") {
      console.log("✅ Utilisateur encadreur autorisé à voir le calendrier");
      setUser(JSON.parse(userData));
    } else {
      console.log("❌ Pas d'utilisateur autorisé, redirection vers login");
      // Rediriger si l'utilisateur n'est pas connecté ou n'est pas un encadreur
      window.location.href = "/login";
    }

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // useEffect séparé pour gérer les icônes après le rendu
  useEffect(() => {
    if (window.feather) {
      window.feather.replace();
    }
  });

  const handleEventClick = (info) => {
    alert(`Événement : ${info.event.title}`);
  };

  const openModal = () => {
    document.getElementById("eventModal").classList.remove("hidden");
  };

  const closeModal = () => {
    document.getElementById("eventModal").classList.add("hidden");
  };

  const saveEvent = () => {
    alert("Réunion planifiée avec succès !");
    closeModal();
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
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Navbar */}
      <nav className="bg-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <i data-feather="book-open" className="h-8 w-8"></i>
              <div className="hidden md:block ml-10">
                <p className="text-xl font-bold bg-gradient-to-r from-blue-300 to-white bg-clip-text text-transparent">
                  Gestion de Projet
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <button className="p-1 rounded-full text-blue-200 hover:text-white relative">
                <i data-feather="bell"></i>
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
              </button>
              <div className="flex items-center">
                <img
                  className="h-8 w-8 rounded-full"
                  src={user?.Image ? `${user.Image}` : "http://static.photos/people/200x200/1"}
                  alt="Profile"
                />
                <span className="ml-2 text-sm font-medium">{user?.Nom || "Utilisateur"}</span>
                <i data-feather="chevron-down" className="ml-1 h-4 w-4"></i>
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
              src={user?.Image ? `${user.Image}` : "http://static.photos/people/200x200/1"}
              alt=""
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.Nom || "Utilisateur"}</p>
              <p className="text-xs text-gray-500">{user?.Titre || "Encadreur"}</p>
            </div>
          </div>
          <nav className="p-4 space-y-1">
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
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700"
            >
              <i data-feather="calendar" className="mr-3 h-5 w-5"></i> Calendrier
            </Link>
            <Link
              to="/livrable"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50"
            >
              <i data-feather="file-text" className="mr-3 h-5 w-5"></i> Livrables
            </Link>
            <Link
              to="/statistique"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50"
            >
              <i data-feather="bar-chart-2" className="mr-3 h-5 w-5"></i> Statistiques
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
                  <i data-feather="settings" className="mr-3 h-5 w-5"></i> Paramètres
                </Link>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Calendrier des réunions</h1>
            <button
              id="addEventBtn"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              onClick={openModal}
            >
              <i data-feather="plus" className="mr-2 h-4 w-4"></i> Nouvelle réunion
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filtrer par étudiant
                </label>
                <select className="w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option>Tous les étudiants</option>
                  <option>Jean Dupont</option>
                  <option>Marie Martin</option>
                  <option>Groupe L1-04</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filtrer par type
                </label>
                <select className="w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option>Tous les types</option>
                  <option>Réunion de suivi</option>
                  <option>Soutenance</option>
                  <option>Réunion d'équipe</option>
                </select>
              </div>
              <div className="flex items-end">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                  Appliquer
                </button>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white p-6 rounded-lg shadow" data-aos="fade-up">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale={frLocale}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              events={[
                { title: "Réunion de suivi - Jean Dupont", start: "2023-05-18T10:00:00", color: "#3b82f6" },
                { title: "Soutenance - Marie Martin", start: "2023-05-20T14:00:00", color: "#10b981" },
                { title: "Réunion d'équipe - Groupe L1-04", start: "2023-05-22T16:30:00", color: "#8b5cf6" },
              ]}
              eventClick={handleEventClick}
            />
          </div>
        </main>
      </div>

      {/* Add Event Modal */}
      <div
        id="eventModal"
        className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center hidden"
      >
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">Nouvelle réunion</h3>
          </div>
          <div className="px-6 py-4">
            <form>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                <input
                  type="text"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Étudiant/Projet</label>
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Sélectionner...</option>
                  <option value="1">Jean Dupont - Système de gestion académique</option>
                  <option value="2">Marie Martin - Plateforme e-learning</option>
                  <option value="3">Groupe L1-04 - Application mobile</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heure</label>
                  <input
                    type="time"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de réunion</label>
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Sélectionner...</option>
                  <option>Réunion de suivi</option>
                  <option>Soutenance</option>
                  <option>Réunion d'équipe</option>
                  <option>Autre</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                ></textarea>
              </div>
            </form>
          </div>
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
            <button
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              onClick={closeModal}
            >
              Annuler
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={saveEvent}
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendrier;