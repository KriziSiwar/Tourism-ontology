from flask import Blueprint, request, jsonify, current_app, url_for, render_template_string
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
import re
from functools import wraps
from ..models.user import User
from ..email import send_email, send_email_verification, send_password_reset_email
from .utils import roles_required

# Décorateur pour les routes protégées
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'message': 'Token manquant ou invalide'}), 401
        
        token = auth_header.split(' ')[1]
        user = User.verify_token(token, current_app, 'access')
        
        if not user:
            return jsonify({'message': 'Token invalide ou expiré'}), 401
            
        if not user.is_email_verified:
            return jsonify({'message': 'Veuvez d\'abord vérifier votre adresse email'}), 403
            
        return f(user, *args, **kwargs)
    
    return decorated

# Validation des emails
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

# Validation des mots de passe
PASSWORD_MIN_LENGTH = 8
PASSWORD_REGEX = re.compile(
    r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$'
)

def validate_registration_data(data):
    """Valide les données d'inscription"""
    errors = {}
    
    # Validation du nom d'utilisateur
    if not data.get('username') or len(data['username']) < 3:
        errors['username'] = 'Le nom d\'utilisateur doit contenir au moins 3 caractères'
    
    # Validation de l'email
    if not data.get('email'):
        errors['email'] = 'L\'email est requis'
    elif not EMAIL_REGEX.match(data['email']):
        errors['email'] = 'Format d\'email invalide'
    
    # Validation du mot de passe
    if not data.get('password'):
        errors['password'] = 'Le mot de passe est requis'
    elif len(data['password']) < PASSWORD_MIN_LENGTH:
        errors['password'] = f'Le mot de passe doit contenir au moins {PASSWORD_MIN_LENGTH} caractères'
    elif not PASSWORD_REGEX.match(data['password']):
        errors['password'] = 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
    
    # Validation de la confirmation du mot de passe
    if data.get('password') != data.get('confirm_password'):
        errors['confirm_password'] = 'Les mots de passe ne correspondent pas'
    
    # Validation du rôle
    if data.get('role') not in ['tourist', 'guide']:
        errors['role'] = 'Rôle invalide. Doit être "tourist" ou "guide"'
    
    return errors

# Import du blueprint depuis __init__.py
from . import auth_bp

# Route de test
@auth_bp.route('/test')
def test():
    return {"message": "Auth routes are working!"}, 200

# Route d'inscription
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validation des données
    errors = validate_registration_data(data)
    if errors:
        return jsonify({
            'message': 'Échec de la validation',
            'errors': errors
        }), 400
    
    # Vérification si l'utilisateur existe déjà
    if User.find_by_email(data['email']):
        return jsonify({
            'message': 'Échec de la validation',
            'errors': {'email': 'Cet email est déjà utilisé'}
        }), 400
    
    # Création du nouvel utilisateur
    user = User(
        username=data['username'],
        email=data['email'],
        password=data['password'],
        role=data.get('role', 'tourist')
    )
    
    # Sauvegarde de l'utilisateur
    if not user.save():
        return jsonify({
            'message': 'Une erreur est survenue lors de l\'inscription'
        }), 500
    
    # Génération du token d'accès et de rafraîchissement
    access_token = user.generate_auth_token(current_app, 'access')
    refresh_token = user.generate_refresh_token(current_app)
    
    # Génération et envoi de l'email de vérification
    verification_token = user.generate_email_verification_token(current_app)
    verification_link = url_for('auth.verify_email', token=verification_token, _external=True)
    send_email_verification(user, verification_link)
    
    return jsonify({
        'message': 'Inscription réussie. Un email de vérification a été envoyé.',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token,
        'expires_in': 900  # 15 minutes en secondes
    }), 201

# Route de connexion
@auth_bp.route('/login', methods=['POST'])
def login():
    print("\n=== Tentative de connexion ===")
    print(f"Headers: {request.headers}")
    print(f"Content-Type: {request.content_type}")
    
    try:
        data = request.get_json()
        print(f"Données reçues: {data}")
        
        # Validation des données
        if not data or not data.get('email') or not data.get('password'):
            error_msg = 'Email et mot de passe requis'
            print(f"Erreur de validation: {error_msg}")
            return jsonify({'message': error_msg}), 400
        
        # Récupération de l'utilisateur
        print(f"Recherche de l'utilisateur avec l'email: {data['email']}")
        user = User.find_by_email(data['email'])
        
        # Vérification du mot de passe
        if not user:
            error_msg = 'Aucun utilisateur trouvé avec cet email'
            print(error_msg)
            return jsonify({'message': 'Email ou mot de passe incorrect'}), 401
            
        print(f"Utilisateur trouvé: {user.username}")
        password_correct = user.check_password(data['password'])
        print(f"Mot de passe correct: {password_correct}")
        
        if not password_correct:
            error_msg = 'Mot de passe incorrect'
            print(error_msg)
            return jsonify({'message': 'Email ou mot de passe incorrect'}), 401
        
        # Génération des tokens
        print("Génération des tokens...")
        access_token = user.generate_auth_token(current_app, 'access')
        refresh_token = user.generate_refresh_token(current_app)
        
        print("Connexion réussie")
        return jsonify({
            'message': 'Connexion réussie',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict(),
            'expires_in': 900  # 15 minutes en secondes
        })
    except Exception as e:
        print(f"Erreur lors de la connexion: {str(e)}")
        return jsonify({'message': 'Une erreur est survenue lors de la connexion'}), 500

# Route de rafraîchissement du token
@auth_bp.route('/refresh-token', methods=['POST'])
def refresh_token():
    data = request.get_json()
    refresh_token = data.get('refresh_token')
    
    if not refresh_token:
        return jsonify({'message': 'Token de rafraîchissement requis'}), 400
    
    # Vérification du token de rafraîchissement
    user = User.verify_token(refresh_token, current_app, 'refresh')
    if not user:
        return jsonify({'message': 'Token de rafraîchissement invalide ou expiré'}), 401
    
    # Génération d'un nouveau token d'accès
    new_access_token = user.generate_auth_token(current_app, 'access')
    
    return jsonify({
        'access_token': new_access_token,
        'expires_in': 900  # 15 minutes en secondes
    })

# Route de vérification d'email
@auth_bp.route('/verify-email/<token>', methods=['GET'])
def verify_email(token):
    # Vérification du token
    user = User.verify_token(token, current_app, 'email_verification')
    if not user:
        return jsonify({'message': 'Lien de vérification invalide ou expiré'}), 400
    
    # Vérification si l'email est déjà vérifié
    if user.is_email_verified:
        return jsonify({'message': 'Votre adresse email est déjà vérifiée'}), 200
    
    # Vérification de l'expiration du token (24h)
    if (datetime.datetime.utcnow() - user.email_verification_sent_at).total_seconds() > 86400:
        return jsonify({'message': 'Le lien de vérification a expiré'}), 400
    
    # Marquer l'email comme vérifié
    if user.verify_email():
        return jsonify({'message': 'Adresse email vérifiée avec succès'}), 200
    else:
        return jsonify({'message': 'Erreur lors de la vérification de l\'email'}), 500

# Renvoyer l'email de vérification
@auth_bp.route('/resend-verification', methods=['POST'])
@token_required
def resend_verification(user):
    if user.is_email_verified:
        return jsonify({'message': 'Votre adresse email est déjà vérifiée'}), 400
    
    # Vérification du délai entre deux envois (5 minutes)
    if user.email_verification_sent_at and \
       (datetime.datetime.utcnow() - user.email_verification_sent_at).total_seconds() < 300:
        return jsonify({'message': 'Veuvez patienter avant de renvoyer un nouvel email'}), 429
    
    # Génération et envoi d'un nouveau lien de vérification
    verification_token = user.generate_email_verification_token(current_app)
    verification_link = url_for('auth.verify_email', token=verification_token, _external=True)
    send_email_verification(user, verification_link)
    
    return jsonify({'message': 'Un nouvel email de vérification a été envoyé'}), 200

# Route pour la réinitialisation du mot de passe - Demande
@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({'message': 'Email requis'}), 400
    
    # Recherche de l'utilisateur
    user = User.find_by_email(email)
    if not user:
        # Pour des raisons de sécurité, on ne révèle pas si l'email existe
        return jsonify({'message': 'Si cet email existe, un lien de réinitialisation a été envoyé'})
    
    # Vérification du délai entre deux demandes (5 minutes)
    if user.password_reset_sent_at and \
       (datetime.datetime.utcnow() - user.password_reset_sent_at).total_seconds() < 300:
        return jsonify({'message': 'Veuvez patienter avant de faire une nouvelle demande'}), 429
    
    # Génération d'un token de réinitialisation
    reset_token = user.generate_password_reset_token(current_app)
    reset_link = url_for('auth.reset_password_confirm', token=reset_token, _external=True)
    
    # Envoi de l'email de réinitialisation
    send_password_reset_email(user, reset_link)
    
    return jsonify({
        'message': 'Si cet email existe, un lien de réinitialisation a été envoyé'
    })

# Page de confirmation de réinitialisation (pour le frontend)
@auth_bp.route('/reset-password/confirm/<token>', methods=['GET'])
def reset_password_confirm(token):
    # Cette route est destinée au frontend pour afficher le formulaire de réinitialisation
    # Le frontend doit envoyer une requête POST à /reset-password avec le token et le nouveau mot de passe
    return jsonify({
        'message': 'Veuvez soumettre le formulaire avec votre nouveau mot de passe'
    })

# Route pour la réinitialisation du mot de passe - Confirmation
@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('new_password')
    
    if not token or not new_password:
        return jsonify({'message': 'Token et nouveau mot de passe requis'}), 400
    
    # Validation du mot de passe
    if len(new_password) < 8:
        return jsonify({
            'message': 'Le mot de passe doit contenir au moins 8 caractères',
            'errors': {'new_password': 'Le mot de passe doit contenir au moins 8 caractères'}
        }), 400
    
    # Vérification du token
    user = User.verify_token(token, current_app, 'password_reset')
    if not user:
        return jsonify({'message': 'Lien de réinitialisation invalide ou expiré'}), 400
    
    # Vérification de l'expiration du token (1h)
    if (datetime.datetime.utcnow() - user.password_reset_sent_at).total_seconds() > 3600:
        return jsonify({'message': 'Le lien de réinitialisation a expiré'}), 400
    
    # Mise à jour du mot de passe
    if not user.update_password(new_password):
        return jsonify({'message': 'Erreur lors de la mise à jour du mot de passe'}), 500
    
    # Réinitialisation du token
    user.password_reset_token = None
    user.password_reset_sent_at = None
    user.save()
    
    return jsonify({'message': 'Mot de passe mis à jour avec succès'})

# Route protégée pour récupérer les informations de l'utilisateur connecté
@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(user):
    return jsonify({
        'user': user.to_dict()
    })

# Route du tableau de bord administrateur
@auth_bp.route('/admin/dashboard', methods=['GET'])
@token_required
@roles_required('admin')
def admin_dashboard(user):
    return jsonify({
        'message': 'Bienvenue sur le tableau de bord administrateur',
        'user': user.to_dict(),
        'stats': {
            'total_users': User.count(),
            'active_users': User.count_active(),
            'verified_users': User.count_verified()
        }
    })
