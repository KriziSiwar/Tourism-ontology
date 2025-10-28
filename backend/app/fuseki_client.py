from SPARQLWrapper import SPARQLWrapper, JSON, POST
import logging
import os

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FusekiClient:
    def __init__(self, endpoint=None):
        # Utiliser l'endpoint depuis la variable d'environnement ou la valeur par défaut
        self.endpoint = endpoint or os.getenv('FUSEKI_ENDPOINT', 'http://localhost:3030/novagrptourisme')
        
        # S'assurer que l'URL se termine par /sparql pour les requêtes de lecture
        if not self.endpoint.endswith('/sparql'):
            if not self.endpoint.endswith('/'):
                self.endpoint += '/'
            self.endpoint += 'sparql'
            
        logger.info(f"Connexion au serveur Fuseki à l'adresse: {self.endpoint}")
        
        # Initialisation du client SPARQL
        self.sparql = SPARQLWrapper(self.endpoint)
        self.sparql.setReturnFormat(JSON)
        self.sparql.setMethod('GET')
    
    def query(self, query, update=False):
        """
        Exécute une requête SPARQL
        :param query: La requête SPARQL à exécuter
        :param update: Si True, exécute une requête de mise à jour (INSERT, DELETE, etc.)
        """
        try:
            if update:
                # Pour les requêtes de mise à jour, on utilise le endpoint /update
                update_endpoint = self.endpoint.replace('/sparql', '/update')
                logger.debug(f"Exécution de la requête de mise à jour sur {update_endpoint}")
                logger.debug(f"Requête: {query}")
                
                update_sparql = SPARQLWrapper(update_endpoint)
                update_sparql.setMethod(POST)
                update_sparql.setQuery(query)
                
                try:
                    result = update_sparql.query()
                    logger.info("Requête de mise à jour exécutée avec succès")
                    return result
                except Exception as e:
                    logger.error(f"Erreur lors de l'exécution de la requête de mise à jour: {str(e)}")
                    logger.error(f"Requête en échec: {query}")
                    raise
            else:
                # Pour les requêtes de lecture (SELECT, CONSTRUCT, etc.)
                logger.debug(f"Exécution de la requête sur {self.endpoint}")
                logger.debug(f"Requête: {query}")
                
                self.sparql.setQuery(query)
                results = self.sparql.query().convert()
                
                # Journalisation des résultats (partielle pour éviter les logs trop volumineux)
                if 'results' in results and 'bindings' in results['results']:
                    logger.info(f"Requête exécutée avec succès, {len(results['results']['bindings'])} résultats")
                
                return results
                
        except Exception as e:
            logger.error(f"Erreur lors de l'exécution de la requête SPARQL: {str(e)}")
            logger.error(f"Requête en échec: {query}")
            # Retourne une structure vide similaire à une réponse SPARQL vide
            return {'results': {'bindings': []}}
    
    def update(self, query):
        """Exécute une requête de mise à jour SPARQL (INSERT, DELETE, etc.)"""
        return self.query(query, update=True)

# Configuration de l'instance unique du client
fuseki = FusekiClient()