import React from 'react';
import ActiviteList from '../components/activite/ActiviteList';

const ActivitesPage = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '20px' }}>Nos Activités</h1>
      <ActiviteList />
    </div>
  );
};

export default ActivitesPage;