# Documentation de l'API EcoTourism

Cette documentation décrit les endpoints de l'API REST utilisés par le panneau d'administration.

## Authentification

### Connexion

- **URL** : `/api/auth/login`
- **Méthode** : `POST`
- **Corps de la requête** :
  ```json
  {
    "email": "admin@example.com",
    "password": "motdepasse"
  }
  ```
- **Réponse en cas de succès** :
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-123",
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin",
      "is_email_verified": true,
      "created_at": "2023-10-27T10:00:00Z"
    }
  }
  ```

### Rafraîchissement du token

- **URL** : `/api/auth/refresh-token`
- **Méthode** : `POST`
- **En-têtes** :
  - `Authorization: Bearer <refresh_token>`
- **Réponse en cas de succès** :
  ```json
  {
    "access_token": "nouveau_token_jwt"
  }
  ```

## Administration

### Tableau de bord

- **URL** : `/api/auth/admin/dashboard`
- **Méthode** : `GET`
- **Authentification requise** : Oui (rôle admin)
- **Réponse en cas de succès** :
  ```json
  {
    "stats": {
      "total_users": 42,
      "active_users": 28,
      "verified_users": 35,
      "recent_users": 5
    },
    "recent_activity": []
  }
  ```

### Liste des utilisateurs

- **URL** : `/api/auth/admin/users`
- **Méthode** : `GET`
- **Paramètres de requête** :
  - `page` (optionnel) : Numéro de page (par défaut: 1)
  - `per_page` (optionnel) : Nombre d'utilisateurs par page (par défaut: 10)
  - `search` (optionnel) : Terme de recherche
  - `role` (optionnel) : Filtrer par rôle (admin, guide, tourist)
- **Authentification requise** : Oui (rôle admin)
- **Réponse en cas de succès** :
  ```json
  {
    "users": [
      {
        "id": "user-123",
        "username": "admin",
        "email": "admin@example.com",
        "role": "admin",
        "is_active": true,
        "is_email_verified": true,
        "created_at": "2023-10-27T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 1,
      "pages": 1,
      "current_page": 1,
      "per_page": 10
    }
  }
  ```

### Récupérer un utilisateur

- **URL** : `/api/auth/admin/users/:id`
- **Méthode** : `GET`
- **Authentification requise** : Oui (rôle admin)
- **Réponse en cas de succès** :
  ```json
  {
    "id": "user-123",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "is_active": true,
    "is_email_verified": true,
    "created_at": "2023-10-27T10:00:00Z"
  }
  ```

### Mettre à jour un utilisateur

- **URL** : `/api/auth/admin/users/:id`
- **Méthode** : `PUT`
- **Authentification requise** : Oui (rôle admin)
- **Corps de la requête** :
  ```json
  {
    "username": "nouveau_nom",
    "email": "nouvel@email.com",
    "role": "guide",
    "is_active": true
  }
  ```
- **Réponse en cas de succès** :
  ```json
  {
    "message": "Utilisateur mis à jour avec succès",
    "user": {
      "id": "user-123",
      "username": "nouveau_nom",
      "email": "nouvel@email.com",
      "role": "guide",
      "is_active": true,
      "is_email_verified": true,
      "created_at": "2023-10-27T10:00:00Z"
    }
  }
  ```

### Supprimer un utilisateur

- **URL** : `/api/auth/admin/users/:id`
- **Méthode** : `DELETE`
- **Authentification requise** : Oui (rôle admin)
- **Réponse en cas de succès** :
  ```json
  {
    "message": "Utilisateur supprimé avec succès"
  }
  ```

### Changer le statut d'un utilisateur

- **URL** : `/api/auth/admin/users/:id/status`
- **Méthode** : `PATCH`
- **Authentification requise** : Oui (rôle admin)
- **Corps de la requête** :
  ```json
  {
    "is_active": false
  }
  ```
- **Réponse en cas de succès** :
  ```json
  {
    "message": "Statut de l'utilisateur mis à jour",
    "user_id": "user-123",
    "is_active": false
  }
  ```

## Gestion des erreurs

Les erreurs sont renvoyées avec le code HTTP approprié et un objet JSON contenant un message d'erreur :

```json
{
  "error": {
    "code": "error_code",
    "message": "Message d'erreur détaillé"
  }
}
```

### Codes d'erreur courants

- `400` : Requête incorrecte
- `401` : Non autorisé
- `403` : Accès refusé
- `404` : Ressource non trouvée
- `500` : Erreur serveur

## Sécurité

- Toutes les requêtes doivent inclure un en-tête `Authorization: Bearer <token>`
- Les tokens expirent après 15 minutes d'inactivité
- Les tokens de rafraîchissement expirent après 7 jours
- Les mots de passe doivent être transmis en HTTPS uniquement

## Exemple d'utilisation avec cURL

```bash
# Connexion et récupération du token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"motdepasse"}'

# Récupération de la liste des utilisateurs
curl -X GET http://localhost:5000/api/auth/admin/users \
  -H "Authorization: Bearer <access_token>"

# Mise à jour d'un utilisateur
curl -X PUT http://localhost:5000/api/auth/admin/users/user-123 \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"role":"guide"}'
```
