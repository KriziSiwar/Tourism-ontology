from flask import Flask, request, jsonify
from flask_cors import CORS
from SPARQLWrapper import SPARQLWrapper, JSON

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Fuseki endpoints
FUSEKI_QUERY_URL = "http://localhost:3030/novagrptourisme/query"
FUSEKI_UPDATE_URL = "http://localhost:3030/novagrptourisme/update"

def query_sparql(query):
    sparql = SPARQLWrapper(FUSEKI_QUERY_URL)
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    try:
        results = sparql.query().convert()
        return results
    except Exception as e:
        print(f"SPARQL Query Error: {e}")
        return {"results": {"bindings": []}}

def update_sparql(update_query):
    sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
    sparql.setMethod('POST')
    sparql.setQuery(update_query)
    try:
        sparql.query()
        return True
    except Exception as e:
        print(f"SPARQL Update Error: {e}")
        return False
# Routes for CRUD operations

@app.route('/api/users', methods=['GET'])
def get_users():
    query = """
    PREFIX novagrptourisme: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
    SELECT ?user ?nom ?age
    WHERE {
        ?user a novagrptourisme:User .
        ?user novagrptourisme:nom ?nom .
        OPTIONAL { ?user novagrptourisme:age ?age }
    }
    """
    results = query_sparql(query)
    return jsonify(results)

@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.json
    user_id = data.get('id', data['nom'].replace(" ", "_"))
    user_uri = f"http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#{user_id}"
    update_query = f"""
    PREFIX novagrptourisme: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
    INSERT DATA {{
        <{user_uri}> a novagrptourisme:User ;
                     novagrptourisme:nom "{data['nom']}" ;
                     novagrptourisme:age {data['age']} .
    }}
    """
    success = update_sparql(update_query)
    return jsonify({"success": success})

@app.route('/api/users/<id>', methods=['PUT'])
def update_user(id):
    data = request.json
    user_uri = f"http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#{id}"
    update_query = f"""
    PREFIX novagrptourisme: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
    DELETE {{
        <{user_uri}> novagrptourisme:nom ?nom ;
                     novagrptourisme:age ?age .
    }}
    INSERT {{
        <{user_uri}> novagrptourisme:nom "{data['nom']}" ;
                     novagrptourisme:age {data['age']} .
    }}
    WHERE {{
        <{user_uri}> novagrptourisme:nom ?nom .
        OPTIONAL {{ <{user_uri}> novagrptourisme:age ?age }}
    }}
    """
    success = update_sparql(update_query)
    return jsonify({"success": success})

@app.route('/api/users/<id>', methods=['DELETE'])
def delete_user(id):
    user_uri = f"http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#{id}"
    update_query = f"""
    PREFIX novagrptourisme: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
    DELETE WHERE {{
        <{user_uri}> ?p ?o .
    }}
    """
    success = update_sparql(update_query)
    return jsonify({"success": success})

@app.route('/api/destinations', methods=['GET'])
def get_destinations():
    query = """
    PREFIX novagrptourisme: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
    SELECT ?dest ?nom ?localisation
    WHERE {
        ?dest a novagrptourisme:Destination .
        ?dest novagrptourisme:nom ?nom .
        OPTIONAL { ?dest novagrptourisme:localisation ?localisation }
    }
    """
    results = query_sparql(query)
    return jsonify(results)

@app.route('/api/destinations', methods=['POST'])
def create_destination():
    data = request.json
    dest_id = data.get('id', data['nom'].replace(" ", "_"))
    dest_uri = f"http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#{dest_id}"

    update_query = f"""
    PREFIX novagrptourisme: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
    INSERT DATA {{
        <{dest_uri}> a novagrptourisme:Destination ;
                     novagrptourisme:nom "{data['nom']}" ;
                     novagrptourisme:localisation "{data['localisation']}" .
    }}
    """
    success = update_sparql(update_query)
    return jsonify({"success": success})

@app.route('/api/destinations/<id>', methods=['PUT'])
def update_destination(id):
    data = request.json
    dest_uri = f"http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#{id}"
    update_query = f"""
    PREFIX novagrptourisme: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
    DELETE {{
        <{dest_uri}> novagrptourisme:nom ?nom ;
                     novagrptourisme:localisation ?loc .
    }}
    INSERT {{
        <{dest_uri}> novagrptourisme:nom "{data['nom']}" ;
                     novagrptourisme:localisation "{data['localisation']}" .
    }}
    WHERE {{
        <{dest_uri}> novagrptourisme:nom ?nom .
        OPTIONAL {{ <{dest_uri}> novagrptourisme:localisation ?loc }}
    }}
    """
    success = update_sparql(update_query)
    return jsonify({"success": success})

@app.route('/api/destinations/<id>', methods=['DELETE'])
def delete_destination(id):
    dest_uri = f"http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#{id}"
    update_query = f"""
    PREFIX novagrptourisme: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
    DELETE WHERE {{
        <{dest_uri}> ?p ?o .
    }}
    """
    success = update_sparql(update_query)
    return jsonify({"success": success})

@app.route('/api/hebergements', methods=['GET'])
def get_hebergements():
    query = """
    PREFIX novagrptourisme: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
    SELECT ?heb ?nom ?prix ?capacite
    WHERE {
        ?heb a novagrptourisme:Hébergement .
        ?heb novagrptourisme:nom ?nom .
        OPTIONAL { ?heb novagrptourisme:prix ?prix }
        OPTIONAL { ?heb novagrptourisme:capacite ?capacite }
    }
    """
    results = query_sparql(query)
    return jsonify(results)

@app.route('/api/hebergements', methods=['POST'])
def create_hebergement():
    data = request.json
    heb_id = data.get('id', data['nom'].replace(" ", "_"))
    heb_uri = f"http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#{heb_id}"

    update_query = f"""
    PREFIX novagrptourisme: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
    INSERT DATA {{
        <{heb_uri}> a novagrptourisme:Hébergement ;
                     novagrptourisme:nom "{data['nom']}" ;
                     novagrptourisme:prix {data['prix']} ;
                     novagrptourisme:capacite {data['capacite']} .
    }}
    """
    success = update_sparql(update_query)
    return jsonify({"success": success})

@app.route('/api/hebergements/<id>', methods=['PUT'])
def update_hebergement(id):
    data = request.json
    heb_uri = f"http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#{id}"
    update_query = f"""
    PREFIX novagrptourisme: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
    DELETE {{
        <{heb_uri}> novagrptourisme:nom ?nom ;
                     novagrptourisme:prix ?prix ;
                     novagrptourisme:capacite ?cap .
    }}
    INSERT {{
        <{heb_uri}> novagrptourisme:nom "{data['nom']}" ;
                     novagrptourisme:prix {data['prix']} ;
                     novagrptourisme:capacite {data['capacite']} .
    }}
    WHERE {{
        <{heb_uri}> novagrptourisme:nom ?nom .
        OPTIONAL {{ <{heb_uri}> novagrptourisme:prix ?prix }}
        OPTIONAL {{ <{heb_uri}> novagrptourisme:capacite ?cap }}
    }}
    """
    success = update_sparql(update_query)
    return jsonify({"success": success})

@app.route('/api/hebergements/<id>', methods=['DELETE'])
def delete_hebergement(id):
    heb_uri = f"http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#{id}"
    update_query = f"""
    PREFIX novagrptourisme: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
    DELETE WHERE {{
        <{heb_uri}> ?p ?o .
    }}
    """
    success = update_sparql(update_query)
    return jsonify({"success": success})

@app.route('/api/activites', methods=['GET'])
def get_activites():
    query = """
    PREFIX novagrptourisme: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
    SELECT ?act ?nom ?description ?prix ?capacite ?dateDebut ?dateFin
    WHERE {
        ?act a novagrptourisme:Activite .
        ?act novagrptourisme:nom ?nom .
        OPTIONAL { ?act novagrptourisme:description ?description }
        OPTIONAL { ?act novagrptourisme:prix ?prix }
        OPTIONAL { ?act novagrptourisme:capacite ?capacite }
        OPTIONAL { ?act novagrptourisme:dateDebut ?dateDebut }
        OPTIONAL { ?act novagrptourisme:dateFin ?dateFin }
    }
    """
    results = query_sparql(query)
    return jsonify(results)

@app.route('/api/activites', methods=['POST'])
def create_activite():
    data = request.json
    act_id = data.get('id', data['nom'].replace(" ", "_"))
    act_uri = f"http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#{act_id}"
    update_query = f"""
    PREFIX novagrptourisme: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
    INSERT DATA {{
        <{act_uri}> a novagrptourisme:Activite ;
                     novagrptourisme:nom "{data['nom']}" ;
                     novagrptourisme:description "{data.get('description', '')}" ;
                     novagrptourisme:prix {data.get('prix', 0)} ;
                     novagrptourisme:capacite {data.get('capacite', 1)} .
    }}
    """
    success = update_sparql(update_query)
    return jsonify({"success": success})

@app.route('/api/activites/<id>', methods=['PUT'])
def update_activite(id):
    data = request.json
    act_uri = f"http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#{id}"
    update_query = f"""
    PREFIX novagrptourisme: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
    DELETE {{
        <{act_uri}> novagrptourisme:nom ?nom ;
                     novagrptourisme:description ?desc ;
                     novagrptourisme:prix ?prix ;
                     novagrptourisme:capacite ?cap .
    }}
    INSERT {{
        <{act_uri}> novagrptourisme:nom "{data['nom']}" ;
                     novagrptourisme:description "{data.get('description', '')}" ;
                     novagrptourisme:prix {data.get('prix', 0)} ;
                     novagrptourisme:capacite {data.get('capacite', 1)} .
    }}
    WHERE {{
        <{act_uri}> novagrptourisme:nom ?nom .
        OPTIONAL {{ <{act_uri}> novagrptourisme:description ?desc }}
        OPTIONAL {{ <{act_uri}> novagrptourisme:prix ?prix }}
        OPTIONAL {{ <{act_uri}> novagrptourisme:capacite ?cap }}
    }}
    """
    success = update_sparql(update_query)
    return jsonify({"success": success})

@app.route('/api/activites/<id>', methods=['DELETE'])
def delete_activite(id):
    act_uri = f"http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#{id}"
    update_query = f"""
    PREFIX novagrptourisme: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
    DELETE WHERE {{
        <{act_uri}> ?p ?o .
    }}
    """
    success = update_sparql(update_query)
    return jsonify({"success": success})

@app.route('/api/restaurants', methods=['GET'])
def get_restaurants():
    query = """
    PREFIX novagrptourisme: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
    SELECT ?rest ?nom ?description ?contact ?note
    WHERE {
        ?rest a novagrptourisme:Restaurant .
        ?rest novagrptourisme:nom ?nom .
        OPTIONAL { ?rest novagrptourisme:description ?description }
        OPTIONAL { ?rest novagrptourisme:contact ?contact }
        OPTIONAL { ?rest novagrptourisme:note ?note }
    }
    """
    results = query_sparql(query)
    return jsonify(results)

@app.route('/api/restaurants', methods=['POST'])
def create_restaurant():
    data = request.json
    rest_id = data.get('id', data['nom'].replace(" ", "_"))
    rest_uri = f"http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#{rest_id}"
    update_query = f"""
    PREFIX novagrptourisme: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
    INSERT DATA {{
        <{rest_uri}> a novagrptourisme:Restaurant ;
                     novagrptourisme:nom "{data['nom']}" ;
                     novagrptourisme:description "{data.get('description', '')}" ;
                     novagrptourisme:contact "{data.get('contact', '')}" .
    }}
    """
    success = update_sparql(update_query)
    return jsonify({"success": success})

@app.route('/api/restaurants/<id>', methods=['PUT'])
def update_restaurant(id):
    data = request.json
    rest_uri = f"http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#{id}"
    update_query = f"""
    PREFIX novagrptourisme: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
    DELETE {{
        <{rest_uri}> novagrptourisme:nom ?nom ;
                     novagrptourisme:description ?desc ;
                     novagrptourisme:contact ?contact .
    }}
    INSERT {{
        <{rest_uri}> novagrptourisme:nom "{data['nom']}" ;
                     novagrptourisme:description "{data.get('description', '')}" ;
                     novagrptourisme:contact "{data.get('contact', '')}" .
    }}
    WHERE {{
        <{rest_uri}> novagrptourisme:nom ?nom .
        OPTIONAL {{ <{rest_uri}> novagrptourisme:description ?desc }}
        OPTIONAL {{ <{rest_uri}> novagrptourisme:contact ?contact }}
    }}
    """
    success = update_sparql(update_query)
    return jsonify({"success": success})

@app.route('/api/restaurants/<id>', methods=['DELETE'])
def delete_restaurant(id):
    rest_uri = f"http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#{id}"
    update_query = f"""
    PREFIX novagrptourisme: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
    DELETE WHERE {{
        <{rest_uri}> ?p ?o .
    }}
    """
    success = update_sparql(update_query)
    return jsonify({"success": success})

@app.route('/api/transports', methods=['GET'])
def get_transports():
    query = """
    PREFIX novagrptourisme: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
    SELECT ?trans ?nom ?prix ?capacite ?description
    WHERE {
        ?trans a novagrptourisme:Transport .
        ?trans novagrptourisme:nom ?nom .
        OPTIONAL { ?trans novagrptourisme:prix ?prix }
        OPTIONAL { ?trans novagrptourisme:capacite ?capacite }
        OPTIONAL { ?trans novagrptourisme:description ?description }
    }
    """
    results = query_sparql(query)
    return jsonify(results)

@app.route('/api/transports', methods=['POST'])
def create_transport():
    data = request.json
    trans_id = data.get('id', data['nom'].replace(" ", "_"))
    trans_uri = f"http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#{trans_id}"
    update_query = f"""
    PREFIX novagrptourisme: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
    INSERT DATA {{
        <{trans_uri}> a novagrptourisme:Transport ;
                     novagrptourisme:nom "{data['nom']}" ;
                     novagrptourisme:prix {data.get('prix', 0)} ;
                     novagrptourisme:capacite {data.get('capacite', 1)} ;
                     novagrptourisme:description "{data.get('description', '')}" .
    }}
    """
    success = update_sparql(update_query)
    return jsonify({"success": success})

@app.route('/api/transports/<id>', methods=['PUT'])
def update_transport(id):
    data = request.json
    trans_uri = f"http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#{id}"
    update_query = f"""
    PREFIX novagrptourisme: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
    DELETE {{
        <{trans_uri}> novagrptourisme:nom ?nom ;
                     novagrptourisme:prix ?prix ;
                     novagrptourisme:capacite ?cap ;
                     novagrptourisme:description ?desc .
    }}
    INSERT {{
        <{trans_uri}> novagrptourisme:nom "{data['nom']}" ;
                     novagrptourisme:prix {data.get('prix', 0)} ;
                     novagrptourisme:capacite {data.get('capacite', 1)} ;
                     novagrptourisme:description "{data.get('description', '')}" .
    }}
    WHERE {{
        <{trans_uri}> novagrptourisme:nom ?nom .
        OPTIONAL {{ <{trans_uri}> novagrptourisme:prix ?prix }}
        OPTIONAL {{ <{trans_uri}> novagrptourisme:capacite ?cap }}
        OPTIONAL {{ <{trans_uri}> novagrptourisme:description ?desc }}
    }}
    """
    success = update_sparql(update_query)
    return jsonify({"success": success})

@app.route('/api/transports/<id>', methods=['DELETE'])
def delete_transport(id):
    trans_uri = f"http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#{id}"
    update_query = f"""
    PREFIX novagrptourisme: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
    DELETE WHERE {{
        <{trans_uri}> ?p ?o .
    }}
    """
    success = update_sparql(update_query)
    return jsonify({"success": success})

@app.route('/api/evenements', methods=['GET'])
def get_evenements():
    query = """
    PREFIX novagrptourisme: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
    SELECT ?event ?nom ?dateDebut ?dateFin ?capacite ?description
    WHERE {
        ?event a novagrptourisme:Événement .
        ?event novagrptourisme:nom ?nom .
        OPTIONAL { ?event novagrptourisme:dateDebut ?dateDebut }
        OPTIONAL { ?event novagrptourisme:dateFin ?dateFin }
        OPTIONAL { ?event novagrptourisme:capacite ?capacite }
        OPTIONAL { ?event novagrptourisme:description ?description }
    }
    """
    results = query_sparql(query)
    return jsonify(results)

@app.route('/api/evenements', methods=['POST'])
def create_evenement():
    data = request.json
    event_id = data.get('id', data['nom'].replace(" ", "_"))
    event_uri = f"http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#{event_id}"
    update_query = f"""
    PREFIX novagrptourisme: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
    INSERT DATA {{
        <{event_uri}> a novagrptourisme:Événement ;
                     novagrptourisme:nom "{data['nom']}" ;
                     novagrptourisme:dateDebut "{data.get('dateDebut', '')}"^^xsd:dateTime ;
                     novagrptourisme:dateFin "{data.get('dateFin', '')}"^^xsd:dateTime ;
                     novagrptourisme:capacite {data.get('capacite', 1)} ;
                     novagrptourisme:description "{data.get('description', '')}" .
    }}
    """
    success = update_sparql(update_query)
    return jsonify({"success": success})

@app.route('/api/evenements/<id>', methods=['PUT'])
def update_evenement(id):
    data = request.json
    event_uri = f"http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#{id}"
    update_query = f"""
    PREFIX novagrptourisme: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
    DELETE {{
        <{event_uri}> novagrptourisme:nom ?nom ;
                     novagrptourisme:dateDebut ?dateDebut ;
                     novagrptourisme:dateFin ?dateFin ;
                     novagrptourisme:capacite ?cap ;
                     novagrptourisme:description ?desc .
    }}
    INSERT {{
        <{event_uri}> novagrptourisme:nom "{data['nom']}" ;
                     novagrptourisme:dateDebut "{data.get('dateDebut', '')}"^^xsd:dateTime ;
                     novagrptourisme:dateFin "{data.get('dateFin', '')}"^^xsd:dateTime ;
                     novagrptourisme:capacite {data.get('capacite', 1)} ;
                     novagrptourisme:description "{data.get('description', '')}" .
    }}
    WHERE {{
        <{event_uri}> novagrptourisme:nom ?nom .
        OPTIONAL {{ <{event_uri}> novagrptourisme:dateDebut ?dateDebut }}
        OPTIONAL {{ <{event_uri}> novagrptourisme:dateFin ?dateFin }}
        OPTIONAL {{ <{event_uri}> novagrptourisme:capacite ?cap }}
        OPTIONAL {{ <{event_uri}> novagrptourisme:description ?desc }}
    }}
    """
    success = update_sparql(update_query)
    return jsonify({"success": success})

@app.route('/api/evenements/<id>', methods=['DELETE'])
def delete_evenement(id):
    event_uri = f"http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#{id}"
    update_query = f"""
    PREFIX novagrptourisme: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
    DELETE WHERE {{
        <{event_uri}> ?p ?o .
    }}
    """
    success = update_sparql(update_query)
    return jsonify({"success": success})

if __name__ == '__main__':
    app.run(debug=True)