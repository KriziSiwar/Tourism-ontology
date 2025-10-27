from flask import Blueprint

# Création du Blueprint
auth_bp = Blueprint('auth', __name__)

# Import des routes après la création du Blueprint pour éviter les importations circulaires
from . import routes
