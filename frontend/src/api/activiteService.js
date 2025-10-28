import api from './axiosConfig';

export const getActivites = async () => {
  try {
    const response = await api.get('/activites');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des activités:', error);
    throw error;
  }
};

export const getActivite = async (id) => {
  try {
    const response = await api.get(`/activites/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'activité:', error);
    throw error;
  }
};

export const addActivite = async (activite) => {
  try {
    const response = await api.post('/activites', activite);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'activité:', error);
    throw error;
  }
};

export const updateActivite = async (id, activiteData) => {
  try {
    const response = await api.put(`/activites/${id}`, activiteData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'activité:', error);
    throw error;
  }
};

export const deleteActivite = async (id) => {
  try {
    await api.delete(`/activites/${id}`);
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'activité:', error);
    throw error;
  }
};