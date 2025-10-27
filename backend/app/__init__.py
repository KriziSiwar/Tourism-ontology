from flask import Flask, jsonify, current_app
from flask_cors import CORS
from flask_mail import Mail
from .fuseki_client import fuseki
from .models.user import User

# Initialisation des extensions
mail = Mail()

def create_app(config):
    app = Flask(__name__)
    
    # Charger la configuration
    app.config.from_object(config)
    
    # Configuration CORS
    CORS(app)
    
    # Initialisation de l'email
    mail.init_app(app)
    
    # Configuration de Fuseki
    app.fuseki = fuseki
    
    # Vérifier que la configuration SPARQL est définie
    if 'SPARQL_ENDPOINT' not in app.config or not app.config['SPARQL_ENDPOINT']:
        raise ValueError("La configuration SPARQL_ENDPOINT est requise")
    
    # Initialisation des modèles
    User.init_app(app)
    
    # Import des routes d'authentification
    from .auth import routes as auth_routes
    
    # Enregistrement des blueprints
    from .apps.home.routes import home as home_blueprint
    from .auth.routes import auth_bp as auth_blueprint
    
    app.register_blueprint(home_blueprint)
    app.register_blueprint(auth_blueprint, url_prefix='/api/auth')
    
    # Gestion des erreurs
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'message': 'Resource not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'message': 'Internal server error'}), 500
    
    return app