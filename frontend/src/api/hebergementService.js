import api from './axiosConfig';

/**
 * Récupère la liste de tous les hébergements
 * @returns {Promise<Array>} Liste des hébergements
 */
export const getHebergements = async () => {
    console.log('[HebergementService] Récupération de tous les hébergements');
    try {
        const response = await api.get('/hebergements');
        console.log(`[HebergementService] ${response.data.length} hébergements récupérés`);
        return response.data;
    } catch (error) {
        console.error('[HebergementService] Erreur lors de la récupération des hébergements:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            url: error.config?.url,
            method: error.config?.method
        });
        throw error;
    }
};

/**
 * Récupère un hébergement par son ID
 * @param {string} id - ID de l'hébergement
 * @returns {Promise<Object>} Données de l'hébergement
 */
export const getHebergement = async (id) => {
    if (!id) {
        const error = new Error('ID d\'hébergement non fourni');
        console.error('[HebergementService]', error.message);
        throw error;
    }

    // Nettoyage de l'ID si c'est une URI
    let hebergementId = id;
    if (id.includes('#')) {
        hebergementId = id.split('#').pop();
        console.log(`[HebergementService] ID extrait de l'URI: ${hebergementId}`);
    } else if (id.startsWith('http')) {
        // Si c'est une URL complète, on essaie d'extraire l'ID
        try {
            const url = new URL(id);
            hebergementId = url.hash ? url.hash.substring(1) : url.pathname.split('/').pop();
            console.log(`[HebergementService] ID extrait de l'URL: ${hebergementId}`);
        } catch (e) {
            console.warn(`[HebergementService] Impossible d'extraire l'ID de l'URL: ${id}`, e);
        }
    }

    console.log(`[HebergementService] Récupération de l'hébergement avec l'ID: ${hebergementId}`);
    
    try {
        const response = await api.get(`/hebergements/${encodeURIComponent(hebergementId)}`);
        
        if (!response.data) {
            const error = new Error('Aucune donnée reçue du serveur');
            error.code = 'NO_DATA';
            throw error;
        }
        
        console.log('[HebergementService] Données de l\'hébergement récupérées:', response.data);
        return response.data;
        
    } catch (error) {
        const errorDetails = {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            statusText: error.response?.statusText,
            responseData: error.response?.data,
            requestUrl: error.config?.url,
            requestMethod: error.config?.method
        };
        
        console.error(`[HebergementService] Erreur lors de la récupération de l'hébergement ${hebergementId}:`, errorDetails);
        
        // Création d'un message d'erreur plus convivial
        let errorMessage = 'Impossible de charger les données de l\'hébergement.';
        
        if (error.response) {
            // Erreur de réponse du serveur (4xx, 5xx)
            if (error.response.status === 404) {
                errorMessage = 'Hébergement non trouvé. Vérifiez que l\'identifiant est correct.';
            } else if (error.response.status === 500) {
                errorMessage = 'Erreur serveur lors de la récupération des données.';
            }
        } else if (error.request) {
            // La requête a été faite mais aucune réponse n'a été reçue
            errorMessage = 'Aucune réponse du serveur. Vérifiez votre connexion internet.';
        }
        
        const enhancedError = new Error(errorMessage);
        enhancedError.originalError = error;
        enhancedError.details = errorDetails;
        throw enhancedError;
    }
};

/**
 * Ajoute un nouvel hébergement
 * @param {Object} hebergementData - Données du nouvel hébergement
 * @returns {Promise<Object>} Réponse du serveur
 */
export const addHebergement = async (hebergementData) => {
    console.log('[HebergementService] Ajout d\'un nouvel hébergement:', hebergementData);
    try {
        const response = await api.post('/hebergements', hebergementData);
        console.log('[HebergementService] Hébergement ajouté avec succès:', response.data);
        return response.data;
    } catch (error) {
        console.error('[HebergementService] Erreur lors de l\'ajout de l\'hébergement:', {
            message: error.message,
            status: error.response?.status,
            responseData: error.response?.data,
            requestData: hebergementData
        });
        throw error;
    }
};

/**
 * Met à jour un hébergement existant
 * @param {string} id - ID de l'hébergement à mettre à jour
 * @param {Object} hebergementData - Nouvelles données de l'hébergement
 * @returns {Promise<Object>} Réponse du serveur
 */
export const updateHebergement = async (id, hebergementData) => {
    if (!id) {
        const error = new Error('ID d\'hébergement non fourni pour la mise à jour');
        console.error('[HebergementService]', error.message);
        throw error;
    }

    // Nettoyage de l'ID si c'est une URI
    let hebergementId = id;
    if (id.includes('#')) {
        hebergementId = id.split('#').pop();
        console.log(`[HebergementService] ID extrait de l'URI pour mise à jour: ${hebergementId}`);
    } else if (id.startsWith('http')) {
        // Si c'est une URL complète, on essaie d'extraire l'ID
        try {
            const url = new URL(id);
            hebergementId = url.hash ? url.hash.substring(1) : url.pathname.split('/').pop();
            console.log(`[HebergementService] ID extrait de l'URL: ${hebergementId}`);
        } catch (e) {
            console.warn(`[HebergementService] Impossible d'extraire l'ID de l'URL: ${id}`, e);
        }
    }

    // Préparer les données pour l'envoi
    const dataToSend = {
        nom: hebergementData.nom || '',
        description: hebergementData.description || '',
        prix: parseFloat(hebergementData.prix) || 0,
        capacite: parseInt(hebergementData.capacite, 10) || 0,
        adresse: hebergementData.adresse || '',
        type: hebergementData.type || 'HOTEL'
    };

    console.log(`[HebergementService] Mise à jour de l'hébergement ${hebergementId}:`, dataToSend);
    
    try {
        const response = await api.put(
            `/hebergements/${encodeURIComponent(hebergementId)}`,
            dataToSend,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('[HebergementService] Hébergement mis à jour avec succès:', response.data);
        return response.data;
    } catch (error) {
        const errorInfo = {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            responseData: error.response?.data,
            requestData: dataToSend,
            url: error.config?.url,
            method: error.config?.method
        };
        
        console.error(`[HebergementService] Erreur lors de la mise à jour de l'hébergement ${hebergementId}:`, errorInfo);
        
        // Créer une erreur plus détaillée
        const enhancedError = new Error(`Échec de la mise à jour de l'hébergement: ${error.message}`);
        enhancedError.details = errorInfo;
        
        throw enhancedError;
    }
};

/**
 * Supprime un hébergement
 * @param {string} id - ID de l'hébergement à supprimer
 * @returns {Promise<Object>} Réponse du serveur
 */
export const deleteHebergement = async (id) => {
    if (!id) {
        const error = new Error('ID d\'hébergement non fourni pour la suppression');
        console.error('[HebergementService]', error.message);
        throw error;
    }

    // Nettoyage de l'ID si c'est une URI
    let hebergementId = id;
    if (id.includes('#')) {
        hebergementId = id.split('#').pop();
        console.log(`[HebergementService] ID extrait de l'URI pour suppression: ${hebergementId}`);
    }

    console.log(`[HebergementService] Suppression de l'hébergement avec l'ID: ${hebergementId}`);
    
    try {
        const response = await api.delete(`/hebergements/${encodeURIComponent(hebergementId)}`);
        console.log('[HebergementService] Hébergement supprimé avec succès');
        return response.data;
    } catch (error) {
        console.error(`[HebergementService] Erreur lors de la suppression de l'hébergement ${hebergementId}:`, {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            responseData: error.response?.data
        });
        throw error;
    }
};