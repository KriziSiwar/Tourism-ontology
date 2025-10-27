import os
import sys
import argparse
from werkzeug.security import generate_password_hash
from app import create_app
from app.models.user import User
from config import DevelopmentConfig

def create_admin_user(email, password, username):
    app = create_app(DevelopmentConfig)
    
    with app.app_context():
        # Vérifier si l'utilisateur existe déjà
        existing_user = User.find_by_email(email)
        if existing_user:
            print(f"Un utilisateur avec l'email {email} existe déjà.")
            return False
        
        # Créer un nouvel utilisateur admin
        user = User(
            username=username,
            email=email,
            password=password,
            role='admin',
            is_email_verified=True  # On suppose que l'admin est vérifié
        )
        
        # Sauvegarder l'utilisateur
        if user.save():
            print(f"\nCompte administrateur créé avec succès !")
            print(f"Email: {email}")
            print(f"Nom d'utilisateur: {username}")
            return True
        else:
            print("Erreur lors de la création du compte administrateur.")
            return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Créer un compte administrateur')
    parser.add_argument('email', help='Email de l\'administrateur')
    parser.add_argument('password', help='Mot de passe de l\'administrateur')
    parser.add_argument('username', help='Nom d\'utilisateur de l\'administrateur')
    
    args = parser.parse_args()
    
    if not all([args.email, args.password, args.username]):
        parser.print_help()
        sys.exit(1)
    
    create_admin_user(args.email, args.password, args.username)
