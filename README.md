# 🌿 Eco-Tourism Ontology Platform

Une plateforme de **tourisme éco-responsable** basée sur une ontologie sémantique pour recommander des hébergements et activités à faible empreinte carbone.


## 📌 Description
Ce projet utilise une **ontologie OWL** pour modéliser les données du tourisme éco-responsable (hébergements, activités, transports, etc.) et les expose via une **API REST** (Flask) avec une interface utilisateur moderne (HTML/CSS/JS + Bootstrap).

**Fonctionnalités principales** :
- Recherche d'hébergements et activités éco-responsables.
- Filtrage par niveau d'empreinte carbone, prix, localisation.
- Interface intuitive pour les utilisateurs.

---

## 🛠 Technologies Utilisées
- **Back-end** :
  - [Python](https://www.python.org/)
  - [Flask](https://flask.palletsprojects.com/)
  - [SPARQLWrapper](https://pypi.org/project/SPARQLWrapper/) (pour interagir avec Fuseki)
  - [Apache Jena Fuseki](https://jena.apache.org/documentation/fuseki2/) (base de données RDF)

- **Front-end** :
  - HTML5, CSS3, JavaScript, ReactJs
  - [Bootstrap 5](https://getbootstrap.com/) (pour le design responsive)

- **Ontologie** :
  - Langage **OWL/RDF** pour modéliser les données sémantiques.
