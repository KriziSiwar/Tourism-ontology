import React, { Suspense } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Chargement paresseux des composants de page
const HebergementPage = React.lazy(() => import('./pages/HebergementPage'));
const HebergementForm = React.lazy(() => import('./components/hebergement/HebergementForm'));
const ActivitesPage = React.lazy(() => import('./pages/ActivitesPage'));
const ActiviteForm = React.lazy(() => import('./components/activite/ActiviteForm'));

// Composant de chargement
const Loading = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
  }}>
    <div>Chargement...</div>
  </div>
);

// Composant de mise en page
const Layout = ({ children }) => (
  <div className="app-container">
    <nav className="navbar">
      <Link to="/hebergements" className="nav-link">
        Hébergements
      </Link>
      <Link to="/activites" className="nav-link">
        Activités
      </Link>
    </nav>
    <main className="main-content">
      <Suspense fallback={<Loading />}>
        {children}
      </Suspense>
    </main>
  </div>
);

function App() {
  return (
    <>
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
      <Routes>
        <Route path="/" element={<Navigate to="/hebergements" replace />} />
        <Route 
          path="/hebergements" 
          element={
            <Layout>
              <HebergementPage />
            </Layout>
          } 
        />
        <Route 
          path="/hebergements/ajouter" 
          element={
            <Layout>
              <HebergementForm onHebergementAdded={() => window.location.href = '/hebergements'} />
            </Layout>
          } 
        />
        <Route 
          path="/hebergements/edit/:id" 
          element={
            <Layout>
              <HebergementForm onHebergementAdded={() => window.location.href = '/hebergements'} />
            </Layout>
          } 
        />
        <Route 
          path="/activites" 
          element={
            <Layout>
              <ActivitesPage />
            </Layout>
          } 
        />
        <Route 
          path="/activites/ajouter" 
          element={
            <Layout>
              <ActiviteForm onActiviteAdded={() => window.location.href = '/activites'} />
            </Layout>
          } 
        />
        <Route 
          path="/activites/edit/:id" 
          element={
            <Layout>
              <ActiviteForm onActiviteAdded={() => window.location.href = '/activites'} />
            </Layout>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;