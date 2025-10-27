import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { verifyEmail as verifyEmailApi } from '../services/auth.service';
import { Alert, Box, Button, CircularProgress, Container, Typography } from '@mui/material';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('Vérification de votre adresse email en cours...');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await verifyEmailApi(token);
        setStatus('success');
        setMessage('Votre adresse email a été vérifiée avec succès !');
        
        // Redirection après 3 secondes
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        console.error('Erreur lors de la vérification:', error);
        setStatus('error');
        setMessage(error.response?.data?.message || 'Une erreur est survenue lors de la vérification.');
      }
    };

    verifyToken();
  }, [token, navigate]);

  return (
    <Container component="main" maxWidth="sm">
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
        {status === 'verifying' && (
          <>
            <CircularProgress />
            <Typography component="h1" variant="h5" sx={{ mt: 2 }}>
              {message}
            </Typography>
          </>
        )}

        {status === 'success' && (
          <Alert severity="success" sx={{ width: '100%' }}>
            <Typography variant="h6">{message}</Typography>
            <Typography>Redirection en cours...</Typography>
          </Alert>
        )}

        {status === 'error' && (
          <Box sx={{ width: '100%', textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {message}
            </Alert>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/resend-verification')}
            >
              Renvoyer l'email de vérification
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default VerifyEmail;
