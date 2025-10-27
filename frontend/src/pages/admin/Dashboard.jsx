import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  UsersIcon, 
  ChartBarIcon, 
  CogIcon, 
  UserGroupIcon,
  DocumentTextIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import AdminService from '../../services/admin.service';

const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${colors[color]}`}>
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};\n
const QuickAction = ({ title, description, icon: Icon, to, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    green: 'bg-green-50 text-green-700 hover:bg-green-100',
    purple: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
    red: 'bg-red-50 text-red-700 hover:bg-red-100',
  };

  return (
    <Link
      to={to}
      className={`${colors[color]} rounded-lg p-4 transition-colors duration-200`}
    >
      <div className="flex items-center">
        <Icon className="h-6 w-6" aria-hidden="true" />
        <div className="ml-3">
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
    </Link>
  );
};

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    verifiedUsers: 0,
    recentUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Remplacez cette partie par un appel API réel lorsque le backend sera prêt
        // const response = await AdminService.getDashboardStats();
        // setStats(response.data);
        
        // Données factices pour le moment
        setTimeout(() => {
          setStats({
            totalUsers: 42,
            activeUsers: 28,
            verifiedUsers: 35,
            recentUsers: 5
          });
          setLoading(false);
        }, 500);
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques:', err);
        setError('Impossible de charger les statistiques. Veuillez réessayer plus tard.');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Administrateur</h1>
        <p className="mt-2 text-sm text-gray-600">
          Bienvenue, {currentUser?.username || 'Administrateur'} ! Voici un aperçu de votre tableau de bord.
        </p>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Utilisateurs totaux" 
          value={stats.totalUsers} 
          icon={UserGroupIcon} 
          color="purple" 
        />
        <StatCard 
          title="Utilisateurs actifs" 
          value={stats.activeUsers} 
          icon={UsersIcon} 
          color="blue" 
        />
        <StatCard 
          title="Emails vérifiés" 
          value={stats.verifiedUsers} 
          icon={ChartBarIcon} 
          color="green" 
        />
        <StatCard 
          title="Nouveaux (7j)" 
          value={stats.recentUsers} 
          icon={ClockIcon} 
          color="yellow" 
        />
      </div>

      {/* Actions rapides */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <QuickAction
            title="Gérer les utilisateurs"
            description="Consultez et gérez tous les utilisateurs"
            icon={UsersIcon}
            to="/admin/users"
            color="blue"
          />
          <QuickAction
            title="Voir les statistiques"
            description="Analysez les données du site"
            icon={ChartBarIcon}
            to="/admin/statistics"
            color="green"
          />
          <QuickAction
            title="Paramètres du site"
            description="Configurez les paramètres généraux"
            icon={CogIcon}
            to="/admin/settings"
            color="purple"
          />
        </div>
      </div>

      {/* Dernières activités */}
      <div className="mt-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Activité récente</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Les dernières activités sur le site</p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center text-gray-500 text-sm">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2">Aucune activité récente pour le moment.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
