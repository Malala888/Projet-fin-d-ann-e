import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import { Link, useNavigate } from "react-router-dom";
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
        /* Rendre l'événement plus compact pour bien voir le type */
        padding: 2px 4px;
        line-height: 1.2;
    }
    /* S'assurer que les icônes feather dans le calendrier sont visibles */
    .fc-event .feather {
        stroke: white; /* Couleur par défaut des icônes pour le contraste */
    }
`;

const CalendrierEtudiant = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [etudiant, setEtudiant] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fonction de déconnexion
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

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
      fetchEvents(userData.Immatricule);

      // Remplacement initial des icônes Feather
      setTimeout(() => {
        feather.replace();
      }, 0);
    } catch (error) {
      console.error("Erreur de parsing des données utilisateur :", error);
      localStorage.clear();
      navigate("/login");
    }
  }, [navigate]);

  // Assurer le remplacement des icônes lors des mises à jour du DOM (y compris les événements FullCalendar)
  useEffect(() => {
    feather.replace();
  });

  // Écouter les changements dans localStorage pour mettre à jour les données utilisateur
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "user" && e.newValue) {
        try {
          const updatedUser = JSON.parse(e.newValue);
          setEtudiant(updatedUser);
          console.log(
            "🔄 Données utilisateur mises à jour dans calendrier:",
            updatedUser
          );
        } catch (error) {
          console.error("❌ Erreur lors de la mise à jour des données:", error);
        }
      }
    };

    // Écouter les événements personnalisés de mise à jour utilisateur
    const handleUserUpdate = (e) => {
      const updatedUser = e.detail;
      setEtudiant(updatedUser);
      console.log(
        "🔄 Données utilisateur mises à jour via événement personnalisé:",
        updatedUser
      );
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userProfileUpdated", handleUserUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userProfileUpdated", handleUserUpdate);
    };
  }, []);

  const fetchEvents = async (etudiantId) => {
    try {
      // L'API /etudiants/:id/calendrier retourne : [{date, title, type}, ...]
      const response = await axios.get(
        `http://localhost:5000/etudiants/${etudiantId}/calendrier`
      );

      // Mapper les données de l'API au format FullCalendar
      const formattedEvents = response.data.map((event) => {
        const isProject = event.type === "Projet";
        return {
          // Le titre contient seulement le thème/nom
          title: event.title,
          start: event.date,
          // Rouge pour Projet, Ambre pour Livrable
          color: isProject ? "#ef4444" : "#f59e0b",
          extendedProps: {
            type: event.type,
          },
        };
      });
      setEvents(formattedEvents);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des événements du calendrier :",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // Filtrer et trier TOUTES les échéances (projet et livrable) à venir
  const upcomingDeadlines = events
    .filter((event) => new Date(event.start) >= new Date())
    .sort((a, b) => new Date(a.start) - new Date(b.start));

  if (loading || !etudiant) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl text-gray-700">🔄 Chargement du calendrier...</p>
      </div>
    );
  }

  // Construire l'URL de l'image avec cache busting
  const profileImageUrl =
    etudiant.Image && !etudiant.Image.startsWith("http")
      ? `http://localhost:5000${etudiant.Image}${
          etudiant.Image.includes("?") ? "&" : "?"
        }t=${new Date().getTime()}`
      : etudiant.Image || "http://static.photos/people/200x200/2";

  return (
    <div className="bg-gray-50 font-sans min-h-screen flex flex-col">
      {/* Injecter les styles du calendrier */}
      <style>{calendarStyles}</style>

      {/* Navbar (Identique à MesProjets.jsx) */}
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
      {/* --- */}
      <div className="flex flex-1">
        {/* Sidebar (Identique à MesProjets.jsx, lien Calendrier ACTIF) */}
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
            {/* LIEN ACTIF DU CALENDRIER */}
            <Link
              to="/calendrierEtudiant"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700" // <-- LIEN ACTIF
            >
              <i data-feather="calendar" className="mr-3 h-5 w-5"></i>{" "}
              Calendrier
            </Link>
            <Link
              to="/parametre_etudiant"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
            >
              <i data-feather="settings" className="mr-3 h-5 w-5"></i>{" "}
              Paramètres
            </Link>
            <Link
              to="/"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600"
            >
              <i data-feather="log-out" className="mr-3 h-5 w-5"></i>{" "}
              Déconnexion
            </Link>
          </nav>
        </aside>
        {/* --- */}
        {/* Main content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <h1
            data-aos="fade-down"
            className="text-3xl font-bold text-gray-800 mb-6"
          >
            Calendrier des Échéances
          </h1>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Section Calendrier */}
            <div
              data-aos="fade-right"
              className="bg-white p-6 rounded-lg shadow-xl flex-1 min-h-[600px] border border-gray-200"
            >
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale={frLocale}
                events={events}
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,dayGridWeek,dayGridDay",
                }}
                buttonText={{
                  today: "Aujourd'hui",
                  month: "Mois",
                  week: "Semaine",
                  day: "Jour",
                }}
                editable={false}
                selectable={true}
                eventDisplay="block"
                // Personnalisation pour afficher l'icône/type directement dans l'événement
                eventContent={(arg) => {
                  const eventType = arg.event.extendedProps.type;
                  const isProject = eventType === "Projet";
                  // Utilisation des icônes pour le type
                  const iconName = isProject ? "briefcase" : "file-text";
                  const prefix = isProject ? "PROJET: " : "LIVRABLE: ";

                  return (
                    <div className="flex items-center p-1">
                      <i
                        data-feather={iconName}
                        className="h-3 w-3 mr-1 text-white"
                      ></i>
                      <span className="text-xs font-medium truncate text-white">
                        {prefix} {arg.event.title}
                      </span>
                    </div>
                  );
                }}
              />
            </div>

            {/* Section Prochaines Échéances (incluant Projets et Livrables) */}
            <div
              data-aos="fade-left"
              className="w-full lg:w-80 bg-white p-6 rounded-lg shadow-xl border border-gray-200 h-fit"
            >
              <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2 flex items-center">
                <i
                  data-feather="clock"
                  className="h-5 w-5 mr-2 text-blue-700"
                ></i>{" "}
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
                          <p
                            className={`text-sm font-medium text-${color}-900 line-clamp-2`}
                          >
                            {event.title}
                          </p>
                          <p
                            className={`text-xs text-${color}-600 font-semibold mt-0.5`}
                          >
                            <i
                              data-feather="calendar"
                              className="h-3 w-3 inline-block mr-1"
                            ></i>
                            {new Date(event.start).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <span
                          className={`ml-2 px-2 py-1 text-xs font-medium bg-${color}-200 text-${color}-800 rounded-full flex-shrink-0`}
                        >
                          {label}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500 p-2">
                    Aucune échéance à venir enregistrée.
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CalendrierEtudiant;
