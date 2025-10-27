from SPARQLWrapper import SPARQLWrapper, JSON

class FusekiClient:
    def __init__(self, endpoint="http://localhost:3030/novagrptourisme"):  # Notez le changement de nom de dataset
        self.sparql = SPARQLWrapper(endpoint)
        self.sparql.setReturnFormat(JSON)
    
    def query(self, query):
        """Exécute une requête SPARQL de type SELECT"""
        self.sparql.setQuery(query)
        try:
            results = self.sparql.query().convert()
            # Si c'est une requête SELECT, retourne les résultats bruts
            if 'results' in results:
                return results['results']['bindings']
            # Si c'est une requête CONSTRUCT, retourne le graphe
            elif 'results' not in results:
                return results
            return results
        except Exception as e:
            print(f"Erreur de requête SPARQL: {e}")
            return []

# Instance unique du client
fuseki = FusekiClient()