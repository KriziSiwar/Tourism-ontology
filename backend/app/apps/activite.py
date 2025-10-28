from flask import Blueprint, jsonify, request
from ..fuseki_client import fuseki
import uuid
import logging

activite_bp = Blueprint('activite', __name__)

@activite_bp.route('/activites', methods=['GET'])
def get_activites():
    """Récupère toutes les activités avec leurs détails"""
    try:
        query = """
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        PREFIX ns1: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
        
        SELECT ?activite ?nom ?description ?prix ?capacite ?note ?dateDebut ?dateFin ?impactCarbone
        WHERE {
            ?activite rdf:type ns1:Activite .
            ?activite ns1:nom ?nom .
            OPTIONAL { ?activite ns1:description ?description . }
            OPTIONAL { ?activite ns1:prix ?prix . }
            OPTIONAL { ?activite ns1:capacite ?capacite . }
            OPTIONAL { ?activite ns1:note ?note . }
            OPTIONAL { ?activite ns1:dateDebut ?dateDebut . }
            OPTIONAL { ?activite ns1:dateFin ?dateFin . }
            OPTIONAL { ?activite ns1:impactCarbone ?impactCarbone . }
        }
        """
        
        # Exécution de la requête
        response = fuseki.query(query)
        
        # Vérification de la réponse
        if not response or 'results' not in response or 'bindings' not in response['results']:
            return jsonify([]), 200
        
        # Traitement des résultats
        activites = []
        for result in response['results']['bindings']:
            try:
                activite = {
                    'id': result.get('activite', {}).get('value', '').split('#')[-1],
                    'nom': result.get('nom', {}).get('value', 'Sans nom'),
                    'description': result.get('description', {}).get('value', ''),
                    'prix': float(result.get('prix', {}).get('value', 0)) if result.get('prix') else 0,
                    'capacite': int(float(result.get('capacite', {}).get('value', 0))) if result.get('capacite') else 0,
                    'note': float(result.get('note', {}).get('value', 0)) if result.get('note') else 0,
                    'dateDebut': result.get('dateDebut', {}).get('value', ''),
                    'dateFin': result.get('dateFin', {}).get('value', ''),
                    'impactCarbone': str(result.get('impactCarbone', {}).get('value', ''))
                }
                activites.append(activite)
            except Exception as e:
                logging.error(f"Erreur lors du traitement d'une activité: {str(e)}")
                continue
        
        return jsonify(activites), 200
        
    except Exception as e:
        logging.error(f"Erreur lors de la récupération des activités: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'Erreur lors de la récupération des activités',
            'details': str(e)
        }), 500

@activite_bp.route('/activites', methods=['POST'])
def add_activite():
    """Ajoute une nouvelle activité"""
    try:
        data = request.get_json()
        
        # Validation des données
        required_fields = ['nom', 'description', 'prix', 'dateDebut', 'dateFin', 'capacite', 'impactCarbone']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Tous les champs sont obligatoires"}), 400
        
        # Création de l'URI pour la nouvelle activité
        activite_uri = f"http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#activite_{str(uuid.uuid4())[:8]}"
        
        # Construction de la requête SPARQL
        query = f"""
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX ns1: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
            PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
            
            INSERT DATA {{
                <{activite_uri}> rdf:type ns1:Activite ;
                               ns1:nom "{data['nom']}" ;
                               ns1:description "{data['description']}" ;
                               ns1:prix {float(data['prix'])} ;
                               ns1:dateDebut "{data['dateDebut']}"^^xsd:dateTime ;
                               ns1:dateFin "{data['dateFin']}"^^xsd:dateTime ;
                               ns1:capacite {int(data['capacite'])} ;
                               ns1:impactCarbone "{data['impactCarbone']}" .
            }}
        """
        
        # Exécution de la requête SPARQL
        fuseki.update(query)
        
        return jsonify({"message": "Activité ajoutée avec succès", "uri": activite_uri}), 201
        
    except Exception as e:
        logging.error(f"Erreur lors de l'ajout de l'activité: {str(e)}")
        return jsonify({"error": f"Erreur lors de l'ajout de l'activité: {str(e)}"}), 500

@activite_bp.route('/activites', methods=['DELETE'])
def delete_activite():
    """Supprime une activité"""
    try:
        data = request.get_json()
        activite_uri = data.get('activite_uri')
        
        if not activite_uri:
            return jsonify({"error": "L'URI de l'activité est requise"}), 400
        
        # Construction de la requête SPARQL
        query = f"""
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX ns1: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
            
            DELETE WHERE {{
                <{activite_uri}> ?p ?o .
            }}
        """
        
        # Exécution de la requête SPARQL
        fuseki.update(query)
        
        return jsonify({"message": "Activité supprimée avec succès"}), 200
        
    except Exception as e:
        logging.error(f"Erreur lors de la suppression de l'activité: {str(e)}")
        return jsonify({"error": f"Erreur lors de la suppression de l'activité: {str(e)}"}), 500