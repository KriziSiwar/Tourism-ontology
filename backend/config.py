import os

class Config:
    # Configuration de base
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-123'
    DEBUG = os.environ.get('FLASK_DEBUG') or True
    
    # Configuration de la base de données Fuseki
    FUSEKI_ENDPOINT = os.environ.get('FUSEKI_ENDPOINT', 'http://localhost:3030/novagrptourisme')
    
    # Dossier pour les téléchargements
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    
    # Autres configurations
    JSON_AS_ASCII = False  # Pour supporter les caractères spéciaux

# Configuration pour les différents environnements
class DevelopmentConfig(Config):
    DEBUG = True

class TestingConfig(Config):
    TESTING = True
    FUSEKI_ENDPOINT = 'http://localhost:3030/test'

class ProductionConfig(Config):
    DEBUG = False
    FUSEKI_ENDPOINT = os.environ.get('FUSEKI_ENDPOINT', 'http://fuseki:3030/novagrptourisme')

# Dictionnaire des configurations disponibles
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
