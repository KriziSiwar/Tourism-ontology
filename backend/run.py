import os
from dotenv import load_dotenv
from flask import jsonify
from app import create_app
from config import config

# Charger les variables d'environnement depuis .env
load_dotenv()

# Créer l'application avec la configuration appropriée
app = create_app(config['development'])

# Afficher la configuration (pour le débogage)
print("Configuration chargée:")
print(f"- SPARQL_ENDPOINT: {app.config.get('SPARQL_ENDPOINT')}")
print(f"- SECRET_KEY: {'*' * 10}{app.config['SECRET_KEY'][-4:] if app.config.get('SECRET_KEY') else 'non défini'}")
print(f"- UPLOAD_FOLDER: {app.config.get('UPLOAD_FOLDER')}")

@app.route('/api/test')
def test():
    return jsonify({"message": "Le serveur principal fonctionne !"})

if __name__ == '__main__':
    # Créer le dossier d'uploads s'il n'existe pas
    upload_folder = app.config.get('UPLOAD_FOLDER', './uploads')
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)
    
    # Lancer l'application
    app.run(host='127.0.0.1', port=5000, debug=True)