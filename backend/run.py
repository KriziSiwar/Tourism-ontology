import os
from app import create_app
from app.config import config

# Créer l'application avec la configuration appropriée
app = create_app('development')

if __name__ == '__main__':
    # Créer le dossier d'uploads s'il n'existe pas
    upload_folder = app.config['UPLOAD_FOLDER']
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)
    
    # Lancer l'application
    app.run(host='127.0.0.1', port=5000, debug=True)