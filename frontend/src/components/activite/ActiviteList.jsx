import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActivites, deleteActivite } from '../../api/activiteService';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box, 
  CircularProgress,
  IconButton,
  Divider,
  Chip
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Edit as EditIcon,
  Add as AddIcon,
  Event as EventIcon,
  Group as GroupIcon,
  Euro as EuroIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';

const ActiviteList = () => {
  const [activites, setActivites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadActivites = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Chargement des activités...');
      const data = await getActivites();
      console.log('Activités chargées:', data);
      setActivites(data);
    } catch (err) {
      const errorMessage = err.response 
        ? `Erreur ${err.response.status}: ${err.response.data?.message || 'Erreur inconnue'}`
        : 'Impossible de se connecter au serveur. Vérifiez que le serveur est en cours d\'exécution.';
      
      setError(`Erreur lors du chargement des activités: ${errorMessage}`);
      console.error('Détails de l\'erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette activité ?')) {
      try {
        await deleteActivite(id);
        setActivites(activites.filter(a => a.id !== id));
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        setError('Erreur lors de la suppression de l\'activité');
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/activites/edit/${id}`);
  };

  const handleAddActivite = () => {
    navigate('/activites/ajouter');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date non spécifiée';
    try {
      // Vérifier si la date est déjà un objet Date valide
      const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
      return isValid(date) ? format(date, 'PPPp', { locale: fr }) : 'Date invalide';
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return 'Date invalide';
    }
  };

  const getTypeLabel = (type) => {
    const types = {
      'VISITE': 'Visite guidée',
      'RANDONNEE': 'Randonnée',
      'SPORT': 'Sport',
      'CULTURE': 'Culturelle',
      'AUTRE': 'Autre'
    };
    return types[type] || type;
  };

  useEffect(() => {
    loadActivites();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box color="error.main" textAlign="center" p={2}>
        {error}
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Liste des activités
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleAddActivite}
          startIcon={<AddIcon />}
        >
          Ajouter une activité
        </Button>
      </Box>

      {activites.length === 0 ? (
        <Box textAlign="center" p={4}>
          <Typography variant="body1" color="textSecondary">
            Aucune activité disponible pour le moment.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {activites.map((activite) => (
            <Grid item xs={12} sm={6} md={4} key={activite.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography variant="h6" component="h3" gutterBottom noWrap>
                      {activite.nom}
                    </Typography>
                    <Chip 
                      label={getTypeLabel(activite.type)}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {activite.description.length > 150 
                      ? `${activite.description.substring(0, 150)}...` 
                      : activite.description}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box mb={2}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <EventIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {formatDate(activite.dateDebut)}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={1}>
                      <EventIcon color="action" fontSize="small" sx={{ mr: 1, visibility: 'hidden' }} />
                      <Typography variant="body2">
                        au {formatDate(activite.dateFin)}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={1}>
                      <EuroIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {parseFloat(activite.prix).toFixed(2)} € / personne
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={1}>
                      <GroupIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Capacité: {activite.capacite} personnes
                      </Typography>
                    </Box>
                    {activite.lieu && (
                      <Box display="flex" alignItems="center" mb={1}>
                        <LocationIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2" noWrap>
                          {activite.lieu}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
                
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => handleEdit(activite.id)}
                    aria-label="Modifier"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleDelete(activite.id)}
                    aria-label="Supprimer"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ActiviteList;