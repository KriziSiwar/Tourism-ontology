from datetime import datetime, timedelta
import jwt
from werkzeug.security import generate_password_hash, check_password_hash
from .user_repository import UserRepository

class User:
    _repository = None
    
    @classmethod
    def init_app(cls, app):
        cls._repository = UserRepository(app.config['SPARQL_ENDPOINT'])
    
    def __init__(self, username=None, email=None, password=None, role='tourist', id=None, **kwargs):
        self.id = id
        self.username = username
        self.email = email
        self.password_hash = kwargs.get('password_hash')
        self.role = role
        self.is_email_verified = kwargs.get('is_email_verified', False)
        self.email_verification_token = kwargs.get('email_verification_token')
        self.email_verification_sent_at = kwargs.get('email_verification_sent_at')
        self.password_reset_token = kwargs.get('password_reset_token')
        self.password_reset_sent_at = kwargs.get('password_reset_sent_at')
        self.refresh_token = kwargs.get('refresh_token')
        self.created_at = kwargs.get('created_at', datetime.utcnow())
        
        if password:
            self.set_password(password)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def generate_auth_token(self, app, token_type='access'):
        """
        Génère un token JWT pour l'utilisateur
        
        Args:
            app: L'application Flask
            token_type: Type de token ('access', 'refresh', 'email_verification', 'password_reset')
        """
        if token_type == 'access':
            # Token d'accès (15 minutes de validité)
            expires_in = timedelta(minutes=15)
            payload = {
                'exp': datetime.utcnow() + expires_in,
                'iat': datetime.utcnow(),
                'sub': self.id,
                'role': self.role,
                'username': self.username,
                'type': 'access'
            }
        elif token_type == 'refresh':
            # Token de rafraîchissement (7 jours de validité)
            expires_in = timedelta(days=7)
            payload = {
                'exp': datetime.utcnow() + expires_in,
                'iat': datetime.utcnow(),
                'sub': self.id,
                'type': 'refresh'
            }
            self.refresh_token = jwt.encode(
                payload,
                app.config['SECRET_KEY'],
                algorithm='HS256'
            )
            self.save()
            return self.refresh_token
        elif token_type == 'email_verification':
            # Token de vérification d'email (24 heures de validité)
            expires_in = timedelta(hours=24)
            payload = {
                'exp': datetime.utcnow() + expires_in,
                'iat': datetime.utcnow(),
                'sub': self.id,
                'type': 'email_verification'
            }
            self.email_verification_token = jwt.encode(
                payload,
                app.config['SECRET_KEY'],
                algorithm='HS256'
            )
            self.email_verification_sent_at = datetime.utcnow()
            self.save()
            return self.email_verification_token
        elif token_type == 'password_reset':
            # Token de réinitialisation de mot de passe (1 heure de validité)
            expires_in = timedelta(hours=1)
            payload = {
                'exp': datetime.utcnow() + expires_in,
                'iat': datetime.utcnow(),
                'sub': self.id,
                'type': 'password_reset'
            }
            self.password_reset_token = jwt.encode(
                payload,
                app.config['SECRET_KEY'],
                algorithm='HS256'
            )
            self.password_reset_sent_at = datetime.utcnow()
            self.save()
            return self.password_reset_token
        return jwt.encode(
            payload,
            app.config['SECRET_KEY'],
            algorithm='HS256'
        )

    @classmethod
    def find_by_email(cls, email):
        """Trouve un utilisateur par son email"""
        if not cls._repository:
            raise RuntimeError('User repository not initialized. Call User.init_app(app) first.')
            
        user_data = cls._repository.get_user_by_email(email)
        if not user_data:
            return None
            
        return cls(**user_data)
    
    @classmethod
    def verify_token(cls, token, app, token_type='access'):
        """
        Vérifie un token JWT et retourne l'utilisateur correspondant
        
        Args:
            token: Le token JWT à vérifier
            app: L'application Flask
            token_type: Type de token attendu ('access', 'refresh', 'email_verification', 'password_reset')
        """
        try:
            data = jwt.decode(
                token,
                app.config['SECRET_KEY'],
                algorithms=['HS256']
            )
            
            # Vérification du type de token
            if data.get('type') != token_type:
                return None
                
            # Récupération de l'utilisateur
            if token_type == 'access':
                return cls.find_by_id(data['sub'])
            else:
                # Pour les autres types de tokens, on vérifie qu'ils correspondent à ceux stockés
                user = cls.find_by_id(data['sub'])
                if not user:
                    return None
                    
                if token_type == 'refresh' and user.refresh_token != token:
                    return None
                elif token_type == 'email_verification' and user.email_verification_token != token:
                    return None
                elif token_type == 'password_reset' and user.password_reset_token != token:
                    return None
                    
                return user
                
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, Exception) as e:
            current_app.logger.error(f'Erreur de vérification du token: {str(e)}')
            return None
            
    @classmethod
    def verify_auth_token(cls, token, app):
        """Alias pour la rétrocompatibilité"""
        try:
            return cls.verify_token(token, app, 'access')
        except:
            return None

    def save(self):
        """Sauvegarde l'utilisateur dans la base de données"""
        if not self._repository:
            raise RuntimeError('User repository not initialized. Call User.init_app(app) first.')
            
        user_data = {
            'username': self.username,
            'email': self.email,
            'password_hash': self.password_hash,
            'role': self.role
        }
        
        if not self.id:
            # Nouvel utilisateur
            saved_user = self._repository.create_user(user_data)
            if saved_user:
                self.id = saved_user['id']
                return True
            return False
        else:
            # Mise à jour de l'utilisateur existant
            # À implémenter
            return True
    
    def update_password(self, new_password):
        """Met à jour le mot de passe de l'utilisateur"""
        self.set_password(new_password)
        
    @classmethod
    def count(cls):
        """Retourne le nombre total d'utilisateurs"""
        if not cls._repository:
            raise RuntimeError('User repository not initialized. Call User.init_app(app) first.')
        return cls._repository.count_users()
    
    @classmethod
    def count_active(cls):
        """Retourne le nombre d'utilisateurs actifs (ayant une adresse email vérifiée)"""
        if not cls._repository:
            raise RuntimeError('User repository not initialized. Call User.init_app(app) first.')
        return cls._repository.count_users(active=True)
    
    @classmethod
    def count_verified(cls):
        """Retourne le nombre d'utilisateurs avec email vérifié"""
        if not cls._repository:
            raise RuntimeError('User repository not initialized. Call User.init_app(app) first.')
        return cls._repository.count_verified_users()
        if not self._repository:
            raise RuntimeError('User repository not initialized. Call User.init_app(app) first.')
            
        return self._repository.update_password(self.id, self.password_hash)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'is_email_verified': self.is_email_verified,
            'created_at': self.created_at.isoformat() if hasattr(self.created_at, 'isoformat') else self.created_at
        }
        
    def verify_email(self):
        """Marque l'email de l'utilisateur comme vérifié"""
        self.is_email_verified = True
        self.email_verification_token = None
        self.email_verification_sent_at = None
        return self.save()
        
    def generate_refresh_token(self, app):
        """Génère un token de rafraîchissement"""
        return self.generate_auth_token(app, 'refresh')
        
    def generate_email_verification_token(self, app):
        """Génère un token de vérification d'email"""
        return self.generate_auth_token(app, 'email_verification')
        
    def generate_password_reset_token(self, app):
        """Génère un token de réinitialisation de mot de passe"""
        return self.generate_auth_token(app, 'password_reset')
