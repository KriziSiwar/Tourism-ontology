import React from 'react';
import HebergementList from '../components/hebergement/HebergementList';

const HebergementsPage = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '20px' }}>Nos Hébergements</h1>
      <HebergementList />
    </div>
  );
};

export default HebergementsPage;