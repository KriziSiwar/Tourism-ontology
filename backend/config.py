import os
from datetime import timedelta
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

class Config:
    # Configuration de base
    DEBUG = os.getenv('FLASK_DEBUG', 'true').lower() in ['true', '1', 't', 'y', 'yes']
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-key-change-in-production')
    
    # Configuration de JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # Configuration de la base de données SPARQL
    SPARQL_ENDPOINT = os.getenv('SPARQL_ENDPOINT', 'http://localhost:3030/novagrptourisme/sparql')
    
    # Configuration CORS
    CORS_HEADERS = 'Content-Type'
    
    # Configuration de l'upload
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', './uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    
    # Configuration de l'email
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'true').lower() in ['true', 'on', '1']
    MAIL_USERNAME = os.getenv('MAIL_USERNAME', '')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD', '')
    MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER', 'noreply@example.com')

# Configuration pour l'environnement de développement
class DevelopmentConfig(Config):
    DEBUG = True

# Configuration pour l'environnement de production
class ProductionConfig(Config):
    DEBUG = False
    SECRET_KEY = os.getenv('SECRET_KEY')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')

# Configuration pour les tests
class TestingConfig(Config):
    TESTING = True
    SPARQL_ENDPOINT = os.getenv('TEST_SPARQL_ENDPOINT', 'http://localhost:3030/test/sparql')

# Dictionnaire des configurations disponibles
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
