import React, { useState, useEffect } from 'react';
import { addHebergement, updateHebergement, getHebergement } from '../../api/hebergementService';
import { uploadImage, deleteImage, setMainImage } from '../../api/imageService';
import { generateAccommodationDescription, generateSimpleDescription } from '../../api/aiService';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  Grid, 
  Paper, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Hotel as HotelIcon,
  Home as HomeIcon,
  Villa as VillaIcon,
  HouseSiding as HouseSidingIcon,
  Apartment as ApartmentIcon,
  Landscape as LandscapeIcon,
  OtherHouses as OtherHousesIcon,
  MoreHoriz as MoreHorizIcon
} from '@mui/icons-material';
import ImageUploader from '../common/ImageUploader';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const HebergementForm = ({ onHebergementAdded, onCancel }) => {
  const { id } = useParams();
  // Types d'hébergement disponibles avec icônes
  const typesHebergement = [
    { value: 'HOTEL', label: 'Hôtel', icon: <HotelIcon sx={{ mr: 1 }} /> },
    { value: 'MAISON_HOTE', label: 'Maison d\'hôte', icon: <HomeIcon sx={{ mr: 1 }} /> },
    { value: 'RIAD', label: 'Riad', icon: <VillaIcon sx={{ mr: 1 }} /> },
    { value: 'AUBERGE', label: 'Auberge', icon: <HouseSidingIcon sx={{ mr: 1 }} /> },
    { value: 'CAMPING', label: 'Camping', icon: <LandscapeIcon sx={{ mr: 1 }} /> },
    { value: 'APPARTEMENT', label: 'Appartement', icon: <ApartmentIcon sx={{ mr: 1 }} /> },
    { value: 'VILLA', label: 'Villa', icon: <VillaIcon sx={{ mr: 1 }} /> },
    { value: 'AUTRE', label: 'Autre type d\'hébergement', icon: <MoreHorizIcon sx={{ mr: 1 }} /> }
  ];

  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix: '',
    capacite: '',
    adresse: '',
    type: 'HOTEL', // Valeur par défaut
    uri: '',
    images: []
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDescriptionChange = (e) => {
    setFormData({ ...formData, description: e.target.value });
  };

  const handleGenerateDescription = async () => {
    console.log('Generate button clicked');
    console.log('Current form data:', formData);
    
    if (!formData.nom || !formData.type || !formData.adresse) {
      const errorMsg = 'Veuillez remplir le nom, le type et l\'adresse avant de générer une description.';
      console.log('Validation error:', errorMsg);
      setError(errorMsg);
      return;
    }

    try {
      setIsGenerating(true);
      setError('');
      
      // Show a loading message
      setFormData(prev => ({ 
        ...prev, 
        description: 'Génération de la description en cours...' 
      }));
      
      // Generate the description
      const aiDescription = await generateAccommodationDescription({
        ...formData,
        prix: formData.prix || 0,
        capacite: formData.capacite || 1
      });
      
      setFormData(prev => ({ 
        ...prev, 
        description: aiDescription 
      }));
      
    } catch (err) {
      console.error('Error generating description:', err);
      setError('Erreur lors de la génération de la description. Utilisation d\'un modèle de base.');
      
      // Fallback to simple template
      const simpleDescription = generateSimpleDescription({
        ...formData,
        prix: formData.prix || 0,
        capacite: formData.capacite || 1
      });
      
      setFormData(prev => ({ 
        ...prev, 
        description: simpleDescription 
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  // Gestion du téléchargement d'images
  const handleImageUpload = async (file) => {
    if (!id) {
      // Si c'est une création, on ajoute l'image à l'état local
      const newImage = {
        id: `temp-${Date.now()}`,
        url: URL.createObjectURL(file),
        file,
        isMain: formData.images.length === 0 // Première image = image principale
      };
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImage]
      }));
      
      return newImage;
    } else {
      // Si c'est une mise à jour, on envoie l'image au serveur
      try {
        setUploading(true);
        const response = await uploadImage(id, file);
        
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, response]
        }));
        
        toast.success('Image téléchargée avec succès');
        return response;
      } catch (error) {
        console.error('Erreur lors du téléchargement de l\'image :', error);
        toast.error('Erreur lors du téléchargement de l\'image');
        throw error;
      } finally {
        setUploading(false);
      }
    }
  };
  
  // Gestion de la suppression d'image
  const handleDeleteImage = async (imageId) => {
    try {
      if (id) {
        // Si l'hébergement existe déjà, on supprime l'image du serveur
        await deleteImage(id, imageId);
      }
      
      // Mise à jour de l'état local
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter(img => img.id !== imageId)
      }));
      
      toast.success('Image supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'image :', error);
      toast.error('Erreur lors de la suppression de l\'image');
    }
  };
  
  // Définir une image comme principale
  const handleSetMainImage = async (imageId) => {
    try {
      if (id) {
        // Si l'hébergement existe déjà, on met à jour l'image principale côté serveur
        await setMainImage(id, imageId);
      }
      
      // Mise à jour de l'état local
      setFormData(prev => ({
        ...prev,
        images: prev.images.map(img => ({
          ...img,
          isMain: img.id === imageId
        }))
      }));
      
      toast.success('Image principale mise à jour');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'image principale :', error);
      toast.error('Erreur lors de la mise à jour de l\'image principale');
    }
  };

  // Charger les données de l'hébergement si on est en mode édition
  useEffect(() => {
    const fetchHebergement = async () => {
      if (!id) return;
      
      console.log('[HebergementForm] ID reçu dans le formulaire:', id);
      setIsLoading(true);
      setError('');
      
      try {
        console.log(`[HebergementForm] Tentative de récupération des données pour l'ID: ${id}`);
        
        // Appel à l'API pour récupérer les données de l'hébergement
        const data = await getHebergement(id);
        console.log('[HebergementForm] Données reçues du serveur:', data);
        
        if (!data) {
          throw new Error('Aucune donnée reçue du serveur');
        }
        
        // Mise à jour de l'état du formulaire avec les données reçues
        const updatedFormData = {
          nom: data.nom || '',
          description: data.description || '',
          prix: data.prix || '',
          capacite: data.capacite || '',
          adresse: data.adresse || '',
          type: data.type || 'HOTEL',
          uri: data.uri || '',
          images: data.images || []
        };
        
        console.log('[HebergementForm] Mise à jour du formulaire avec les données:', updatedFormData);
        setFormData(updatedFormData);
        
      } catch (err) {
        console.error('[HebergementForm] Erreur lors du chargement de l\'hébergement:', {
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          responseData: err.response?.data,
          stack: err.stack
        });
        
        setError(`Impossible de charger les données de l'hébergement. ${err.message || 'Veuillez réessayer plus tard.'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHebergement();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation simple
    if (!formData.nom.trim() || !formData.description.trim() || !formData.prix || !formData.capacite) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setIsSubmitting(true);
      const hebergementData = {
        ...formData,
        prix: parseFloat(formData.prix),
        capacite: parseInt(formData.capacite, 10)
      };
      
      let result;
      if (id) {
        // Mode édition
        result = await updateHebergement(id, hebergementData);
        setSuccess('Hébergement mis à jour avec succès !');
      } else {
        // Mode ajout
        result = await addHebergement(hebergementData);
        setSuccess('Hébergement ajouté avec succès !');
        
        // Réinitialiser le formulaire seulement en mode ajout
        if (!id) {
          setFormData({
            nom: '',
            description: '',
            prix: '',
            capacite: '',
            adresse: '',
            type: 'HOTEL',
            uri: '',
            images: []
          });
        }
      }
      
      if (onHebergementAdded) {
        onHebergementAdded(result);
      }
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(`Erreur lors de ${id ? 'la mise à jour' : 'l\'ajout'} de l'hébergement:`, err);
      setError(`Une erreur est survenue lors de ${id ? 'la mise à jour' : 'l\'ajout'} de l'hébergement`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        {id ? `Modifier l'hébergement: ${formData.nom || ''}` : 'Nouvel hébergement'}
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        {id 
          ? 'Modifiez les champs ci-dessous pour mettre à jour l\'hébergement.' 
          : 'Remplissez les champs ci-dessous pour ajouter un hébergement.'
        }
      </Typography>
      
      {error && (
        <Box mb={2}>
          <Alert severity="error" sx={{ color: 'white', p: 2, borderRadius: 1, mb: 3 }}>
            {error}
          </Alert>
        </Box>
      )}
      
      {success && (
        <Box 
          sx={{ 
            backgroundColor: 'success.light', 
            color: 'white', 
            p: 2, 
            borderRadius: 1,
            mb: 3
          }}
        >
          {success}
        </Box>
      )}
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="nom"
              label="Nom de l'hébergement"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ position: 'relative', width: '100%' }}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleDescriptionChange}
                multiline
                rows={4}
                margin="normal"
                variant="outlined"
                required
              />
              <Button
                variant="outlined"
                color="primary"
                onClick={handleGenerateDescription}
                disabled={isGenerating}
                sx={{
                  position: 'absolute',
                  right: 8,
                  bottom: 8,
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  minWidth: 'auto',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                {isGenerating ? (
                  <CircularProgress size={16} />
                ) : (
                  '✨ AI Generate'
                )}
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              type="number"
              id="prix"
              label="Prix par nuit (€)"
              name="prix"
              value={formData.prix}
              onChange={handleChange}
              inputProps={{ min: "0", step: "0.01" }}
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              type="number"
              id="capacite"
              label="Capacité (nombre de personnes)"
              name="capacite"
              value={formData.capacite}
              onChange={handleChange}
              inputProps={{ min: "1" }}
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="adresse"
              label="Adresse complète"
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="type-hebergement-label">Type d'hébergement</InputLabel>
              <Select
                labelId="type-hebergement-label"
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                label="Type d'hébergement"
              >
                {typesHebergement.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box display="flex" alignItems="center">
                      {type.icon}
                      {type.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Images de l'hébergement
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Téléchargez jusqu'à 10 images pour présenter votre hébergement. 
              La première image sera utilisée comme image principale.
            </Typography>
            
            <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
              <ImageUploader
                images={formData.images}
                onUpload={handleImageUpload}
                onDelete={handleDeleteImage}
                onSetMain={handleSetMainImage}
                maxFiles={10}
                maxSizeMB={5}
              />
              {uploading && (
                <Box display="flex" alignItems="center" mt={2}>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  <Typography variant="body2" color="textSecondary">
                    Téléchargement en cours...
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={onCancel || (() => navigate(-1))}
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
              {isSubmitting ? 'Enregistrement...' : formData.uri ? 'Mettre à jour' : 'Ajouter l\'hébergement'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default HebergementForm;
