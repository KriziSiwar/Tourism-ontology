import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PrivateRoute = ({ requiredRole = null, redirectTo = '/login', children }) => {
  const { isAuthenticated, isAdmin, hasRole, isLoading } = useAuth();

  // Si le chargement est en cours, afficher un indicateur de chargement
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Si un rôle est requis et que l'utilisateur n'a pas ce rôle, rediriger
  if (requiredRole) {
    // Vérifier si l'utilisateur est admin (a accès à tout)
    const isUserAdmin = isAdmin();
    // Vérifier si l'utilisateur a le rôle requis
    const hasRequiredRole = hasRole(requiredRole);
    
    if (!isUserAdmin && !hasRequiredRole) {
      // Rediriger vers la page d'accueil ou une page d'erreur 403
      return <Navigate to="/" replace />;
    }
  }

  // Si tout est bon, afficher les enfants ou le composant
  return children ? children : <Outlet />;
};

export default PrivateRoute;
