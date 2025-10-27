from SPARQLWrapper import SPARQLWrapper, JSON

SPARQL_ENDPOINT = "http://localhost:3030/novagrptourisme/sparql"

def get_hebergements():
    sparql = SPARQLWrapper(SPARQL_ENDPOINT)
    sparql.setQuery("""
        PREFIX novagrptourisme: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

        SELECT ?hebergement ?nom ?description ?prix
        WHERE {
            ?hebergement rdf:type/rdfs:subClassOf* novagrptourisme:Hébergement ;
                         novagrptourisme:nom ?nom ;
                         novagrptourisme:description ?description ;
                         novagrptourisme:prix ?prix .
        }
    """)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()
    return results["results"]["bindings"]
