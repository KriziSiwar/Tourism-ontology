import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:5000/api/auth';

class AdminService {
  // Récupérer les statistiques du tableau de bord
  getDashboardStats() {
    return axios.get(`${API_URL}/admin/dashboard`, { 
      headers: authHeader() 
    });
  }

  // Récupérer la liste des utilisateurs
  getUsers() {
    return axios.get(`${API_URL}/admin/users`, { 
      headers: authHeader() 
    });
  }

  // Mettre à jour un utilisateur
  updateUser(userId, userData) {
    return axios.put(
      `${API_URL}/admin/users/${userId}`, 
      userData, 
      { headers: authHeader() }
    );
  }

  // Supprimer un utilisateur
  deleteUser(userId) {
    return axios.delete(
      `${API_URL}/admin/users/${userId}`, 
      { headers: authHeader() }
    );
  }

  // Bannir/débannir un utilisateur
  toggleUserBan(userId, isBanned) {
    return axios.put(
      `${API_URL}/admin/users/${userId}/ban`,
      { isBanned },
      { headers: authHeader() }
    );
  }

  // Récupérer les logs d'activité
  getActivityLogs(params = {}) {
    return axios.get(`${API_URL}/admin/activity-logs`, {
      params,
      headers: authHeader()
    });
  }
}

export default new AdminService();
