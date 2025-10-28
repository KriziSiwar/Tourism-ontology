import React, { useState, useCallback } from 'react';
import { Container, Paper, Tabs, Tab, Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import HebergementList from '../components/hebergement/HebergementList';
import HebergementForm from '../components/hebergement/HebergementForm';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const HebergementPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleHebergementAdded = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    setShowAddForm(false);
    setActiveTab(0);
  }, []);

  const handleHebergementUpdated = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleAddClick = () => {
    setShowAddForm(true);
    setActiveTab(1);
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: '30px', marginBottom: '50px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, color: '#2c3e50' }}>Gestion des hébergements</h1>
      
      </div>

      <Paper elevation={3} style={{ borderRadius: '10px', overflow: 'hidden' }}>
        <Tabs 
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          style={{ 
            backgroundColor: '#f5f5f5',
            display: 'none' // Caché visuellement mais nécessaire pour la logique
          }}
        >
          <Tab label="Liste des hébergements" />
          <Tab label="Ajouter un hébergement" />
        </Tabs>
        
        <Box p={3}>
          {activeTab === 0 ? (
            <HebergementList 
              key={refreshKey}
              onHebergementUpdated={handleHebergementUpdated}
            />
          ) : (
            <HebergementForm 
              onHebergementAdded={handleHebergementAdded} 
              onCancel={() => {
                setShowAddForm(false);
                setActiveTab(0);
              }} 
            />
          )}
        </Box>
      </Paper>
      
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Container>
  );
};

export default HebergementPage;
