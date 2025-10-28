from SPARQLWrapper import SPARQLWrapper, JSON, POST, DIGEST
import uuid

SPARQL_ENDPOINT = "http://localhost:3030/novagrptourisme"
SPARQL_UPDATE_ENDPOINT = f"{SPARQL_ENDPOINT}/update"
SPARQL_QUERY_ENDPOINT = f"{SPARQL_ENDPOINT}/sparql"

def get_sparql():
    sparql = SPARQLWrapper(SPARQL_QUERY_ENDPOINT)
    sparql.setReturnFormat(JSON)
    return sparql

def get_sparql_update():
    sparql = SPARQLWrapper(SPARQL_UPDATE_ENDPOINT)
    sparql.setMethod(POST)
    return sparql

def get_hebergements():
    sparql = get_sparql()
    sparql.setQuery("""
        PREFIX novagrptourisme: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

        SELECT ?hebergement ?nom ?description ?prix ?capacite ?type
        WHERE {
            ?hebergement rdf:type/rdfs:subClassOf* novagrptourisme:Hébergement ;
                         novagrptourisme:nom ?nom ;
                         novagrptourisme:description ?description ;
                         novagrptourisme:prix ?prix ;
                         novagrptourisme:capacite ?capacite .
            BIND(IF(EXISTS {?hebergement rdf:type novagrptourisme:Hotel}, "Hôtel", 
                 IF(EXISTS {?hebergement rdf:type novagrptourisme:MaisonHote}, "Maison d'hôte", 
                 "Autre")) as ?type)
        }
    """)
    results = sparql.query().convert()
    return results["results"]["bindings"]

def get_activites():
    sparql = get_sparql()
    sparql.setQuery("""
        PREFIX novagrptourisme: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

        SELECT ?activite ?nom ?description ?prix ?dateDebut ?dateFin ?capacite ?impactCarbone
        WHERE {
            ?activite rdf:type novagrptourisme:Activite ;
                     novagrptourisme:nom ?nom ;
                     novagrptourisme:description ?description ;
                     novagrptourisme:prix ?prix ;
                     novagrptourisme:dateDebut ?dateDebut ;
                     novagrptourisme:dateFin ?dateFin ;
                     novagrptourisme:capacite ?capacite ;
                     novagrptourisme:impactCarbone ?impactCarbone .
        }
        ORDER BY ?dateDebut
    """)
    results = sparql.query().convert()
    return results["results"]["bindings"]

def add_hebergement(nom, description, prix, capacite, type_hebergement):
    sparql = get_sparql_update()
    hebergement_uri = f"http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#{type_hebergement.lower()}_{str(uuid.uuid4())[:8]}"
    type_uri = f"novagrptourisme:{type_hebergement}"
    
    query = f"""
        PREFIX novagrptourisme: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

        INSERT DATA {{
            {hebergement_uri} rdf:type {type_uri} ;
                            rdf:type novagrptourisme:Hébergement ;
                            novagrptourisme:nom "{nom}" ;
                            novagrptourisme:description "{description}" ;
                            novagrptourisme:prix {prix} ;
                            novagrptourisme:capacite {capacite} .
        }}
    """
    sparql.setQuery(query)
    sparql.method = 'POST'
    return sparql.query().convert()

def add_activite(nom, description, prix, date_debut, date_fin, capacite, impact_carbone):
    sparql = get_sparql_update()
    activite_uri = f"http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#activite_{str(uuid.uuid4())[:8]}"
    
    query = f"""
        PREFIX novagrptourisme: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

        INSERT DATA {{
            {activite_uri} rdf:type novagrptourisme:Activite ;
                         novagrptourisme:nom "{nom}" ;
                         novagrptourisme:description "{description}" ;
                         novagrptourisme:prix {prix} ;
                         novagrptourisme:dateDebut "{date_debut}"^^xsd:dateTime ;
                         novagrptourisme:dateFin "{date_fin}"^^xsd:dateTime ;
                         novagrptourisme:capacite {capacite} ;
                         novagrptourisme:impactCarbone "{impact_carbone}" .
        }}
    """
    sparql.setQuery(query)
    sparql.method = 'POST'
    return sparql.query().convert()

def delete_hebergement(hebergement_uri):
    sparql = get_sparql_update()
    query = f"""
        PREFIX novagrptourisme: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
        
        DELETE WHERE {{
            <{hebergement_uri}> ?p ?o .
        }}
    """
    sparql.setQuery(query)
    return sparql.query().convert()

def delete_activite(activite_uri):
    sparql = get_sparql_update()
    query = f"""
        PREFIX novagrptourisme: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
        
        DELETE WHERE {{
            <{activite_uri}> ?p ?o .
        }}
    """
    sparql.setQuery(query)
    return sparql.query().convert()
