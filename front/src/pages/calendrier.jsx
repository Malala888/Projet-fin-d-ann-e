// src/pages/Calendrier.jsx
import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import feather from "feather-icons";
import AOS from "aos";
import "aos/dist/aos.css";

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
    .fc-event-main {
        padding: 2px 4px;
        line-height: 1.2;
    }
    .fc-event .feather {
        stroke: white;
    }
`;

const Calendrier = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    const storedUser = localStorage.getItem("user");
    const storedRole = localStorage.getItem("role");
    if (!storedUser || storedRole !== "encadreur") {
      navigate("/login");
      return;
    }
    try {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      fetchEvents(userData.Matricule);
      setTimeout(() => feather.replace(), 0);
    } catch (error) {
      console.error("Erreur de parsing des données utilisateur :", error);
      localStorage.clear();
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    feather.replace();
  });

  const fetchEvents = async (encadreurId) => {
    try {
      const response = await axios.get(`http://localhost:5000/encadreurs/${encadreurId}/calendrier`);
      const formattedEvents = response.data.map((event) => {
        const isProject = event.type === "Projet";
        return {
          title: event.title,
          start: event.date,
          // Rouge pour Projet, Ambre pour Livrable (cohérent avec la vue étudiant)
          color: isProject ? "#ef4444" : "#f59e0b",
          extendedProps: {
            type: event.type,
          },
        };
      });
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Erreur lors de la récupération des événements :", error);
    } finally {
      setLoading(false);
    }
  };

  const isActive = (path) => location.pathname === path ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900";

  // --- MODAL (Logique conservée mais non implémentée) ---
  const openModal = () => document.getElementById("eventModal").classList.remove("hidden");
  const closeModal = () => document.getElementById("eventModal").classList.add("hidden");
  const saveEvent = () => {
    alert("Fonctionnalité à implémenter.");
    closeModal();
  };

  // Filtrer et trier les échéances à venir (projets et livrables)
  const upcomingDeadlines = events
    .filter((event) => new Date(event.start) >= new Date())
    .sort((a, b) => new Date(a.start) - new Date(b.start));

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl text-gray-700">🔄 Chargement du calendrier...</p>
      </div>
    );
  }

  const profileImageUrl = user.Avatar && !user.Avatar.startsWith("http")
    ? `http://localhost:5000${user.Avatar}?t=${new Date().getTime()}`
    : user.Avatar || "http://static.photos/people/200x200/1";

  return (
    <div className="bg-gray-50 font-sans min-h-screen flex flex-col">
      <style>{calendarStyles}</style>

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
                  Gestion de Projet
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
                    {user.Nom}
                  </span>
                  <i data-feather="chevron-down" className="ml-1 h-4 w-4"></i>
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
              alt="Avatar de l'encadreur"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">
                {user.Nom}
              </p>
              <p className="text-xs text-gray-500">
                {user.Titre || "Encadreur"}
              </p>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            <Link to="/index" className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/index")}`}>
              <i data-feather="home" className="mr-3 h-5 w-5"></i> Dashboard
            </Link>
            <Link to="/etudiant" className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/etudiant")}`}>
              <i data-feather="users" className="mr-3 h-5 w-5"></i> Étudiants
            </Link>
            <Link to="/projet" className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/projet")}`}>
              <i data-feather="briefcase" className="mr-3 h-5 w-5"></i> Projets
            </Link>
            <Link to="/calendrier" className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/calendrier")}`}>
              <i data-feather="calendar" className="mr-3 h-5 w-5"></i> Calendrier
            </Link>
            <Link to="/livrable" className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/livrable")}`}>
              <i data-feather="file-text" className="mr-3 h-5 w-5"></i> Livrables
            </Link>
            <Link to="/statistique" className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/statistique")}`}>
              <i data-feather="bar-chart-2" className="mr-3 h-5 w-5"></i> Statistiques
            </Link>
            <div className="mt-8">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Administration
              </h3>
              <div className="mt-1 space-y-1">
                <Link to="/parametre" className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/parametre")}`}>
                  <i data-feather="settings" className="mr-3 h-5 w-5"></i> Paramètres
                </Link>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 data-aos="fade-down" className="text-3xl font-bold text-gray-800">Calendrier des Échéances</h1>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              onClick={openModal}
            >
              <i data-feather="plus" className="mr-2 h-4 w-4"></i> Nouvelle réunion
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Section Calendrier */}
            <div
              data-aos="fade-right"
              className="bg-white p-6 rounded-lg shadow-xl flex-1 min-h-[600px] border border-gray-200"
            >
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale={frLocale}
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                events={events}
                buttonText={{
                  today: "Aujourd'hui",
                  month: "Mois",
                  week: "Semaine",
                  day: "Jour",
                }}
                editable={false}
                eventContent={(arg) => {
                  const eventType = arg.event.extendedProps.type;
                  const isProject = eventType === "Projet";
                  const iconName = isProject ? "briefcase" : "file-text";
                  const prefix = isProject ? "PROJET: " : "LIVRABLE: ";

                  return (
                    <div className="flex items-center p-1">
                      <i data-feather={iconName} className="h-3 w-3 mr-1 text-white"></i>
                      <span className="text-xs font-medium truncate text-white">
                        {prefix} {arg.event.title}
                      </span>
                    </div>
                  );
                }}
              />
            </div>

            {/* Section Prochaines Échéances */}
            <div
              data-aos="fade-left"
              className="w-full lg:w-80 bg-white p-6 rounded-lg shadow-xl border border-gray-200 h-fit"
            >
              <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2 flex items-center">
                <i data-feather="clock" className="h-5 w-5 mr-2 text-blue-700"></i>
                Prochaines Échéances
              </h2>
              <div className="space-y-4">
                {upcomingDeadlines.length > 0 ? (
                  upcomingDeadlines.slice(0, 5).map((event, index) => {
                    const isProject = event.extendedProps.type === "Projet";
                    const color = isProject ? "red" : "amber";
                    const iconName = isProject ? "alert-triangle" : "paperclip";
                    const label = isProject ? "Projet" : "Livrable";

                    return (
                      <div
                        key={index}
                        className={`flex items-start p-3 bg-${color}-50 rounded-lg border border-${color}-200`}
                        data-aos="fade-up"
                        data-aos-delay={index * 100}
                      >
                        <i
                          data-feather={iconName}
                          className={`h-5 w-5 text-${color}-600 mt-0.5 flex-shrink-0`}
                        />
                        <div className="ml-3 flex-1">
                          <p className={`text-sm font-medium text-${color}-900 line-clamp-2`}>
                            {event.title}
                          </p>
                          <p className={`text-xs text-${color}-600 font-semibold mt-0.5`}>
                            <i data-feather="calendar" className="h-3 w-3 inline-block mr-1"></i>
                            {new Date(event.start).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <span className={`ml-2 px-2 py-1 text-xs font-medium bg-${color}-200 text-${color}-800 rounded-full flex-shrink-0`}>
                          {label}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500 p-2">
                    Aucune échéance à venir pour vos projets supervisés.
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal (conservé pour une utilisation future) */}
      <div id="eventModal" className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center hidden">
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