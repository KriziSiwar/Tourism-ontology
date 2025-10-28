import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addActivite, updateActivite, getActivite } from '../../api/activiteService';
import { 
  Button, 
  TextField, 
  Grid, 
  Typography, 
  Paper, 
  Box, 
  CircularProgress,
  InputAdornment,
  InputLabel,
  MenuItem,
  FormControl,
  Select
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';

const ActiviteForm = ({ onActiviteAdded, onCancel }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix: '',
    capacite: '',
    dateDebut: null,
    heureDebut: null,
    dateFin: null,
    heureFin: null,
    type: 'VISITE',
    lieu: ''
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Charger les données de l'activité si on est en mode édition
  useEffect(() => {
    const fetchActivite = async () => {
      if (id) {
        setIsLoading(true);
        try {
          const data = await getActivite(id);
          const dateDebut = data.dateDebut ? new Date(data.dateDebut) : null;
          const dateFin = data.dateFin ? new Date(data.dateFin) : null;
          
          setFormData({
            nom: data.nom || '',
            description: data.description || '',
            prix: data.prix || '',
            capacite: data.capacite || '',
            dateDebut: dateDebut,
            heureDebut: dateDebut,
            dateFin: dateFin,
            heureFin: dateFin,
            type: data.type || 'VISITE',
            lieu: data.lieu || ''
          });
        } catch (err) {
          console.error('Erreur lors du chargement de l\'activité:', err);
          setError('Impossible de charger les données de l\'activité');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchActivite();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
  };

  const combineDateTime = (date, time) => {
    if (!date || !time) return null;
    
    const newDate = new Date(date);
    const newTime = new Date(time);
    
    newDate.setHours(newTime.getHours());
    newDate.setMinutes(newTime.getMinutes());
    
    return newDate.toISOString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    // Validation
    if (!formData.nom.trim() || !formData.description.trim() || !formData.prix || 
        !formData.capacite || !formData.dateDebut || !formData.heureDebut || 
        !formData.dateFin || !formData.heureFin) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const activiteData = {
        ...formData,
        dateDebut: combineDateTime(formData.dateDebut, formData.heureDebut),
        dateFin: combineDateTime(formData.dateFin, formData.heureFin),
        prix: parseFloat(formData.prix),
        capacite: parseInt(formData.capacite, 10)
      };
      
      delete activiteData.heureDebut;
      delete activiteData.heureFin;
      
      let result;
      if (id) {
        // Mode édition
        result = await updateActivite(id, activiteData);
        setSuccessMessage('Activité mise à jour avec succès !');
      } else {
        // Mode ajout
        result = await addActivite(activiteData);
        setSuccessMessage('Activité ajoutée avec succès !');
        
        // Réinitialiser le formulaire seulement en mode ajout
        if (!id) {
          setFormData({
            nom: '',
            description: '',
            prix: '',
            capacite: '',
            dateDebut: null,
            heureDebut: null,
            dateFin: null,
            heureFin: null,
            type: 'VISITE',
            lieu: ''
          });
        }
      }
      
      if (onActiviteAdded) {
        onActiviteAdded(result);
      }
      
      // Redirection après un délai pour montrer le message de succès
      setTimeout(() => {
        if (id) {
          navigate('/activites');
        }
      }, 1500);
      
    } catch (err) {
      console.error(`Erreur lors de ${id ? 'la mise à jour' : 'l\'ajout'} de l'activité:`, err);
      setError(`Une erreur est survenue lors de ${id ? 'la mise à jour' : 'l\'ajout'} de l'activité`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: '800px', margin: '0 auto' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            {id ? 'Modifier l\'activité' : 'Nouvelle activité'}
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            {id ? 'Modifiez les détails de l\'activité.' : 'Remplissez le formulaire pour ajouter une nouvelle activité.'}
          </Typography>
        </Box>
        
        {error && (
          <Box 
            sx={{ 
              backgroundColor: 'error.light', 
              color: 'white', 
              p: 2, 
              borderRadius: 1,
              mb: 3
            }}
          >
            {error}
          </Box>
        )}
        
        {successMessage && (
          <Box 
            sx={{ 
              backgroundColor: 'success.light', 
              color: 'white', 
              p: 2, 
              borderRadius: 1,
              mb: 3
            }}
          >
            {successMessage}
          </Box>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="nom"
                label="Nom de l'activité"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={3}
                id="description"
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="number"
                id="prix"
                label="Prix par personne (€)"
                name="prix"
                value={formData.prix}
                onChange={handleChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">€</InputAdornment>,
                  inputProps: { min: 0, step: 0.01 }
                }}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="number"
                id="capacite"
                label="Capacité maximale"
                name="capacite"
                value={formData.capacite}
                onChange={handleChange}
                inputProps={{ min: 1 }}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Date de début"
                value={formData.dateDebut}
                onChange={(date) => handleDateChange('dateDebut', date)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    required
                    variant="outlined"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TimePicker
                label="Heure de début"
                value={formData.heureDebut}
                onChange={(time) => handleDateChange('heureDebut', time)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    required
                    variant="outlined"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Date de fin"
                value={formData.dateFin}
                onChange={(date) => handleDateChange('dateFin', date)}
                minDate={formData.dateDebut}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    required
                    variant="outlined"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TimePicker
                label="Heure de fin"
                value={formData.heureFin}
                onChange={(time) => handleDateChange('heureFin', time)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    required
                    variant="outlined"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="type-label">Type d'activité</InputLabel>
                <Select
                  labelId="type-label"
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  label="Type d'activité"
                >
                  <MenuItem value="VISITE">Visite guidée</MenuItem>
                  <MenuItem value="RANDONNEE">Randonnée</MenuItem>
                  <MenuItem value="SPORT">Activité sportive</MenuItem>
                  <MenuItem value="CULTURE">Activité culturelle</MenuItem>
                  <MenuItem value="AUTRE">Autre</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="lieu"
                label="Lieu"
                name="lieu"
                value={formData.lieu}
                onChange={handleChange}
                variant="outlined"
                helperText="Lieu de rendez-vous ou point de départ"
              />
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={onCancel || (() => navigate('/activites'))}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
              >
                {isSubmitting ? 'Enregistrement...' : id ? 'Mettre à jour' : 'Ajouter l\'activité'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};

export default ActiviteForm;
