# Guide de Déploiement - Rupagency CRM

## 🚀 Déploiement sur Railway (Backend) + Netlify (Frontend)

### Étape 1: Configuration Railway (Backend + Base de données)

1. **Aller sur [Railway.app](https://railway.app)**
   - Connectez-vous avec votre compte GitHub
   - Cliquez sur "New Project"
   - Sélectionnez "Deploy from GitHub repo"
   - Choisissez votre repository `RupagencyCRM`

2. **Configuration de la base de données PostgreSQL**
   - Dans votre projet Railway, allez dans l'onglet "Variables"
   - Railway a automatiquement créé une variable `DATABASE_URL`
   - Cette URL contient les informations de connexion PostgreSQL

3. **Variables d'environnement à ajouter**
   ```
   JWT_SECRET=votre_secret_jwt_super_securise_ici
   NODE_ENV=production
   PORT=5000
   ```

4. **Redéploiement**
   - Railway va automatiquement redéployer votre application
   - Vérifiez les logs pour s'assurer que la base de données est initialisée

### Étape 2: Configuration Netlify (Frontend)

1. **Aller sur [Netlify.com](https://netlify.com)**
   - Connectez-vous avec votre compte GitHub
   - Cliquez sur "New site from Git"
   - Choisissez votre repository `RupagencyCRM`

2. **Configuration du build**
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
   - **Base directory**: (laisser vide)

3. **Variables d'environnement**
   - Allez dans "Site settings" > "Environment variables"
   - Ajoutez: `REACT_APP_API_URL=https://votre-app-railway.railway.app/api`
   - Remplacez `votre-app-railway` par l'URL de votre app Railway

4. **Déploiement**
   - Netlify va automatiquement déployer votre frontend
   - Votre site sera accessible via une URL Netlify

### Étape 3: Test du déploiement

1. **Test de l'API Railway**
   ```bash
   curl -X POST https://votre-app-railway.railway.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"thomas@rupagency.com","password":"password123"}'
   ```

2. **Test du frontend Netlify**
   - Ouvrez votre URL Netlify
   - Connectez-vous avec `thomas@rupagency.com` / `password123`
   - Vérifiez que toutes les fonctionnalités marchent

### Étape 4: Configuration du domaine personnalisé (Optionnel)

1. **Railway (Backend)**
   - Dans votre projet Railway, allez dans "Settings"
   - Ajoutez votre domaine personnalisé
   - Configurez les DNS selon les instructions

2. **Netlify (Frontend)**
   - Dans "Domain settings", ajoutez votre domaine
   - Configurez les DNS pour pointer vers Netlify

### 🔧 Dépannage

**Problème**: Erreur de connexion à la base de données
- Vérifiez que `DATABASE_URL` est bien configurée dans Railway
- Vérifiez les logs Railway pour les erreurs

**Problème**: Frontend ne peut pas se connecter au backend
- Vérifiez que `REACT_APP_API_URL` pointe vers la bonne URL Railway
- Vérifiez que CORS est bien configuré

**Problème**: Erreur 404 sur les routes React
- Vérifiez que le fichier `public/_redirects` est bien présent
- Vérifiez la configuration Netlify

### 📊 Monitoring

- **Railway**: Surveillez les logs et les métriques dans le dashboard
- **Netlify**: Surveillez les déploiements et les performances
- **Base de données**: Railway fournit des métriques PostgreSQL

### 🔒 Sécurité

- Changez le `JWT_SECRET` pour une valeur sécurisée
- Utilisez HTTPS (automatique avec Railway et Netlify)
- Surveillez les logs pour détecter les tentatives d'intrusion

### 💰 Coûts

- **Railway**: Gratuit pour commencer (limite mensuelle)
- **Netlify**: Gratuit pour les sites personnels
- **PostgreSQL**: Inclus dans Railway

Votre CRM est maintenant accessible partout dans le monde ! 🌍 