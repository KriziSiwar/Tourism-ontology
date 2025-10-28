from flask import render_template, redirect, url_for, request, jsonify
from flask import current_app
from . import home

@home.route('/')
def index():
    return render_template('home/index.html', segment='index')

@home.route('/dashboard')
def dashboard():
    return render_template('home/dashboard.html', segment='dashboard')

@home.route('/profile')
def profile():
    return render_template('home/profile.html', segment='profile')

#########################################

@home.route('/test-connexion')
def test_connexion():
    try:
        # Requête très simple pour tester la connexion
        query = "SELECT * WHERE { ?s ?p ?o } LIMIT 1"
        result = current_app.fuseki.query(query)
        return jsonify({
            "status": "success",
            "message": "Connexion à Fuseki réussie !",
            "data": result if result else []
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Erreur de connexion à Fuseki: {str(e)}"
        }), 500