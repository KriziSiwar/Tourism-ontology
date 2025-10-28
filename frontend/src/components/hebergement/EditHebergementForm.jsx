import React, { useState, useEffect } from 'react';
import { updateHebergement } from '../../api/hebergementService';
import { toast } from 'react-toastify';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

const EditHebergementForm = ({ open, onClose, hebergement, onUpdate }) => {
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix: '',
    capacite: '',
    adresse: '',
    type: 'HOTEL'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialiser le formulaire avec les données de l'hébergement
  useEffect(() => {
    if (hebergement) {
      setFormData({
        nom: hebergement.nom || '',
        description: hebergement.description || '',
        prix: hebergement.prix || '',
        capacite: hebergement.capacite || '',
        adresse: hebergement.adresse || '',
        type: hebergement.type || 'HOTEL'
      });
    }
  }, [hebergement]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.nom.trim() || !formData.description.trim() || !formData.prix || !formData.capacite) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      const updatedHebergement = {
        ...formData,
        prix: parseFloat(formData.prix),
        capacite: parseInt(formData.capacite, 10)
      };
      
      const result = await updateHebergement(hebergement.uri, updatedHebergement);
      toast.success('Hébergement mis à jour avec succès !');
      
      if (onUpdate) {
        onUpdate(result);
      }
      
      onClose();
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'hébergement:', err);
      const errorMessage = err.response?.data?.message || 'Une erreur est survenue lors de la mise à jour';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Modifier l'hébergement</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <div style={{ 
              color: 'white', 
              backgroundColor: '#ff4444', 
              padding: '10px', 
              borderRadius: '4px',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}
          
          <TextField
            margin="dense"
            name="nom"
            label="Nom *"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.nom}
            onChange={handleChange}
            style={{ marginBottom: '16px' }}
          />
          
          <TextField
            margin="dense"
            name="description"
            label="Description *"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={formData.description}
            onChange={handleChange}
            style={{ marginBottom: '16px' }}
          />
          
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <TextField
              margin="dense"
              name="prix"
              label="Prix (€) *"
              type="number"
              fullWidth
              variant="outlined"
              value={formData.prix}
              onChange={handleChange}
              inputProps={{ min: "0", step: "0.01" }}
            />
            
            <TextField
              margin="dense"
              name="capacite"
              label="Capacité *"
              type="number"
              fullWidth
              variant="outlined"
              value={formData.capacite}
              onChange={handleChange}
              inputProps={{ min: "1" }}
            />
          </div>
          
          <TextField
            margin="dense"
            name="adresse"
            label="Adresse"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.adresse}
            onChange={handleChange}
            style={{ marginBottom: '16px' }}
          />
          
          <FormControl fullWidth variant="outlined" margin="dense">
            <InputLabel id="type-label">Type d'hébergement</InputLabel>
            <Select
              labelId="type-label"
              name="type"
              value={formData.type}
              onChange={handleChange}
              label="Type d'hébergement"
            >
              <MenuItem value="HOTEL">Hôtel</MenuItem>
              <MenuItem value="MAISON">Maison d'hôtes</MenuItem>
              <MenuItem value="CAMPING">Camping</MenuItem>
              <MenuItem value="AUTRE">Autre</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        
        <DialogActions style={{ padding: '16px 24px' }}>
          <Button onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditHebergementForm;
