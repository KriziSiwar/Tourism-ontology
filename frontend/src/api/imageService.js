import api from './axiosConfig';

/**
 * Télécharge une image pour un hébergement
 * @param {string} hebergementId - ID de l'hébergement
 * @param {File} file - Fichier image à télécharger
 * @returns {Promise<Object>} Réponse du serveur avec les détails de l'image
 */
export const uploadImage = async (hebergementId, file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await api.post(`/hebergements/${hebergementId}/images`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors du téléchargement de l\'image :', error);
        throw error;
    }
};

/**
 * Supprime une image d'un hébergement
 * @param {string} hebergementId - ID de l'hébergement
 * @param {string} imageId - ID de l'image à supprimer
 * @returns {Promise<Object>} Réponse du serveur
 */
export const deleteImage = async (hebergementId, imageId) => {
    try {
        const response = await api.delete(`/hebergements/${hebergementId}/images/${imageId}`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'image :', error);
        throw error;
    }
};

/**
 * Définit l'image principale d'un hébergement
 * @param {string} hebergementId - ID de l'hébergement
 * @param {string} imageId - ID de l'image à définir comme principale
 * @returns {Promise<Object>} Réponse du serveur
 */
export const setMainImage = async (hebergementId, imageId) => {
    try {
        const response = await api.put(`/hebergements/${hebergementId}/images/${imageId}/set-main`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la définition de l\'image principale :', error);
        throw error;
    }
};
