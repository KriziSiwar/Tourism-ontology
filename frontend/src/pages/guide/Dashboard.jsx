import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const GuideDashboard = () => {
  const { currentUser } = useAuth();

  // Données factices pour les activités à venir
  const upcomingActivities = [
    {
      id: 1,
      title: 'Visite guidée de la médina',
      date: '2023-06-20',
      time: '09:00',
      participants: 4,
      status: 'confirmé',
      location: 'Médina de Tunis',
      price: '50 TND'
    },
    {
      id: 2,
      title: 'Randonnée dans le désert',
      date: '2023-06-25',
      time: '06:00',
      participants: 6,
      status: 'en attente',
      location: 'Désert du Sahara',
      price: '120 TND'
    }
  ];

  // Statistiques factices
  const stats = [
    { name: 'Activités ce mois-ci', value: '8', change: '+12%', changeType: 'increase' },
    { name: 'Revenus ce mois', value: '1,200 TND', change: '+8%', changeType: 'increase' },
    { name: 'Note moyenne', value: '4.8/5', change: '+0.2', changeType: 'increase' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord du guide</h1>
        <p className="mt-1 text-sm text-gray-500">
          Bon retour, {currentUser?.username || 'Guide'} ! Voici un aperçu de vos activités.
        </p>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
              <dd className="mt-1 flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                <div
                  className={`ml-2 flex items-baseline text-sm font-semibold ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.changeType === 'increase' ? (
                    <svg
                      className="self-center flex-shrink-0 h-5 w-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="self-center flex-shrink-0 h-5 w-5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <span className="sr-only">
                    {stat.changeType === 'increase' ? 'Increased' : 'Decreased'} by
                  </span>
                  {stat.change}
                </div>
              </dd>
            </div>
          </div>
        ))}
      </div>

      {/* Activités à venir */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Activités à venir</h3>
            <Link
              to="/guide/activities/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Nouvelle activité
            </Link>
          </div>
        </div>
        <div className="bg-white shadow overflow-hidden sm:rounded-b-lg">
          <ul className="divide-y divide-gray-200">
            {upcomingActivities.map((activity) => (
              <li key={activity.id}>
                <Link to={`/guide/activities/${activity.id}`} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-blue-600 truncate">
                        {activity.title}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            activity.status === 'confirmé'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {activity.status}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <svg
                            className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {activity.location}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <svg
                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <p>
                          <time dateTime={`${activity.date}T${activity.time}`}>
                            {new Date(activity.date).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                            {' à '}
                            {activity.time}
                          </time>
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg
                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        {activity.participants} participants
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {activity.price}
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Aperçu des avis */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Derniers avis</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex items-center">
              {[0, 1, 2, 3, 4].map((rating) => (
                <svg
                  key={rating}
                  className={`h-5 w-5 ${
                    rating < 4 ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="ml-2 text-sm text-gray-500">4.0 sur 5.0</p>
          </div>
          <p className="mt-2 text-sm text-gray-500">Basé sur 12 avis</p>
          <div className="mt-4">
            <div className="flex items-center">
              <p className="text-sm font-medium text-gray-500 w-10">5 étoiles</p>
              <div className="flex-1 h-2 mx-4 overflow-hidden bg-gray-200 rounded-full">
                <div className="h-full bg-yellow-400 rounded-full" style={{ width: '70%' }}></div>
              </div>
              <span className="text-sm font-medium text-gray-500 w-8 text-right">7</span>
            </div>
            <div className="flex items-center mt-2">
              <p className="text-sm font-medium text-gray-500 w-10">4 étoiles</p>
              <div className="flex-1 h-2 mx-4 overflow-hidden bg-gray-200 rounded-full">
                <div className="h-full bg-yellow-400 rounded-full" style={{ width: '30%' }}></div>
              </div>
              <span className="text-sm font-medium text-gray-500 w-8 text-right">3</span>
            </div>
            <div className="flex items-center mt-2">
              <p className="text-sm font-medium text-gray-500 w-10">3 étoiles</p>
              <div className="flex-1 h-2 mx-4 overflow-hidden bg-gray-200 rounded-full">
                <div className="h-full bg-yellow-400 rounded-full" style={{ width: '10%' }}></div>
              </div>
              <span className="text-sm font-medium text-gray-500 w-8 text-right">1</span>
            </div>
            <div className="flex items-center mt-2">
              <p className="text-sm font-medium text-gray-500 w-10">2 étoiles</p>
              <div className="flex-1 h-2 mx-4 overflow-hidden bg-gray-200 rounded-full">
                <div className="h-full bg-yellow-400 rounded-full" style={{ width: '10%' }}></div>
              </div>
              <span className="text-sm font-medium text-gray-500 w-8 text-right">1</span>
            </div>
            <div className="flex items-center mt-2">
              <p className="text-sm font-medium text-gray-500 w-10">1 étoile</p>
              <div className="flex-1 h-2 mx-4 overflow-hidden bg-gray-200 rounded-full">
                <div className="h-full bg-yellow-400 rounded-full" style={{ width: '0%' }}></div>
              </div>
              <span className="text-sm font-medium text-gray-500 w-8 text-right">0</span>
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900">Dernier avis</h4>
            <div className="mt-2 flex items-center">
              <div className="flex items-center">
                {[0, 1, 2, 3, 4].map((rating) => (
                  <svg
                    key={rating}
                    className={`h-4 w-4 ${
                      rating < 5 ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="ml-2 text-sm font-medium text-gray-900">Par Jean D. - 15 juin 2023</p>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              "Excellente visite guidée ! Notre guide était très compétent et passionnant. Je recommande vivement."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideDashboard;
