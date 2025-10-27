import { Button, Container, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Unauthorized() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

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
          textAlign: 'center',
        }}
      >
        <Typography component="h1" variant="h2" color="error" gutterBottom>
          403
        </Typography>
        <Typography variant="h4" gutterBottom>
          Accès refusé
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Désolé, vous n'avez pas les autorisations nécessaires pour accéder à cette page.
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
          Si vous pensez qu'il s'agit d'une erreur, veuillez contacter l'administrateur.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGoBack}
          >
            Retour
          </Button>
          
          <Button
            variant="outlined"
            color="primary"
            onClick={handleGoHome}
          >
            Page d'accueil
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
