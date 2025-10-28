import os
from flask import Flask
from flask_cors import CORS
from .fuseki_client import FusekiClient

def create_app(config_name='default'):
    # Création de l'application Flask
    app = Flask(__name__)
    
    # Chargement de la configuration
    from .config import config
    if config_name in config:
        app.config.from_object(config[config_name])
    else:
        app.config.from_object(config['default'])
    
    # Configuration CORS simplifiée
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
            "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
            "expose_headers": ["Content-Type", "X-Total-Count"],
            "supports_credentials": True,
            "max_age": 600  # Cache preflight request for 10 minutes
        }
    })
    
    # Configuration de Fuseki avec l'URL de la configuration
    app.fuseki = FusekiClient(app.config.get('FUSEKI_ENDPOINT'))
    
    # Création du dossier d'uploads s'il n'existe pas
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Route pour servir les fichiers uploadés
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        from flask import send_from_directory
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    
    # Enregistrement des blueprints
    try:
        from .apps.home.routes import home as home_blueprint
        app.register_blueprint(home_blueprint)
    except ImportError as e:
        app.logger.warning(f"Impossible de charger le blueprint home: {e}")
    
    try:
        from .apps.hebergement import hebergement_bp
        app.register_blueprint(hebergement_bp, url_prefix='/api')
    except ImportError as e:
        app.logger.error(f"Erreur critique: Impossible de charger le blueprint hébergement: {e}")
        raise
    
    try:
        from .apps.activite import activite_bp
        app.register_blueprint(activite_bp, url_prefix='/api')
    except ImportError as e:
        app.logger.warning(f"Impossible de charger le blueprint activité: {e}")
    
    # Route de test
    @app.route('/api/health')
    def health_check():
        return {'status': 'ok', 'message': 'API is running'}
    
    # Gestion des erreurs
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Not found'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f'500 Error: {error}')
        return {'error': 'Internal server error'}, 500
    
    return app