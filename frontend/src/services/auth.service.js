import axios from 'axios';

// Configuration d'axios pour intercepter les réponses
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Intercepteur pour gérer les erreurs globalement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Erreurs 401 non autorisées
      if (error.response.status === 401) {
        // Si le token a expiré, on déconnecte l'utilisateur
        if (error.response.data.message === 'Token expiré') {
          AuthService.logout();
          window.location.href = '/login';
        }
      }
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);

class AuthService {
  constructor() {
    this.refreshTimeout = null;
  }

  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.accessToken) {
        const userData = {
          ...response.data,
          // Assurez-vous que ces champs correspondent à la réponse de votre API
          role: response.data.role || 'user',
          isEmailVerified: response.data.isEmailVerified || false,
          expiresIn: response.data.expiresIn || 3600
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        this.scheduleTokenRefresh(userData.expiresIn);
        return userData;
      }
      
      throw new Error('Réponse du serveur invalide');
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  }

  logout() {
    // Annuler le rafraîchissement du token
    this.cancelTokenRefresh();
    localStorage.removeItem('user');
    // Rediriger vers la page de connexion
    window.location.href = '/login';
  }

  register(username, email, password, role = 'tourist', confirmPassword) {
    return axios.post(API_URL + 'register', {
      username,
      email,
      password,
      confirm_password: confirmPassword,
      role
    });
  }

  // Vérification d'email
  verifyEmail(token) {
    return axios.get(`${API_URL}verify-email/${token}`);
  }

  // Renvoyer l'email de vérification
  resendVerificationEmail(email) {
    return axios.post(`${API_URL}resend-verification`, { email });
  }

  // Demande de réinitialisation de mot de passe
  forgotPassword(email) {
    return axios.post(`${API_URL}forgot-password`, { email });
  }

  // Réinitialisation du mot de passe
  resetPassword(token, newPassword) {
    return axios.post(`${API_URL}reset-password`, { token, newPassword });
  }

  // Rafraîchissement du token
  refreshToken() {
    const user = this.getCurrentUser();
    if (!user || !user.refreshToken) {
      return Promise.reject('No refresh token available');
    }
    
    return axios
      .post(`${API_URL}refresh-token`, {
        refreshToken: user.refreshToken
      })
      .then(response => {
        if (response.data.accessToken) {
          const userData = { ...user, ...response.data };
          localStorage.setItem('user', JSON.stringify(userData));
          // Planifier le prochain rafraîchissement
          this.scheduleTokenRefresh(response.data.expiresIn);
        }
        return response.data;
      });
  }

  // Gestion du rafraîchissement automatique du token
  scheduleTokenRefresh(expiresIn) {
    // Rafraîchir le token 5 minutes avant son expiration
    const refreshTime = (expiresIn - 300) * 1000; // convert to milliseconds
    
    // Annuler tout rafraîchissement prévu
    this.cancelTokenRefresh();
    
    // Planifier le prochain rafraîchissement
    this.refreshTimeout = setTimeout(() => {
      this.refreshToken().catch(error => {
        console.error('Erreur lors du rafraîchissement du token:', error);
        // En cas d'erreur, déconnecter l'utilisateur
        this.logout();
      });
    }, refreshTime);
  }

  cancelTokenRefresh() {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  // Vérifie si l'utilisateur est authentifié et a un token valide
  isAuthenticated() {
    const user = this.getCurrentUser();
    if (!user || !user.accessToken) return false;
    
    // Vérifier si le token est expiré
    const decodedToken = this.parseJwt(user.accessToken);
    return decodedToken.exp * 1000 > Date.now();
  }

  // Vérifie si l'email de l'utilisateur est vérifié
  isEmailVerified() {
    const user = this.getCurrentUser();
    return user && user.isEmailVerified;
  }

  // Méthode utilitaire pour décoder le JWT
  parseJwt(token) {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  }
}

export default new AuthService();
