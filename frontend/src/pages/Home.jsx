import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container, Row, Col, Spinner, Form } from 'react-bootstrap';
import axios from 'axios';
import HebergementCard from '../components/HebergementCard';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [hebergements, setHebergements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    prixMax: '',
    etoiles: ''
  });

  useEffect(() => {
    const fetchHebergements = async () => {
      try {
        // Remplacez cette URL par votre véritable endpoint d'API
        const response = await axios.get('http://localhost:5000/api/hebergements');
        setHebergements(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des hébergements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHebergements();
  }, []);

  const filteredHebergements = hebergements.filter(hebergement => {
    const matchesSearch = hebergement.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hebergement.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilters = 
      (!filters.type || hebergement.type === filters.type) &&
      (!filters.prixMax || hebergement.prix_nuit <= filters.prixMax) &&
      (!filters.etoiles || hebergement.etoiles >= filters.etoiles);
    
    return matchesSearch && matchesFilters;
  });

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <div className="bg-light">
      {/* Hero Section */}
      <div className="py-16 bg-white">
        <Container>
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Bienvenue sur</span>
              <span className="block text-blue-600">EcoTourism</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Découvrez des expériences touristiques durables et respectueuses de l'environnement.
            </p>
          </div>
        </Container>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white shadow-sm py-4 sticky-top" style={{ zIndex: 10 }}>
        <Container>
          <Form>
            <Row className="g-3">
              <Col md={4}>
                <Form.Control
                  type="text"
                  placeholder="Rechercher un hébergement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Col>
              <Col md={2}>
                <Form.Select 
                  value={filters.type}
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                >
                  <option value="">Tous les types</option>
                  <option value="Hôtel">Hôtel</option>
                  <option value="Gîte">Gîte</option>
                  <option value="Chambre d'hôtes">Chambre d'hôtes</option>
                  <option value="Camping">Camping</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select 
                  value={filters.prixMax}
                  onChange={(e) => setFilters({...filters, prixMax: e.target.value})}
                >
                  <option value="">Prix max</option>
                  <option value="50">Moins de 50€</option>
                  <option value="100">Moins de 100€</option>
                  <option value="150">Moins de 150€</option>
                  <option value="200">Moins de 200€</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select 
                  value={filters.etoiles}
                  onChange={(e) => setFilters({...filters, etoiles: e.target.value})}
                >
                  <option value="">Étoiles min.</option>
                  <option value="1">1+ étoiles</option>
                  <option value="2">2+ étoiles</option>
                  <option value="3">3+ étoiles</option>
                  <option value="4">4+ étoiles</option>
                  <option value="5">5 étoiles</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <button 
                  className="btn btn-outline-secondary w-100"
                  onClick={() => {
                    setSearchTerm('');
                    setFilters({
                      type: '',
                      prixMax: '',
                      etoiles: ''
                    });
                  }}
                >
                  Réinitialiser
                </button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>

      {/* Liste des hébergements */}
      <section className="py-5">
        <Container>
          <h2 className="h4 mb-4">Nos hébergements</h2>
          
          {filteredHebergements.length > 0 ? (
            <Row xs={1} md={2} lg={3} className="g-4">
              {filteredHebergements.map((hebergement) => (
                <Col key={hebergement.id}>
                  <HebergementCard hebergement={hebergement} />
                </Col>
              ))}
            </Row>
          ) : (
            <div className="text-center py-5">
              <h3 className="h5 text-muted">Aucun hébergement ne correspond à votre recherche</h3>
              <button 
                className="btn btn-link"
                onClick={() => {
                  setSearchTerm('');
                  setFilters({
                    type: '',
                    prixMax: '',
                    etoiles: ''
                  });
                }}
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </Container>
      </section>
    </div>
  );
};

export default Home;
