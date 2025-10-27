import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Link as MuiLink, 
  Alert, 
  CircularProgress,
  Container,
  Paper
} from '@mui/material';
import { LockOutlined as LockOutlinedIcon } from '@mui/icons-material/';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  // Vérifier s'il y a un message dans l'état de navigation
  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
    }
    
    // Nettoyer le message après 5 secondes
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state, message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.requiresVerification) {
        // Rediriger vers la page de vérification d'email si nécessaire
        navigate('/email-verification-required', { 
          state: { email, from } 
        });
      } else if (result.success) {
        // Rediriger vers la page demandée ou le tableau de bord
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Échec de la connexion');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Une erreur est survenue lors de la connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('Veuillez entrer votre adresse email pour renvoyer le lien de vérification');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const result = await resendVerificationEmail(email);
      
      if (result.success) {
        setMessage('Un nouvel email de vérification a été envoyé à votre adresse email.');
      } else {
        setError(result.message || 'Erreur lors de l\'envoi de l\'email de vérification');
      }
    } catch (err) {
      console.error('Resend verification error:', err);
      setError('Une erreur est survenue. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper 
        elevation={3} 
        sx={{
          marginTop: 8,
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <LockOutlinedIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
        <Typography component="h1" variant="h5">
          Connexion à votre compte
        </Typography>
        
        {message && (
          <Alert severity="success" sx={{ width: '100%', mt: 2 }}>
            {message}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Adresse email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Mot de passe"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <MuiLink 
              component={Link} 
              to="/forgot-password" 
              variant="body2"
              sx={{ textDecoration: 'none' }}
            >
              Mot de passe oublié ?
            </MuiLink>
          </Box>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{ mt: 2, mb: 2 }}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Se connecter'}
          </Button>
          
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Pas encore de compte ?{' '}
              <MuiLink 
                component={Link} 
                to="/register" 
                variant="body2"
                sx={{ textDecoration: 'none' }}
              >
                S'inscrire
              </MuiLink>
            </Typography>
          </Box>
        </Box>
      </Paper>
      
      {/* Section pour renvoyer l'email de vérification */}
      {error && error.includes('vérifié') && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Vous n'avez pas reçu l'email de vérification ?
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={handleResendVerification}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            Renvoyer l'email de vérification
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default Login;
