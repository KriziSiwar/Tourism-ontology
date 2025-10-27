import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  UserGroupIcon, 
  ChartBarIcon, 
  CogIcon, 
  HomeIcon,
  DocumentTextIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Tableau de bord', href: '/admin/dashboard', icon: HomeIcon, current: true },
  { name: 'Utilisateurs', href: '/admin/users', icon: UserGroupIcon, current: false },
  { name: 'Statistiques', href: '/admin/statistics', icon: ChartBarIcon, current: false },
  { name: 'Paramètres', href: '/admin/settings', icon: CogIcon, current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const AdminLayout = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barre de navigation supérieure */}
      <div className="bg-indigo-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link to="/" className="text-white font-bold text-xl">
                  EcoTourism Admin
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <div className="relative ml-3">
                  <div className="flex items-center space-x-4">
                    <span className="text-white text-sm font-medium">
                      {currentUser?.username || 'Administrateur'}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="text-white hover:text-indigo-100 text-sm font-medium"
                    >
                      Déconnexion
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteneur principal */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
          {/* Barre latérale */}
          <aside className="py-6 px-2 sm:px-6 lg:col-span-3 lg:py-0 lg:px-0">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={classNames(
                      isActive
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-700'
                        : 'border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900',
                      'group border-l-4 px-3 py-2 flex items-center text-sm font-medium rounded-md'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <item.icon
                      className={classNames(
                        isActive
                          ? 'text-indigo-500 group-hover:text-indigo-500'
                          : 'text-gray-400 group-hover:text-gray-500',
                        'flex-shrink-0 -ml-1 mr-3 h-6 w-6'
                      )}
                      aria-hidden="true"
                    />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Contenu principal */}
          <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
            {/* Bouton Retour pour les sous-pages */}
            {!location.pathname.endsWith('dashboard') && (
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900 mb-4"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Retour
              </button>
            )}
            
            {/* Contenu de la page */}
            <div className="flex-1 p-6">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  {children || <Outlet />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
