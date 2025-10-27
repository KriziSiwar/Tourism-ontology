import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Alert, 
  CircularProgress 
} from '@mui/material';

const EmailVerificationRequired = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { currentUser, resendVerificationEmail, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Rediriger si l'utilisateur n'est pas connecté
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const handleResendEmail = async () => {
    if (!currentUser?.email) return;
    
    try {
      setIsLoading(true);
      setError('');
      setMessage('');
      
      const result = await resendVerificationEmail(currentUser.email);
      
      if (result.success) {
        setMessage('Un nouvel email de vérification a été envoyé à votre adresse email.');
      } else {
        setError(result.message || 'Une erreur est survenue lors de l\'envoi de l\'email de vérification.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Une erreur est survenue. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentUser) {
    return null; // Le redirection est géré par le useEffect
  }

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 4,
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <Typography component="h1" variant="h4" gutterBottom>
          Vérification d'email requise
        </Typography>
        
        <Typography variant="body1" align="center" sx={{ mb: 3 }}>
          Pour accéder à cette page, vous devez d'abord vérifier votre adresse email.
          Un email de vérification a été envoyé à <strong>{currentUser.email}</strong>.
        </Typography>
        
        <Typography variant="body1" align="center" sx={{ mb: 4 }}>
          Si vous n'avez pas reçu l'email, vérifiez votre dossier de courrier indésirable ou cliquez sur le bouton ci-dessous pour en recevoir un nouveau.
        </Typography>
        
        {message && (
          <Alert severity="success" sx={{ width: '100%', mb: 3 }}>
            {message}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleResendEmail}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? 'Envoi en cours...' : 'Renvoyer l\'email de vérification'}
          </Button>
          
          <Button
            variant="outlined"
            color="primary"
            onClick={handleLogout}
            disabled={isLoading}
          >
            Se déconnecter
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default EmailVerificationRequired;
