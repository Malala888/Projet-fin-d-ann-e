import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from "react-router-dom"; // ✅ RAJOUTÉ LES IMPORTS

const StatisticsDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Ce mois-ci');
  const progressChartRef = useRef(null);
  const deliverablesChartRef = useRef(null);
  const studentsChartRef = useRef(null);
  const meetingsChartRef = useRef(null);
  const chartsRef = useRef({});
  const location = useLocation(); // ✅ UTILISE useLocation comme dans Index.js

  // ✅ EXACTEMENT la même fonction isActive que dans Index.js
  const isActive = (path) => {
    return location.pathname === path
      ? "bg-blue-50 text-blue-700"
      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900";
  };

  useEffect(() => {
    const initializeCharts = () => {
      if (typeof window !== 'undefined' && window.Chart) {
        const Chart = window.Chart;
        
        Object.values(chartsRef.current).forEach(chart => chart && chart.destroy());
        chartsRef.current = {};

        if (progressChartRef.current) {
          chartsRef.current.progress = new Chart(progressChartRef.current, {
            type: 'bar',
            data: {
              labels: ['Système de gestion', 'Plateforme e-learning', 'Application mobile', 'Application IoT', 'IA pour éducation'],
              datasets: [{
                label: 'Pourcentage complété',
                data: [65, 40, 25, 75, 50],
                backgroundColor: [
                  'rgba(59, 130, 246, 0.7)',
                  'rgba(16, 185, 129, 0.7)',
                  'rgba(245, 158, 11, 0.7)',
                  'rgba(139, 92, 246, 0.7)',
                  'rgba(236, 72, 153, 0.7)'
                ],
                borderColor: [
                  'rgb(59, 130, 246)',
                  'rgb(16, 185, 129)',
                  'rgb(245, 158, 11)',
                  'rgb(139, 92, 246)',
                  'rgb(236, 72, 153)'
                ],
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, max: 100, ticks: { callback: value => value + '%' } } }
            }
          });
        }

        if (deliverablesChartRef.current) {
          chartsRef.current.deliverables = new Chart(deliverablesChartRef.current, {
            type: 'doughnut',
            data: {
              labels: ['Validés', 'En attente', 'En retard', 'À venir'],
              datasets: [{
                data: [12, 8, 4, 10],
                backgroundColor: [
                  'rgba(16, 185, 129, 0.7)',
                  'rgba(245, 158, 11, 0.7)',
                  'rgba(239, 68, 68, 0.7)',
                  'rgba(59, 130, 246, 0.7)'
                ],
                borderColor: [
                  'rgb(16, 185, 129)',
                  'rgb(245, 158, 11)',
                  'rgb(239, 68, 68)',
                  'rgb(59, 130, 246)'
                ],
                borderWidth: 1
              }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
          });
        }

        if (studentsChartRef.current) {
          chartsRef.current.students = new Chart(studentsChartRef.current, {
            type: 'pie',
            data: {
              labels: ['L1', 'L2', 'L3', 'M1', 'M2'],
              datasets: [{
                data: [6, 4, 3, 8, 2],
                backgroundColor: [
                  'rgba(16, 185, 129, 0.7)',
                  'rgba(59, 130, 246, 0.7)',
                  'rgba(139, 92, 246, 0.7)',
                  'rgba(245, 158, 11, 0.7)',
                  'rgba(236, 72, 153, 0.7)'
                ],
                borderColor: [
                  'rgb(16, 185, 129)',
                  'rgb(59, 130, 246)',
                  'rgb(139, 92, 246)',
                  'rgb(245, 158, 11)',
                  'rgb(236, 72, 153)'
                ],
                borderWidth: 1
              }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
          });
        }

        if (meetingsChartRef.current) {
          chartsRef.current.meetings = new Chart(meetingsChartRef.current, {
            type: 'line',
            data: {
              labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
              datasets: [{
                label: 'Réunions par mois',
                data: [8, 10, 12, 15, 14, 18, 5, 3, 10, 12, 15, 17],
                fill: false,
                borderColor: 'rgb(59, 130, 246)',
                tension: 0.1,
                pointBackgroundColor: 'rgb(59, 130, 246)',
                pointRadius: 4
              }]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, title: { display: true, text: 'Nombre de réunions' } } } }
          });
        }
      }
    };

    const loadChart = () => {
      if (!window.Chart && !document.getElementById('chart-script')) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js';
        script.id = 'chart-script';
        script.onload = initializeCharts;
        document.head.appendChild(script);
      } else if (window.Chart) {
        initializeCharts();
      }
    };

    loadChart();
    
    return () => {
      Object.values(chartsRef.current).forEach(chart => {
        if (chart) chart.destroy();
      });
    };
  }, []);

  const stats = [
    {
      title: 'Étudiants encadrés',
      value: '14',
      change: '+17%',
      trend: 'up',
      icon: 'users',
      color: 'blue'
    },
    {
      title: 'Projets actifs',
      value: '8',
      change: '+14%',
      trend: 'up',
      icon: 'briefcase',
      color: 'green'
    },
    {
      title: 'Taux de réussite',
      value: '89%',
      change: '+5%',
      trend: 'up',
      icon: 'check-circle',
      color: 'purple'
    },
    {
      title: 'Charge moyenne',
      value: '12h/sem',
      change: '-8%',
      trend: 'down',
      icon: 'clock',
      color: 'yellow'
    }
  ];

  const topStudents = [
    { 
      id: 1, 
      name: 'Jean Dupont', 
      project: 'Système de gestion académique', 
      level: 'M1', 
      progress: 65, 
      score: 92,
      initials: 'JD'
    },
    { 
      id: 2, 
      name: 'Marie Martin', 
      project: 'Plateforme e-learning', 
      level: 'L1', 
      progress: 40, 
      score: 88,
      initials: 'MM'
    },
    { 
      id: 3, 
      name: 'Thomas Bernard', 
      project: 'Application IoT', 
      level: 'M1', 
      progress: 75, 
      score: 85,
      initials: 'TB'
    }
  ];

  const StatCard = ({ stat }) => {
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      yellow: 'bg-yellow-100 text-yellow-600'
    };

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-full ${colorClasses[stat.color]}`}>
            <i data-feather={stat.icon}></i>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">{stat.title}</p>
            <p className="text-2xl font-semibold text-gray-800">{stat.value}</p>
            <p className={`text-xs mt-1 flex items-center ${
              stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              <i data-feather={stat.trend === 'up' ? 'trending-up' : 'trending-down'} className="h-3 w-3 mr-1"></i>
              {stat.change} vs période précédente
            </p>
          </div>
        </div>
      </div>
    );
  };

  // ✅ INIT feather icons quand le composant se monte
  useEffect(() => {
    if (window.feather) window.feather.replace();
  }, []);

  return (
    <div className="bg-gray-50 font-sans min-h-screen">
      {/* Navbar - IDENTIQUE à Index.js */}
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
              <button className="p-1 rounded-full text-blue-200 hover:text-white relative" type="button">
                <i data-feather="bell"></i>
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
              </button>
              <div className="flex items-center">
                <img
                  className="h-8 w-8 rounded-full"
                  src="http://static.photos/people/200x200/1"
                  alt="Profile"
                />
                <span className="ml-2 text-sm font-medium">John Doe</span>
                <i data-feather="chevron-down" className="ml-1 h-4 w-4"></i>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* ✅ SIDEBAR IDENTIQUE À Index.js avec les VRAIS LIENS */}
        <aside className="bg-white w-64 min-h-screen border-r hidden md:block">
          <div className="p-4 border-b flex items-center">
            <img
              className="h-10 w-10 rounded-full"
              src="http://static.photos/people/200x200/1"
              alt=""
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">John Doe</p>
              <p className="text-xs text-gray-500">Enseignant</p>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            <Link
              to="/index"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/index")}`}
            >
              <i data-feather="home" className="mr-3 h-5 w-5"></i> Dashboard
            </Link>
            <Link
              to="/etudiant"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/etudiant")}`}
            >
              <i data-feather="users" className="mr-3 h-5 w-5"></i> Étudiants
            </Link>
            <Link
              to="/projet"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/projet")}`}
            >
              <i data-feather="briefcase" className="mr-3 h-5 w-5"></i> Projets
            </Link>
            <Link
              to="/calendrier"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/calendrier")}`}
            >
              <i data-feather="calendar" className="mr-3 h-5 w-5"></i> Calendrier
            </Link>
            <Link
              to="/livrable"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/livrable")}`}
            >
              <i data-feather="file-text" className="mr-3 h-5 w-5"></i> Livrables
            </Link>
            <Link
              to="/statistique"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/statistique")}`}
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
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/parametre")}`}
                >
                  <i data-feather="settings" className="mr-3 h-5 w-5"></i>
                  Paramètres
                </Link>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Statistiques et analyses</h1>
            <div className="flex space-x-2">
              <select 
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option>Ce mois-ci</option>
                <option>Ce trimestre</option>
                <option>Cette année</option>
                <option>Tout</option>
              </select>
              <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center">
                <i data-feather="download" className="mr-2 h-4 w-4"></i>
                Exporter
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <StatCard key={index} stat={stat} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Avancement des projets</h2>
              <div className="h-80">
                <canvas ref={progressChartRef}></canvas>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Statut des livrables</h2>
              <div className="h-80">
                <canvas ref={deliverablesChartRef}></canvas>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Répartition par niveau</h2>
              <div className="h-80">
                <canvas ref={studentsChartRef}></canvas>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Fréquence des réunions</h2>
              <div className="h-80">
                <canvas ref={meetingsChartRef}></canvas>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Indicateurs de performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 border rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Délai moyen de correction</h3>
                <p className="text-2xl font-semibold text-gray-800">2.3 jours</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Objectif: moins de 3 jours</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Taux de satisfaction</h3>
                <p className="text-2xl font-semibold text-gray-800">4.7/5</p>
                <div className="flex mt-2">
                  <i data-feather="star" className="h-4 w-4 text-yellow-400"></i>
                  <i data-feather="star" className="h-4 w-4 text-yellow-400"></i>
                  <i data-feather="star" className="h-4 w-4 text-yellow-400"></i>
                  <i data-feather="star" className="h-4 w-4 text-yellow-400"></i>
                  <i data-feather="star" className="h-4 w-4 text-yellow-400"></i>
                </div>
                <p className="text-xs text-gray-500 mt-1">Basé sur 23 évaluations</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Engagement des étudiants</h3>
                <p className="text-2xl font-semibold text-gray-800">78%</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Moyenne de connexion par semaine</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Meilleurs étudiants</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Étudiant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projet</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Niveau</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avancement</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-medium">
                              {student.initials}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.project}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          student.level.startsWith('M') 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {student.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${
                              student.level.startsWith('M') ? 'bg-blue-600' : 'bg-green-600'
                            }`}
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{student.progress}% complété</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {student.score}/100
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StatisticsDashboard;