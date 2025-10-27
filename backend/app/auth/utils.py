from functools import wraps
from flask import jsonify, request
import jwt
from app import current_app
from app.models.user import User

def roles_required(*roles):
    """
    Décorateur pour vérifier les rôles de l'utilisateur
    Utilisation: @roles_required('admin', 'moderator')
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            auth_header = request.headers.get('Authorization')
            
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({'message': 'Token manquant ou invalide'}), 401
                
            token = auth_header.split(' ')[1]
            
            try:
                # Décoder le token pour obtenir l'ID de l'utilisateur
                data = jwt.decode(
                    token,
                    current_app.config['SECRET_KEY'],
                    algorithms=['HS256']
                )
                
                # Récupérer l'utilisateur depuis la base de données
                user = User.find_by_id(data['sub'])
                
                # Vérifier si l'utilisateur existe et a le bon rôle
                if not user or (roles and user.role not in roles):
                    return jsonify({'message': 'Accès non autorisé'}), 403
                    
                # Ajouter l'utilisateur aux arguments de la fonction décorée
                return f(user, *args, **kwargs)
                
            except jwt.ExpiredSignatureError:
                return jsonify({'message': 'Token expiré'}), 401
            except (jwt.InvalidTokenError, Exception) as e:
                return jsonify({'message': 'Token invalide'}), 401
                
        return decorated_function
    return decorator
