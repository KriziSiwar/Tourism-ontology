from rdflib import Graph, Literal, URIRef, Namespace
from rdflib.namespace import RDF, XSD, RDFS
from datetime import datetime
import uuid

# Définition des namespaces
NS = Namespace("http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#")
RDFS = RDFS

class UserRepository:
    def __init__(self, sparql_endpoint):
        self.sparql_endpoint = sparql_endpoint
        self.graph = Graph()
        self.graph.bind("ns", NS)
    
    def _create_user_uri(self, user_id):
        return URIRef(f"{NS}User_{user_id}")
    
    def _user_exists(self, email):
        query = """
        PREFIX ns: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
        ASK {
            ?user ns:email ?email .
            FILTER (str(?email) = "%s")
        }
        """ % email
        
        result = self.graph.query(query)
        return bool(result)
    
    def create_user(self, user_data):
        # Vérifier si l'utilisateur existe déjà
        if self._user_exists(user_data['email']):
            return None
        
        # Créer un nouvel ID utilisateur
        user_id = str(uuid.uuid4())
        user_uri = self._create_user_uri(user_id)
        
        # Créer le graphe RDF pour l'utilisateur
        g = Graph()
        g.bind("ns", NS)
        
        # Ajouter les propriétés de l'utilisateur
        g.add((user_uri, RDF.type, NS.User))
        g.add((user_uri, NS.userId, Literal(user_id)))
        g.add((user_uri, NS.username, Literal(user_data['username'])))
        g.add((user_uri, NS.email, Literal(user_data['email'])))
        g.add((user_uri, NS.passwordHash, Literal(user_data['password_hash'])))
        g.add((user_uri, NS.role, Literal(user_data['role'])))
        g.add((user_uri, NS.createdAt, Literal(datetime.utcnow(), datatype=XSD.dateTime)))
        
        # Ici, vous devriez implémenter la sauvegarde dans le triple store
        # Pour l'instant, on retourne juste l'utilisateur créé
        return {
            'id': user_id,
            'username': user_data['username'],
            'email': user_data['email'],
            'role': user_data['role']
        }
    
    def get_user_by_email(self, email):
        query = """
        PREFIX ns: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
        SELECT ?user ?userId ?username ?passwordHash ?role ?createdAt WHERE {
            ?user ns:email "%s" ;
                  ns:userId ?userId ;
                  ns:username ?username ;
                  ns:passwordHash ?passwordHash ;
                  ns:role ?role ;
                  ns:createdAt ?createdAt .
        }
        """ % email
        
        # Exécuter la requête et retourner le premier résultat
        # Ici, vous devriez implémenter l'exécution de la requête SPARQL
        # Pour l'instant, on retourne None
        return None
    
    def update_password(self, user_id, new_password_hash):
        # Ici, vous devriez implémenter la mise à jour du mot de passe
        # dans le triple store
        return True
        
    def count_users(self, active=False):
        """
        Compte le nombre total d'utilisateurs
        Si active=True, ne compte que les utilisateurs actifs (email vérifié)
        """
        query = """
        PREFIX ns: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
        SELECT (COUNT(DISTINCT ?user) as ?count) WHERE {
            ?user a ns:User .
        """
        
        if active:
            query += """
            ?user ns:isEmailVerified "true"^^xsd:boolean .
            """
            
        query += "}"
        
        # Exécuter la requête et retourner le résultat
        # Pour l'instant, on retourne une valeur factice
        result = self.graph.query(query)
        for row in result:
            return int(row.count) if hasattr(row, 'count') else 0
        return 0
    
    def count_verified_users(self):
        """Compte le nombre d'utilisateurs avec email vérifié"""
        return self.count_users(active=True)
        
    def get_users_by_role(self, role=None):
        """
        Récupère la liste des utilisateurs, éventuellement filtrés par rôle
        """
        query = """
        PREFIX ns: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
        SELECT ?userId ?username ?email ?role ?createdAt WHERE {
            ?user a ns:User ;
                  ns:userId ?userId ;
                  ns:username ?username ;
                  ns:email ?email ;
                  ns:role ?role ;
                  ns:createdAt ?createdAt .
        """
        
        if role:
            query += f' FILTER (?role = "{role}")'
            
        query += "}"
        
        # Exécuter la requête et retourner les résultats
        # Pour l'instant, on retourne une liste vide
        users = []
        # result = self.graph.query(query)
        # for row in result:
        #     users.append({
        #         'id': str(row.userId),
        #         'username': str(row.username),
        #         'email': str(row.email),
        #         'role': str(row.role),
        #         'created_at': row.createdAt.toPython() if hasattr(row.createdAt, 'toPython') else None
        #     })
        return users
