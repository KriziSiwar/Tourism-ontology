import React, { useState, useEffect } from 'react';
import { getHebergements, deleteHebergement } from '../../api/hebergementService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton, 
  Tooltip, 
  CircularProgress, 
  Typography, 
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid
} from '@mui/material';
import {
  Hotel as HotelIcon,
  Home as HomeIcon,
  Villa as VillaIcon,
  HouseSiding as HouseSidingIcon,
  Apartment as ApartmentIcon,
  Landscape as LandscapeIcon,
  MoreHoriz as MoreHorizIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const HebergementList = ({ onHebergementUpdated }) => {
  const [hebergements, setHebergements] = useState([]);
  const [filteredHebergements, setFilteredHebergements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typeFilter, setTypeFilter] = useState('TOUS');
  const navigate = useNavigate();

  // Types d'hébergement pour le filtre
  const typesHebergement = [
    { value: 'TOUS', label: 'Tous les types' },
    { value: 'HOTEL', label: 'Hôtel', icon: <HotelIcon /> },
    { value: 'MAISON_HOTE', label: 'Maison d\'hôte', icon: <HomeIcon /> },
    { value: 'RIAD', label: 'Riad', icon: <VillaIcon /> },
    { value: 'AUBERGE', label: 'Auberge', icon: <HouseSidingIcon /> },
    { value: 'CAMPING', label: 'Camping', icon: <LandscapeIcon /> },
    { value: 'APPARTEMENT', label: 'Appartement', icon: <ApartmentIcon /> },
    { value: 'VILLA', label: 'Villa', icon: <VillaIcon /> },
    { value: 'AUTRE', label: 'Autre', icon: <MoreHorizIcon /> }
  ];

  // Fonction pour obtenir l'icône et le libellé d'un type d'hébergement
  const getTypeInfo = (type) => {
    const typeInfo = typesHebergement.find(t => t.value === type);
    return typeInfo || { icon: <MoreHorizIcon />, label: type };
  };

  const loadHebergements = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getHebergements();
      setHebergements(data);
      setFilteredHebergements(data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du chargement des hébergements';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Erreur lors du chargement des hébergements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (hebergement) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'hébergement "${hebergement.nom}" ?`)) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteHebergement(hebergement.uri);
      
      // Mise à jour optimiste de l'UI
      setHebergements(prev => prev.filter(h => h.uri !== hebergement.uri));
      
      // Message de succès avec le nom de l'hébergement supprimé
      toast.success(`L'hébergement "${hebergement.nom}" a été supprimé avec succès.`);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la suppression de l\'hébergement';
      console.error('Erreur lors de la suppression:', err);
      toast.error(errorMessage);
      // Recharger les données en cas d'erreur
      loadHebergements();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddHebergement = () => {
    navigate('/hebergements/ajouter');
  };

  const handleEdit = (hebergement) => {
    try {
      console.log('URI de l\'hébergement à éditer:', hebergement.uri);
      // Extraire l'ID de l'URI (supposant que l'URI se termine par l'ID)
      const id = hebergement.uri.split('#').pop(); // Changé de '/' à '#' car l'URI utilise '#' comme séparateur
      console.log('ID extrait:', id);
      navigate(`/hebergements/edit/${id}`);
    } catch (error) {
      console.error('Erreur lors de l\'extraction de l\'ID:', error);
      toast.error('Erreur lors de la préparation de l\'édition');
    }
  };

  // Filtrer les hébergements lorsque le filtre ou la liste change
  useEffect(() => {
    if (typeFilter === 'TOUS') {
      setFilteredHebergements(hebergements);
    } else {
      setFilteredHebergements(hebergements.filter(h => h.type === typeFilter));
    }
  }, [typeFilter, hebergements]);

  useEffect(() => {
    loadHebergements();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2">
            Liste des hébergements
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddHebergement}
            startIcon={<EditIcon />}
          >
            Ajouter un hébergement
          </Button>
        </Box>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="filter-type-label">Filtrer par type</InputLabel>
              <Select
                labelId="filter-type-label"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="Filtrer par type"
              >
                {typesHebergement.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box display="flex" alignItems="center">
                      {type.icon && <Box mr={1}>{type.icon}</Box>}
                      {type.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {typeFilter !== 'TOUS' && (
            <Grid item>
              <Chip
                label={`Filtre actif: ${typesHebergement.find(t => t.value === typeFilter)?.label}`}
                onDelete={() => setTypeFilter('TOUS')}
                color="primary"
                variant="outlined"
                deleteIcon={<MoreHorizIcon />}
              />
            </Grid>
          )}
        </Grid>
      </Box>

      {error && (
        <Box mb={3} p={2} bgcolor="error.light" color="white" borderRadius={1}>
          {error}
        </Box>
      )}

      {filteredHebergements.length === 0 ? (
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {typeFilter === 'TOUS' 
              ? 'Aucun hébergement trouvé' 
              : `Aucun hébergement de type "${typesHebergement.find(t => t.value === typeFilter)?.label}"`}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {typeFilter === 'TOUS' 
              ? 'Commencez par ajouter un nouvel hébergement en cliquant sur le bouton ci-dessus.'
              : 'Essayez de changer le filtre ou ajoutez un nouvel hébergement de ce type.'}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Prix (€)</TableCell>
                <TableCell align="center">Capacité</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredHebergements.map((hebergement) => (
                <TableRow key={hebergement.uri}>
                  <TableCell>{hebergement.nom}</TableCell>
                  <TableCell>{hebergement.description.substring(0, 50)}...</TableCell>
                  <TableCell align="right">{parseFloat(hebergement.prix).toFixed(2)}</TableCell>
                  <TableCell align="center">{hebergement.capacite}</TableCell>
                  <TableCell>
                    <Chip
                      icon={getTypeInfo(hebergement.type).icon}
                      label={getTypeInfo(hebergement.type).label}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Modifier">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleEdit(hebergement)}
                        disabled={isDeleting}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton 
                        color="error" 
                        onClick={() => handleDelete(hebergement)}
                        disabled={isDeleting}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default HebergementList;