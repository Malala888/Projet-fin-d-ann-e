import React from 'react';

const StudentDetailPage = () => {
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
      'users': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      'briefcase': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0v10a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0V4a2 2 0 00-2-2H10a2 2 0 00-2 2v2" />
        </svg>
      ),
      'calendar': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      'file-text': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
      'mail': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      'message-square': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      )
    };

    return icons[name] || <div className={className}></div>;
  };

  const Avatar = ({ className = "h-8 w-8", src, alt = "Profile" }) => (
    <img className={`${className} rounded-full`} src={src} alt={alt} />
  );

  const menuItems = [
    { icon: 'home', name: 'Dashboard', active: false },
    { icon: 'users', name: 'Étudiants', active: true },
    { icon: 'briefcase', name: 'Projets', active: false },
    { icon: 'calendar', name: 'Calendrier', active: false },
    { icon: 'file-text', name: 'Livrables', active: false },
    { icon: 'bar-chart-2', name: 'Statistiques', active: false }
  ];

  const studentInfo = {
    name: 'Jean Dupont',
    level: 'M1 Développement Web',
    email: 'jean.dupont@eni.fr',
    avatar: 'http://static.photos/people/200x200/2',
    project: 'Système de gestion académique',
    progress: '65%',
    nextMeeting: '18/05/2023 - 10:00'
  };

  const recentActivities = [
    {
      icon: 'file-text',
      text: 'Rapport intermédiaire soumis'
    },
    {
      icon: 'message-square',
      text: 'Nouveau commentaire du professeur'
    }
  ];

  const recentDeliverables = [
    {
      name: 'Cahier des charges.docx',
      status: 'En attente',
      statusColor: 'text-yellow-600'
    },
    {
      name: 'Rapport intermédiaire.pdf',
      status: 'Validé',
      statusColor: 'text-green-600'
    }
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
                  Gestion de Projet
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <button className="p-1 rounded-full text-blue-200 hover:text-white relative">
                <Icon name="bell" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
              </button>
              <div className="flex items-center">
                <Avatar src="http://static.photos/people/200x200/1" />
                <span className="ml-2 text-sm font-medium">John Doe</span>
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
            <Avatar src="http://static.photos/people/200x200/1" className="h-10 w-10" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">John Doe</p>
              <p className="text-xs text-gray-500">Enseignant</p>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            {menuItems.map((item, index) => (
              <button
                key={index}
                type="button"
                className={`flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left ${
                  item.active 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Icon name={item.icon} className="mr-3 h-5 w-5" />
                {item.name}
              </button>
            ))}
            <div className="mt-8">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Administration
              </h3>
              <div className="mt-1 space-y-1">
                <button
                  type="button"
                  className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full text-left"
                >
                  <Icon name="settings" className="mr-3 h-5 w-5" />
                  Paramètres
                </button>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Avatar src={studentInfo.avatar} className="h-16 w-16" />
              <div className="ml-4">
                <h1 className="text-3xl font-bold text-gray-800">{studentInfo.name}</h1>
                <p className="text-sm text-gray-500">{studentInfo.level}</p>
                <p className="text-sm text-gray-500">{studentInfo.email}</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center">
              <Icon name="mail" className="mr-2 h-4 w-4" />
              Contacter
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-sm text-gray-500">Projet</h3>
              <p className="text-lg font-semibold">{studentInfo.project}</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-sm text-gray-500">Avancement</h3>
              <p className="text-lg font-semibold">{studentInfo.progress}</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-sm text-gray-500">Prochaine réunion</h3>
              <p className="text-lg font-semibold">{studentInfo.nextMeeting}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">Résumé du projet</h2>
                <p className="text-gray-700">
                  Développement d'un système complet de gestion académique pour l'ENI permettant de suivre les projets des étudiants, les livrables et les échéances.
                </p>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">Activité récente</h2>
                <ul className="space-y-2">
                  {recentActivities.map((activity, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-700">
                      <Icon name={activity.icon} className="h-4 w-4 mr-2 text-gray-400" />
                      {activity.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">Livrables récents</h2>
                <ul className="text-sm space-y-1">
                  {recentDeliverables.map((deliverable, index) => (
                    <li key={index} className="flex justify-between">
                      <span>{deliverable.name}</span>
                      <span className={deliverable.statusColor}>{deliverable.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDetailPage;