# 🚀 Déploiement Rupagency CRM

## Vue d'ensemble

Ce guide vous explique comment déployer votre CRM Rupagency sur le web pour qu'il soit accessible partout dans le monde.

## Architecture de déploiement

- **Backend + Base de données**: Railway (PostgreSQL)
- **Frontend**: Netlify (React)
- **Authentification**: JWT
- **Base de données**: PostgreSQL

## 📋 Prérequis

1. Compte GitHub avec votre repository `RupagencyCRM`
2. Compte Railway (gratuit)
3. Compte Netlify (gratuit)

## 🎯 Étape 1: Déploiement Railway (Backend)

### 1.1 Connexion à Railway
1. Allez sur [railway.app](https://railway.app)
2. Connectez-vous avec votre compte GitHub
3. Cliquez sur "New Project"
4. Sélectionnez "Deploy from GitHub repo"
5. Choisissez votre repository `RupagencyCRM`

### 1.2 Configuration de la base de données
Railway va automatiquement :
- Détecter que vous utilisez PostgreSQL
- Créer une base de données PostgreSQL
- Configurer la variable `DATABASE_URL`

### 1.3 Variables d'environnement
Dans votre projet Railway, allez dans "Variables" et ajoutez :

```
JWT_SECRET=votre_secret_jwt_super_securise_ici
NODE_ENV=production
PORT=5000
```

### 1.4 Déploiement
- Railway va automatiquement déployer votre application
- Vérifiez les logs pour s'assurer que la base de données est initialisée
- Votre API sera accessible sur `https://votre-app.railway.app`

## 🎯 Étape 2: Déploiement Netlify (Frontend)

### 2.1 Connexion à Netlify
1. Allez sur [netlify.com](https://netlify.com)
2. Connectez-vous avec votre compte GitHub
3. Cliquez sur "New site from Git"
4. Choisissez votre repository `RupagencyCRM`

### 2.2 Configuration du build
- **Build command**: `npm run build`
- **Publish directory**: `build`
- **Base directory**: (laisser vide)

### 2.3 Variables d'environnement
Dans "Site settings" > "Environment variables", ajoutez :

```
REACT_APP_API_URL=https://votre-app-railway.railway.app/api
```

Remplacez `votre-app-railway` par l'URL de votre app Railway.

### 2.4 Déploiement
- Netlify va automatiquement déployer votre frontend
- Votre site sera accessible via une URL Netlify

## 🧪 Test du déploiement

### Test de l'API Railway
```bash
curl -X POST https://votre-app-railway.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"thomas@rupagency.com","password":"password123"}'
```

### Test du frontend Netlify
1. Ouvrez votre URL Netlify
2. Connectez-vous avec `thomas@rupagency.com` / `password123`
3. Vérifiez que toutes les fonctionnalités marchent

## 🔧 Dépannage

### Problème: Erreur de connexion à la base de données
- Vérifiez que `DATABASE_URL` est bien configurée dans Railway
- Vérifiez les logs Railway pour les erreurs

### Problème: Frontend ne peut pas se connecter au backend
- Vérifiez que `REACT_APP_API_URL` pointe vers la bonne URL Railway
- Vérifiez que CORS est bien configuré

### Problème: Erreur 404 sur les routes React
- Vérifiez que le fichier `public/_redirects` est bien présent
- Vérifiez la configuration Netlify

## 📊 Monitoring

- **Railway**: Surveillez les logs et les métriques dans le dashboard
- **Netlify**: Surveillez les déploiements et les performances
- **Base de données**: Railway fournit des métriques PostgreSQL

## 🔒 Sécurité

- Changez le `JWT_SECRET` pour une valeur sécurisée
- Utilisez HTTPS (automatique avec Railway et Netlify)
- Surveillez les logs pour détecter les tentatives d'intrusion

## 💰 Coûts

- **Railway**: Gratuit pour commencer (limite mensuelle)
- **Netlify**: Gratuit pour les sites personnels
- **PostgreSQL**: Inclus dans Railway

## 🌐 Accès pour vos utilisateurs

Une fois déployé, vos utilisateurs pourront accéder à :
- **URL**: `https://votre-app-netlify.netlify.app`
- **API**: `https://votre-app-railway.railway.app/api`

## 📞 Support

Pour toute question sur le déploiement :
- [Documentation Railway](https://docs.railway.app)
- [Documentation Netlify](https://docs.netlify.com)

Votre CRM est maintenant accessible partout dans le monde ! 🌍 