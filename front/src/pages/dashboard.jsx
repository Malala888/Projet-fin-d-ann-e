// src/pages/Dashboard.jsx
import React, { useEffect, useState, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";
import feather from "feather-icons";

/* global Chart */

const Dashboard = () => {
  const [etudiant, setEtudiant] = useState(null);
  const [projets, setProjets] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statistiques, setStatistiques] = useState(null);
  const [calendrier, setCalendrier] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const chartsRef = useRef({});

  useEffect(() => {
    feather.replace();
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

      const immatricule = userData.Immatricule;
      const requests = [
        axios.get(`http://localhost:5000/etudiants/${immatricule}/projets`),
        axios.get(`http://localhost:5000/etudiants/${immatricule}/statistiques`),
        axios.get(`http://localhost:5000/etudiants/${immatricule}/calendrier`),
      ];

      Promise.all(requests)
        .then(([projetsRes, statsRes, calendrierRes]) => {
          setProjets(projetsRes.data);
          setStatistiques(statsRes.data);
          setCalendrier(calendrierRes.data);
        })
        .catch((error) => console.error("Erreur lors de la récupération des données :", error))
        .finally(() => setLoading(false));
    } catch (error) {
      console.error("Erreur de parsing des données utilisateur :", error);
      localStorage.clear();
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    feather.replace();
  });

  // useEffect pour la gestion des graphiques
  useEffect(() => {
    if (loading || !etudiant) return;

    const initCharts = () => {
      const gradesCanvas = document.getElementById("gradesChart");
      if (gradesCanvas) {
        if (chartsRef.current.gradesChart) {
          chartsRef.current.gradesChart.destroy();
        }

        const gradesCtx = gradesCanvas.getContext("2d");

        // --- CORRECTION : AFFICHE TOUS LES PROJETS, NOTÉS OU NON ---
        chartsRef.current.gradesChart = new Chart(gradesCtx, {
          type: "bar",
          data: {
            // Utilise tous les projets pour les étiquettes
            labels: projets.map((p) => p.Theme || "Projet"),
            datasets: [{
              label: "Notes /20",
              // Affiche la note ou 0 si elle est nulle
              data: projets.map((p) => parseFloat(p.note) || 0),
              backgroundColor: "rgba(59, 130, 246, 0.6)",
              borderColor: "rgba(59, 130, 246, 1)",
              borderWidth: 1,
              borderRadius: 4,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, max: 20 } },
            plugins: {
              legend: { display: false },
              title: { display: true, text: 'Répartition des notes', font: { size: 16, weight: '600' }, color: '#1f2937' }
            }
          },
        });
      }
    };

    const timer = setTimeout(initCharts, 100);

    return () => {
      clearTimeout(timer);
      if (chartsRef.current.gradesChart) {
        chartsRef.current.gradesChart.destroy();
      }
    };
  }, [etudiant, projets, loading]);


  const upcomingDeadlines = useMemo(() => {
    if (!calendrier) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return calendrier
      .filter(event => new Date(event.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [calendrier]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const profileImageUrl = etudiant?.Image && !etudiant.Image.startsWith("http")
    ? `http://localhost:5000${etudiant.Image}?t=${new Date().getTime()}`
    : etudiant?.Image || "http://static.photos/people/200x200/2";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl text-gray-700">🔄 Chargement du tableau de bord...</p>
      </div>
    );
  }

  // --- CORRECTION : Logique pour "Projets en cours" ---
  const projetsEnCours = projets.filter(p => new Date(p.Date_fin) > new Date()).length;

  return (
    <div className="bg-gray-50 font-sans min-h-screen flex flex-col">
      {/* Navbar (identique aux autres pages) */}
      <nav className="bg-blue-700 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                  <div className="flex items-center">
                      <button type="button" className="md:hidden mr-3 p-2 rounded text-white hover:bg-blue-600" onClick={() => setSidebarOpen(s => !s)} aria-label="Toggle menu">
                          <i data-feather="menu" className="h-6 w-6" />
                      </button>
                      <i data-feather="book-open" className="h-8 w-8"></i>
                      <div className="hidden md:block ml-3 sm:ml-10">
                          <p className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-300 to-white bg-clip-text text-transparent">Espace Étudiant</p>
                      </div>
                  </div>
                  <div className="hidden md:flex items-center space-x-4">
                      <div className="group relative">
                          <div className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-blue-600 transition">
                              <img className="h-8 w-8 rounded-full" src={profileImageUrl} alt="Profile" />
                              <span className="ml-2 text-sm font-medium">{etudiant.Nom}</span>
                          </div>
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
                              <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
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
        {/* Sidebar (identique aux autres pages) */}
        <aside className={`sidebar bg-white w-64 min-h-screen border-r ${sidebarOpen ? "" : "hidden"} md:block absolute md:relative z-20 shadow-xl md:shadow-none transition-transform duration-300 ease-in-out`}>
            <div className="p-4 border-b flex items-center">
                <img className="h-10 w-10 rounded-full" src={profileImageUrl} alt="Avatar de l'étudiant" />
                <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">{etudiant.Nom}</p>
                    <p className="text-xs text-gray-500">Étudiant {etudiant.Niveau}</p>
                </div>
            </div>
            <nav className="p-4 space-y-1">
                <Link to="/dashboard" className="flex items-center px-2 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700">
                    <i data-feather="home" className="mr-3 h-5 w-5"></i> Tableau de bord
                </Link>
                <Link to="/mes_projet" className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600">
                    <i data-feather="briefcase" className="mr-3 h-5 w-5"></i> Mes projets
                </Link>
                <Link to="/mes_livrables" className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600">
                    <i data-feather="file-text" className="mr-3 h-5 w-5"></i> Mes livrables
                </Link>
                <Link to="/calendrierEtudiant" className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600">
                    <i data-feather="calendar" className="mr-3 h-5 w-5"></i> Calendrier
                </Link>
                <Link to="/parametre_etudiant" className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600">
                    <i data-feather="settings" className="mr-3 h-5 w-5"></i> Paramètres
                </Link>
                <button onClick={handleLogout} className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600 w-full text-left">
                    <i data-feather="log-out" className="mr-3 h-5 w-5"></i> Déconnexion
                </button>
            </nav>
        </aside>

        {/* --- Contenu Principal (Style restauré) --- */}
        <main className="flex-1 p-8 overflow-y-auto">
          <h1 data-aos="fade-down" className="text-3xl font-bold text-gray-800 mb-6">Tableau de bord</h1>

          {/* Cartes de statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div data-aos="fade-up" className="bg-white p-6 rounded-lg shadow-xl border border-gray-200 flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600"><i data-feather="briefcase"></i></div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Projets en cours</p>
                <p className="text-2xl font-semibold text-gray-800">{projetsEnCours}</p>
              </div>
            </div>
            <div data-aos="fade-up" data-aos-delay="100" className="bg-white p-6 rounded-lg shadow-xl border border-gray-200 flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600"><i data-feather="file-text"></i></div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Livrables soumis</p>
                <p className="text-2xl font-semibold text-gray-800">{statistiques ? statistiques.livrables_soumis || 0 : 0}</p>
              </div>
            </div>
            <div data-aos="fade-up" data-aos-delay="200" className="bg-white p-6 rounded-lg shadow-xl border border-gray-200 flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600"><i data-feather="clock"></i></div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Prochaine échéance</p>
                <p className="text-xl font-semibold text-gray-800">
                  {upcomingDeadlines.length > 0 ? new Date(upcomingDeadlines[0].date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" }) : "N/A"}
                </p>
              </div>
            </div>
            <div data-aos="fade-up" data-aos-delay="300" className="bg-white p-6 rounded-lg shadow-xl border border-gray-200 flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600"><i data-feather="award"></i></div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Moyenne générale</p>
                <p className="text-2xl font-semibold text-gray-800">
                  {(() => {
                    const projetsNotes = projets.filter(p => p.note && parseFloat(p.note) > 0);
                    if (projetsNotes.length === 0) return "N/A";
                    const sum = projetsNotes.reduce((acc, p) => acc + parseFloat(p.note), 0);
                    return `${(sum / projetsNotes.length).toFixed(1)}/20`;
                  })()}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div data-aos="fade-right" className="bg-white p-6 rounded-lg shadow-xl border border-gray-200">
                 <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Mes projets</h2>
                  <Link to="/mes_projet" className="text-sm font-medium text-blue-600 hover:text-blue-500">Voir tous &rarr;</Link>
                </div>
                <div className="overflow-x-auto">
                   <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projet</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avancement</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Échéance</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {projets.length > 0 ? (
                        projets.slice(0, 4).map((p) => (
                          <tr key={p.Id_projet} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap"><Link to={`/projet/${p.Id_projet}`} className="text-sm font-medium text-blue-600 hover:underline">{p.Theme}</Link></td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${p.Avancement}%` }}></div></div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(p.Date_fin).toLocaleDateString("fr-FR")}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="3" className="px-6 py-4 text-center text-gray-500 text-sm">Aucun projet trouvé.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div data-aos="fade-right" data-aos-delay="100" className="bg-white p-6 rounded-lg shadow-xl border border-gray-200">
                <div className="h-80"><canvas id="gradesChart"></canvas></div>
              </div>
            </div>

            <div data-aos="fade-left" className="w-full lg:col-span-1 bg-white p-6 rounded-lg shadow-xl border border-gray-200 h-fit">
              <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2 flex items-center">
                <i data-feather="clock" className="h-5 w-5 mr-2 text-blue-700"></i> Prochaines Échéances
              </h2>
              <div className="space-y-4">
                {upcomingDeadlines.length > 0 ? (
                  upcomingDeadlines.slice(0, 5).map((event, index) => {
                    const isProject = event.type === "Projet";
                    const color = isProject ? "red" : "amber";
                    const iconName = isProject ? "briefcase" : "file-text";
                    return (
                      <div key={index} className={`flex items-start p-3 bg-${color}-50 rounded-lg border border-${color}-200`} data-aos="fade-up" data-aos-delay={index * 100}>
                        <i data-feather={iconName} className={`h-5 w-5 text-${color}-600 mt-0.5 flex-shrink-0`}/>
                        <div className="ml-3 flex-1">
                          <p className={`text-sm font-medium text-${color}-900 line-clamp-2`}>{event.title}</p>
                          <p className={`text-xs text-${color}-600 font-semibold mt-0.5`}>
                            <i data-feather="calendar" className="h-3 w-3 inline-block mr-1"></i>
                            {new Date(event.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long"})}
                          </p>
                        </div>
                        <span className={`ml-2 px-2 py-1 text-xs font-medium bg-${color}-200 text-${color}-800 rounded-full flex-shrink-0`}>{event.type}</span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500 p-2">Aucune échéance à venir enregistrée.</p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
