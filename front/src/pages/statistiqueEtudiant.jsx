import React, { useEffect, useRef } from 'react';
import { Link } from "react-router-dom"; // Assurez-vous d'avoir bien importé Link

const StudentStatisticsDashboard = () => {
  const projectsChartRef = useRef(null);
  const deliverablesChartRef = useRef(null);
  const gradesChartRef = useRef(null);
  const timeChartRef = useRef(null);
  const chartsRef = useRef({});

  useEffect(() => {
    const initializeCharts = () => {
      if (typeof window !== 'undefined' && window.Chart) {
        const Chart = window.Chart;
        
        // Destroy existing charts
        Object.values(chartsRef.current).forEach(chart => {
          if (chart) chart.destroy();
        });
        chartsRef.current = {};
        
        if (projectsChartRef.current) {
          const projectsChart = new Chart(projectsChartRef.current, {
            type: 'bar',
            data: {
              labels: ['Projet A', 'Projet B', 'Projet C'],
              datasets: [{
                label: 'Avancement (%)',
                data: [65, 40, 80],
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b']
              }]
            },
            options: { 
              responsive: true, 
              maintainAspectRatio: false, 
              scales: { 
                y: { 
                  beginAtZero: true, 
                  max: 100 
                } 
              } 
            }
          });
          chartsRef.current.projects = projectsChart;
        }

        if (deliverablesChartRef.current) {
          const deliverablesChart = new Chart(deliverablesChartRef.current, {
            type: 'doughnut',
            data: {
              labels: ['Validés', 'En attente', 'En retard'],
              datasets: [{
                data: [5, 2, 1],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
              }]
            },
            options: { 
              responsive: true, 
              maintainAspectRatio: false 
            }
          });
          chartsRef.current.deliverables = deliverablesChart;
        }

        if (gradesChartRef.current) {
          const gradesChart = new Chart(gradesChartRef.current, {
            type: 'line',
            data: {
              labels: ['Rapport 1', 'Maquettes', 'Code', 'Présentation', 'Rapport final'],
              datasets: [{
                label: 'Notes /20',
                data: [14, 18, 16, 15, 17],
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99,102,241,0.1)',
                fill: true,
                tension: 0.3
              }]
            },
            options: { 
              responsive: true, 
              maintainAspectRatio: false, 
              scales: { 
                y: { 
                  max: 20, 
                  beginAtZero: true 
                } 
              } 
            }
          });
          chartsRef.current.grades = gradesChart;
        }

        if (timeChartRef.current) {
          const timeChart = new Chart(timeChartRef.current, {
            type: 'pie',
            data: {
              labels: ['Recherche', 'Développement', 'Rapports', 'Réunions'],
              datasets: [{
                data: [25, 40, 20, 15],
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
              }]
            },
            options: { 
              responsive: true, 
              maintainAspectRatio: false 
            }
          });
          chartsRef.current.time = timeChart;
        }
      }
    };

    const loadChart = () => {
      if (!window.Chart && !document.getElementById('chart-script')) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
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

  const Icon = ({ name, className = "h-5 w-5" }) => {
    const icons = {
      'book-open': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      'bell': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3-3V7a3 3 0 00-3-3H9a3 3 0 00-3 3v7l-3 3h5a4 4 0 008 0z" />
        </svg>
      ),
      'chevron-down': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      ),
      'home': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      'briefcase': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0v10a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0V4a2 2 0 00-2-2H10a2 2 0 00-2 2v2" />
        </svg>
      ),
      'file-text': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      'calendar': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      'bar-chart-2': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      'settings': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      'award': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      'clock': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    };

    return icons[name] || <div className={className}></div>;
  };

  const Avatar = ({ className = "h-8 w-8", src, alt = "Profile" }) => (
    <img className={`${className} rounded-full`} src={src} alt={alt} />
  );

  const stats = [
    {
      title: 'Projets en cours',
      value: '2',
      icon: 'briefcase',
      color: 'blue'
    },
    {
      title: 'Livrables rendus',
      value: '7',
      icon: 'file-text',
      color: 'green'
    },
    {
      title: 'Moyenne générale',
      value: '15.2/20',
      icon: 'award',
      color: 'purple'
    },
    {
      title: 'Temps consacré',
      value: '10h/sem',
      icon: 'clock',
      color: 'yellow'
    }
  ];

  const performanceData = [
    {
      project: 'Système de gestion académique',
      deliverable: 'Rapport intermédiaire',
      status: 'Validé',
      grade: '16/20',
      statusColor: 'text-green-600'
    },
    {
      project: 'Plateforme e-learning',
      deliverable: 'Maquettes UI',
      status: 'Validé',
      grade: '18/20',
      statusColor: 'text-green-600'
    },
    {
      project: 'Application mobile',
      deliverable: 'Code source',
      status: 'En attente',
      grade: '--',
      statusColor: 'text-yellow-600'
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
            <Icon name={stat.icon} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">{stat.title}</p>
            <p className="text-2xl font-semibold text-gray-800">{stat.value}</p>
          </div>
        </div>
      </div>
    );
  };

  const menuItems = [
    { icon: 'home', name: 'Tableau de bord', active: false, path: '/dashboard' },
    { icon: 'briefcase', name: 'Mes projets', active: false, path: '/mes_projet' },
    { icon: 'file-text', name: 'Mes livrables', active: false, path: '/mes_livrables' },
    { icon: 'calendar', name: 'Calendrier', active: false, path: '/calendrierEtudiant' },
    { icon: 'bar-chart-2', name: 'Mes statistiques', active: true, path: '/statistique_etudiant' },
    { icon: 'settings', name: 'Paramètres', active: false, path: '/parametre_etudiant' }
  ];

  return (
    <div className="bg-gray-50 font-sans">
      {/* Navbar */}
      <nav className="bg-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Icon name="book-open" className="h-8 w-8" />
              <div className="hidden md:block ml-10 space-x-4">
                <p className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-300 to-white bg-clip-text text-transparent">
                  Espace Étudiant
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <button className="p-1 rounded-full text-blue-200 hover:text-white relative">
                <Icon name="bell" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
              </button>
              <div className="flex items-center">
                <Avatar src="http://static.photos/people/200x200/2" />
                <span className="ml-2 text-sm font-medium">Jean Dupont</span>
                <Icon name="chevron-down" className="ml-1 h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="bg-white w-64 min-h-screen border-r hidden md:block">
          <div className="p-4 border-b flex items-center">
            <Avatar src="http://static.photos/people/200x200/2" className="h-10 w-10" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Jean Dupont</p>
              <p className="text-xs text-gray-500">Étudiant M1</p>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left ${
                  item.active 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Icon name={item.icon} className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Mes statistiques</h1>

          {/* Stats overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <StatCard key={index} stat={stat} />
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Progression de mes projets</h2>
              <div className="h-80">
                <canvas ref={projectsChartRef}></canvas>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">État de mes livrables</h2>
              <div className="h-80">
                <canvas ref={deliverablesChartRef}></canvas>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Répartition de mes notes</h2>
              <div className="h-80">
                <canvas ref={gradesChartRef}></canvas>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Temps par activité</h2>
              <div className="h-80">
                <canvas ref={timeChartRef}></canvas>
              </div>
            </div>
          </div>

          {/* Performance table */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Détails de mes performances</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projet</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Livrable</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {performanceData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{row.project}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{row.deliverable}</td>
                      <td className={`px-6 py-4 text-sm ${row.statusColor}`}>{row.status}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{row.grade}</td>
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

export default StudentStatisticsDashboard;