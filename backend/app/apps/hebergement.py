from flask import Blueprint, jsonify, request, current_app
from app.fuseki_client import fuseki
import logging
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

hebergement_bp = Blueprint('hebergement', __name__)

def safe_float(value_dict, default=0.0):
    if not value_dict or 'value' not in value_dict:
        return default
    try:
        return float(value_dict['value'])
    except (ValueError, TypeError):
        return default

def safe_int(value_dict, default=0):
    if not value_dict or 'value' not in value_dict:
        return default
    try:
        # D'abord convertir en float, puis en int pour gérer les chaînes comme '500.0'
        return int(float(value_dict['value']))
    except (ValueError, TypeError):
        return default

@hebergement_bp.route('/hebergements', methods=['GET'])
def get_hebergements():
    """Récupère tous les hébergements avec leurs détails et filtres optionnels"""
    try:
        # Configuration du logger
        logger = logging.getLogger(__name__)
        logger.info("Début de la récupération des hébergements")
        
        # Récupérer les paramètres de requête
        min_price = request.args.get('min_price', type=float)
        max_price = request.args.get('max_price', type=float)
        min_capacity = request.args.get('min_capacity', type=int)
        certifie = request.args.get('certifie', type=str)
        
        logger.info(f"Paramètres de requête - min_price: {min_price}, max_price: {max_price}, "
                   f"min_capacity: {min_capacity}, certifie: {certifie}")
        
        # Construire la requête SPARQL de base
        query = """
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        PREFIX ns1: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
        
        SELECT ?hebergement ?nom ?description ?prix ?capacite ?note ?certifie ?type
        WHERE {
            ?hebergement rdf:type/rdfs:subClassOf* ns1:Hébergement .
            ?hebergement ns1:nom ?nom .
            OPTIONAL { ?hebergement ns1:description ?description . }
            OPTIONAL { ?hebergement ns1:prix ?prix . }
            OPTIONAL { ?hebergement ns1:capacite ?capacite . }
            OPTIONAL { ?hebergement ns1:note ?note . }
            OPTIONAL { ?hebergement ns1:certifie ?certifie . }
            OPTIONAL { 
                ?hebergement rdf:type ?type .
                FILTER(?type != ns1:Hébergement && STRSTARTS(STR(?type), STR(ns1:)))
            }
        """
        
        # Ajouter les filtres si présents
        if min_price is not None:
            query += f" FILTER(xsd:decimal(?prix) >= {min_price})"
        if max_price is not None:
            query += f" FILTER(xsd:decimal(?prix) <= {max_price})"
        if min_capacity is not None:
            query += f" FILTER(xsd:integer(?capacite) >= {min_capacity})"
        if certifie and certifie.lower() == 'true':
            query += " FILTER(?certifie = true)"
        
        query += "} ORDER BY ASC(xsd:decimal(?prix))"
        
        logger.info(f"Requête SPARQL: {query}")
        
        # Exécution de la requête SPARQL
        try:
            response = fuseki.query(query)
            logger.info(f"Réponse de Fuseki: {response}")
            
            if not response:
                logger.warning("Aucune réponse de Fuseki")
                return jsonify([]), 200
            
            # Formater la réponse
            hebergements = []
            if 'results' in response and 'bindings' in response['results']:
                for result in response['results']['bindings']:
                    try:
                        hebergement = {
                            'id': result['hebergement']['value'].split('#')[-1],
                            'uri': result['hebergement']['value'],  # Ajout de l'URI complète
                            'nom': result['nom']['value'],
                            'description': result.get('description', {}).get('value', ''),
                            'prix': safe_float(result.get('prix')),
                            'capacite': safe_int(result.get('capacite')),
                            'note': safe_float(result.get('note')),
                            'certifie': result.get('certifie', {}).get('value', 'false').lower() == 'true',
                            'type': result.get('type', {}).get('value', '').split('#')[-1] if result.get('type') else 'HOTEL'
                        }
                        hebergements.append(hebergement)
                    except Exception as e:
                        logger.error(f"Erreur lors du formatage d'un hébergement: {str(e)}")
                        continue
            else:
                logger.warning("Aucun résultat trouvé dans la réponse de la requête SPARQL")
            
            logger.info(f"Nombre d'hébergements trouvés: {len(hebergements)}")
            return jsonify(hebergements), 200
            
        except Exception as e:
            logger.error(f"Erreur lors de l'exécution de la requête SPARQL: {str(e)}", exc_info=True)
            return jsonify({
                'success': False,
                'message': 'Erreur lors de la communication avec la base de données',
                'error': str(e)
            }), 500
        
    except Exception as e:
        logger.error(f"Erreur inattendue dans get_hebergements: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'message': 'Erreur inattendue lors de la récupération des hébergements',
            'error': str(e)
        }), 500

@hebergement_bp.route('/hebergements', methods=['POST'])
def add_hebergement():
    """Ajoute un nouvel hébergement"""
    try:
        data = request.json
        if not data:
            return jsonify({"error": "Aucune donnée fournie"}), 400
            
        # Génération d'un URI unique pour le nouvel hébergement
        hebergement_id = str(uuid.uuid4())
        hebergement_uri = f"http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#{hebergement_id}"
        
        # Construction de la requête SPARQL pour l'insertion
        query = f"""
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
            PREFIX ns1: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
            
            INSERT DATA {{
                <{hebergement_uri}> rdf:type ns1:Hébergement ;
                                   rdf:type ns1:{data.get('type', 'HOTEL')} ;
                                   ns1:nom "{data['nom']}" ;
                                   ns1:description "{data['description']}" ;
                                   ns1:prix {float(data['prix'])} ;
                                   ns1:capacite {int(data['capacite'])} ;
                                   ns1:note {float(data.get('note', 0))} ;
                                   ns1:certifie {"true" if data.get('certifie', False) else "false"} .
            }}
        """
        
        # Exécution de la requête SPARQL
        fuseki.update(query)
        
        return jsonify({"message": "Hébergement ajouté avec succès", "uri": hebergement_uri}), 201
        
    except Exception as e:
        logging.error(f"Erreur lors de l'ajout de l'hébergement: {str(e)}")
        return jsonify({"error": f"Erreur lors de l'ajout de l'hébergement: {str(e)}"}), 500

@hebergement_bp.route('/hebergements/<id>/images', methods=['POST'])
def upload_hebergement_image(id):
    """Télécharge une image pour un hébergement"""
    try:
        # Vérifier si un fichier est présent dans la requête
        if 'image' not in request.files:
            return jsonify({"error": "Aucun fichier fourni"}), 400
            
        file = request.files['image']
        
        # Vérifier si un fichier a été sélectionné
        if file.filename == '':
            return jsonify({"error": "Aucun fichier sélectionné"}), 400
            
        # Vérifier l'extension du fichier
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
        if '.' not in file.filename or file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
            return jsonify({"error": "Type de fichier non autorisé"}), 400
            
        # Générer un nom de fichier unique
        from werkzeug.utils import secure_filename
        import os
        
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        
        # Créer le dossier de destination s'il n'existe pas
        upload_folder = os.path.join(current_app.config['UPLOAD_FOLDER'], 'hebergements', id)
        os.makedirs(upload_folder, exist_ok=True)
        
        # Sauvegarder le fichier
        filepath = os.path.join(upload_folder, unique_filename)
        file.save(filepath)
        
        # Enregistrer les métadonnées de l'image dans la base de données
        image_uri = f"http://localhost:5000/uploads/hebergements/{id}/{unique_filename}"
        
        # Construire la requête SPARQL pour ajouter l'image
        query = f"""
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX ns1: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
            
            INSERT DATA {{
                <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#{id}> 
                    ns1:aPourImage "{image_uri}" .
            }}
        """
        
        # Exécuter la requête SPARQL
        response = fuseki.update(query)
        
        return jsonify({
            "id": str(uuid.uuid4()),
            "url": image_uri,
            "isMain": False
        }), 201
        
    except Exception as e:
        logger.error(f"Erreur lors du téléchargement de l'image: {str(e)}")
        return jsonify({"error": "Erreur lors du téléchargement de l'image"}), 500

@hebergement_bp.route('/hebergements/<id>', methods=['GET'])
def get_hebergement(id):
    """Récupère un hébergement par son ID"""
    try:
        logger.info(f"Récupération de l'hébergement avec l'ID: {id}")
        
        # Construction de la requête SPARQL pour récupérer un hébergement spécifique
        query = f"""
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX ns1: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
            
            SELECT ?hebergement ?nom ?description ?prix ?capacite ?note ?certifie ?type ?adresse
            WHERE {{
                BIND(IRI(CONCAT("http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#", "{id}")) AS ?hebergement_iri)
                
                ?hebergement_iri rdf:type/rdfs:subClassOf* ns1:Hébergement .
                ?hebergement_iri ns1:nom ?nom .
                
                # Récupération des propriétés optionnelles
                OPTIONAL {{ ?hebergement_iri ns1:description ?description . }}
                OPTIONAL {{ ?hebergement_iri ns1:prix ?prix . }}
                OPTIONAL {{ ?hebergement_iri ns1:capacite ?capacite . }}
                OPTIONAL {{ ?hebergement_iri ns1:note ?note . }}
                OPTIONAL {{ 
                    ?hebergement_iri ns1:certifie ?certifie_raw .
                    BIND(IF(?certifie_raw = "true" || ?certifie_raw = true, true, false) AS ?certifie)
                }}
                OPTIONAL {{ ?hebergement_iri ns1:adresse ?adresse . }}
                OPTIONAL {{ ?hebergement_iri rdf:type ?type . 
                           FILTER(?type != ns1:Hébergement && STRSTARTS(STR(?type), STR(ns1:)))
                }}
                
                # Utilisation de BIND pour assurer que les variables sont bien définies
                BIND(STR(?hebergement_iri) AS ?hebergement)
            }}
        """
        
        logger.info(f"Requête SPARQL: {query}")
        
        # Exécution de la requête SPARQL
        response = fuseki.query(query)
        
        if not response or 'results' not in response or 'bindings' not in response['results'] or not response['results']['bindings']:
            logger.warning(f"Aucun hébergement trouvé avec l'ID: {id}")
            return jsonify({"error": "Hébergement non trouvé"}), 404
            
        result = response['results']['bindings'][0]
        logger.info(f"Résultat de la requête: {result}")
        
        # Fonction utilitaire pour extraire les valeurs en toute sécurité
        def get_value(key, default=None, type_cast=str):
            if key in result and 'value' in result[key]:
                try:
                    return type_cast(result[key]['value'])
                except (ValueError, TypeError):
                    return default
            return default
        
        # Extraction des données avec des valeurs par défaut appropriées
        hebergement = {
            'id': id,
            'uri': get_value('hebergement'),
            'nom': get_value('nom', ''),
            'description': get_value('description', ''),
            'prix': get_value('prix', 0.0, float),
            'capacite': get_value('capacite', 0, int),
            'note': get_value('note', 0.0, float),
            'certifie': get_value('certifie', 'false').lower() == 'true',
            'adresse': get_value('adresse', ''),
            'type': get_value('type', '').split('#')[-1] if 'type' in result and 'value' in result['type'] else 'HOTEL'
        }
        
        logger.info(f"Données de l'hébergement formatées: {hebergement}")
        return jsonify(hebergement), 200
        
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de l'hébergement: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'Erreur lors de la récupération de l\'hébergement',
            'details': str(e)
        }), 500

@hebergement_bp.route('/hebergements/<id>', methods=['PUT'])
def update_hebergement(id):
    """Met à jour un hébergement existant"""
    try:
        if not request.is_json:
            logger.error("Le contenu de la requête n'est pas au format JSON")
            return jsonify({"error": "Le contenu doit être au format JSON"}), 400
            
        data = request.get_json()
        logger.info(f"Données reçues pour la mise à jour de l'hébergement {id}: {data}")
        
        # Vérification des champs obligatoires
        required_fields = ['nom', 'description', 'prix', 'capacite', 'adresse', 'type']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            error_msg = f"Champs manquants: {', '.join(missing_fields)}"
            logger.error(error_msg)
            return jsonify({"error": error_msg}), 400
        
        # Nettoyage et validation des données
        try:
            prix = float(data['prix'])
            capacite = int(data['capacite'])
            nom = str(data['nom']).strip()
            description = str(data['description']).strip()
            adresse = str(data['adresse']).strip()
            type_hebergement = str(data['type']).strip()
            
            if not nom:
                raise ValueError("Le nom ne peut pas être vide")
                
        except (ValueError, TypeError) as e:
            error_msg = f"Données invalides: {str(e)}"
            logger.error(error_msg)
            return jsonify({"error": error_msg}), 400
        
        try:
            # Construction de la requête SPARQL de mise à jour avec des paramètres sécurisés
            query = """
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                PREFIX ns1: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
                
                WITH <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
                DELETE {
                    ?hebergement ns1:nom ?old_nom ;
                                ns1:description ?old_desc ;
                                ns1:prix ?old_prix ;
                                ns1:capacite ?old_capacite ;
                                ns1:adresse ?old_adresse ;
                                rdf:type ?old_type .
                }
                INSERT {
                    ?hebergement ns1:nom ?nom ;
                                ns1:description ?description ;
                                ns1:prix ?prix ;
                                ns1:capacite ?capacite ;
                                ns1:adresse ?adresse ;
                                rdf:type ?type .
                }
                WHERE {
                    BIND(IRI(CONCAT(STR(ns1), ?hebergement_id)) AS ?hebergement)
                    
                    OPTIONAL { ?hebergement ns1:nom ?old_nom . }
                    OPTIONAL { ?hebergement ns1:description ?old_desc . }
                    OPTIONAL { ?hebergement ns1:prix ?old_prix . }
                    OPTIONAL { ?hebergement ns1:capacite ?old_capacite . }
                    OPTIONAL { ?hebergement ns1:adresse ?old_adresse . }
                    OPTIONAL { ?hebergement rdf:type ?old_type . 
                               FILTER(STRSTARTS(STR(?old_type), STR(ns1:))) }
                }
            """
            
            # Paramètres pour la requête préparée
            params = {
                'hebergement_id': id,
                'nom': nom,
                'description': description,
                'prix': prix,
                'capacite': capacite,
                'adresse': adresse,
                'type': f'ns1:{type_hebergement}'
            }
            
            logger.info(f"Exécution de la requête SPARQL avec les paramètres: {params}")
            
            # Exécution de la requête de mise à jour avec les paramètres
            response = fuseki.update(query, params=params)
            
            if response.status_code == 200:
                logger.info(f"Hébergement {id} mis à jour avec succès")
                return jsonify({
                    "message": "Hébergement mis à jour avec succès",
                    "id": id,
                    "uri": f"http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#{id}"
                }), 200
            else:
                error_msg = f"Erreur SPARQL: {response.status_code} - {response.text}"
                logger.error(error_msg)
                return jsonify({
                    "error": "Erreur lors de la mise à jour de l'hébergement dans la base de données",
                    "details": response.text
                }), 500
                
        except Exception as e:
            error_msg = f"Erreur lors de l'exécution de la requête SPARQL: {str(e)}"
            logger.error(error_msg, exc_info=True)
            return jsonify({
                "error": "Erreur technique lors de la mise à jour de l'hébergement",
                "details": str(e)
            }), 500
            
    except Exception as e:
        error_msg = f"Erreur inattendue lors de la mise à jour de l'hébergement: {str(e)}"
        logger.error(error_msg, exc_info=True)
        return jsonify({
            "error": "Une erreur inattendue s'est produite",
            "details": str(e)
        }), 500

@hebergement_bp.route('/hebergements', methods=['DELETE'])
def delete_hebergement():
    """Supprime un hébergement par son URI"""
    try:
        data = request.get_json()
        uri = data.get('uri')
        
        if not uri:
            return jsonify({"error": "L'URI de l'hébergement est requise"}), 400
            
        # Construction de la requête SPARQL de suppression
        query = f"""
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX ns1: <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
            
            WITH <http://www.semanticweb.org/user/ontologies/2025/9/novagrptourisme#>
            DELETE {{ ?s ?p ?o }}
            WHERE {{
                BIND(<{uri}> as ?s)
                ?s ?p ?o .
            }}
        """
        
        # Exécution de la requête de suppression
        response = fuseki.update(query)
        
        if response.status_code == 200:
            return jsonify({"message": "Hébergement supprimé avec succès"}), 200
        else:
            return jsonify({"error": "Erreur lors de la suppression de l'hébergement"}), 500
            
    except Exception as e:
        logging.error(f"Erreur lors de la suppression de l'hébergement: {str(e)}")
        return jsonify({"error": f"Erreur lors de la suppression de l'hébergement: {str(e)}"}), 500