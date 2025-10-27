import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../services/auth.service';

// Création du contexte avec des valeurs par défaut
const defaultContextValue = {
  currentUser: null,
  isAuthenticated: false,
  isEmailVerified: false,
  isLoading: true,
  authError: null,
  login: () => {},
  logout: () => {},
  register: () => {},
  verifyEmail: () => {},
  resendVerificationEmail: () => {},
  resetPassword: () => {},
  forgotPassword: () => {},
  clearError: () => {},
  hasRole: () => false,
  isAdmin: false
};

export const AuthContext = createContext(defaultContextValue);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Vérifier l'état d'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = AuthService.getCurrentUser();
        if (user) {
          const isValid = await AuthService.isAuthenticated();
          if (isValid) {
            setCurrentUser(user);
            setIsAuthenticated(true);
            setIsEmailVerified(user.isEmailVerified || false);
          } else {
            await handleLogout();
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        await handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Gestion de la connexion
  const login = async (email, password) => {
    try {
      setAuthError(null);
      setIsLoading(true);
      
      const user = await AuthService.login(email, password);
      
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        setIsEmailVerified(user.isEmailVerified || false);
        
        // Rediriger en fonction du rôle
        const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/';
        navigate(redirectPath, { replace: true });
        
        return { 
          success: true, 
          requiresVerification: !user.isEmailVerified,
          role: user.role
        };
      }
      
      throw new Error('Réponse du serveur invalide');
      
    } catch (error) {
      console.error('Login error:', error);
      const message = error.message || 'Échec de la connexion. Veuillez vérifier vos identifiants.';
      setAuthError(message);
      return { 
        success: false, 
        message,
        requiresVerification: error.requiresVerification
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion de la déconnexion
  const handleLogout = useCallback(() => {
    AuthService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setIsEmailVerified(false);
    setAuthError(null);
    navigate('/login');
  }, [navigate]);

  // Gestion de l'inscription
  const register = async (username, email, password, role = 'tourist') => {
    try {
      setAuthError(null);
      setIsLoading(true);
      
      await AuthService.register(username, email, password, role);
      return { success: true };
      
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || 'Échec de l\'inscription. Veuillez réessayer.';
      setAuthError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  // Vérification d'email
  const verifyEmail = async (token) => {
    try {
      await AuthService.verifyEmail(token);
      const user = AuthService.getCurrentUser();
      if (user) {
        setCurrentUser({ ...user, isEmailVerified: true });
        setIsEmailVerified(true);
      }
      return { success: true };
    } catch (error) {
      console.error('Email verification error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Échec de la vérification de l\'email.' 
      };
    }
  };

  // Renvoyer l'email de vérification
  const resendVerificationEmail = async (email) => {
    try {
      await AuthService.resendVerificationEmail(email);
      return { success: true };
    } catch (error) {
      console.error('Resend verification email error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Échec de l\'envoi de l\'email de vérification.' 
      };
    }
  };

  // Réinitialisation du mot de passe
  const forgotPassword = async (email) => {
    try {
      await AuthService.forgotPassword(email);
      return { success: true };
    } catch (error) {
      console.error('Forgot password error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Échec de la demande de réinitialisation du mot de passe.' 
      };
    }
  };

  // Définir un nouveau mot de passe
  const resetPassword = async (token, newPassword) => {
    try {
      await AuthService.resetPassword(token, newPassword);
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Échec de la réinitialisation du mot de passe.' 
      };
    }
  };

  // Mettre à jour les informations de l'utilisateur
  const updateUser = (userData) => {
    setCurrentUser(prev => ({
      ...prev,
      ...userData
    }));
  };

  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (role) => {
    if (!currentUser) return false;
    if (Array.isArray(role)) {
      return role.includes(currentUser.role);
    }
    return currentUser.role === role;
  };

  // Vérifier si l'utilisateur est administrateur
  const isAdmin = currentUser?.role === 'admin';

  // Rediriger les non-admins qui essaient d'accéder à /admin
  useEffect(() => {
    if (!isLoading && isAuthenticated && location.pathname.startsWith('/admin') && !isAdmin) {
      navigate('/unauthorized', { replace: true });
    }
  }, [isLoading, isAuthenticated, isAdmin, location.pathname, navigate]);

  // Valeur du contexte
  const contextValue = {
    currentUser,
    isAuthenticated,
    isEmailVerified,
    isLoading,
    authError,
    login,
    logout: handleLogout,
    register,
    verifyEmail,
    resendVerificationEmail,
    resetPassword,
    forgotPassword,
    clearError: () => setAuthError(null),
    hasRole,
    isAdmin,
    updateUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
