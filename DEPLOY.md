# 🚀 Guide de Déploiement - RupagencyCRM

## 📋 Prérequis

- Compte Railway.app
- Projet GitHub connecté
- Base de données PostgreSQL

## 🔧 Configuration de la Base de Données

### Étape 1 : Créer la Base de Données PostgreSQL

1. **Allez sur Railway.app**
   - Connectez-vous à votre compte
   - Ouvrez votre projet RupagencyCRM

2. **Ajouter un service PostgreSQL**
   - Cliquez sur "New Service"
   - Sélectionnez "Database" → "PostgreSQL"
   - Railway va créer automatiquement une base de données

3. **Récupérer les informations de connexion**
   - Cliquez sur votre service PostgreSQL
   - Allez dans l'onglet "Variables"
   - Copiez la variable `DATABASE_URL`

### Étape 2 : Configurer les Variables d'Environnement

Dans votre service d'application (RupagencyCRM), ajoutez ces variables :

```env
# Base de données
DATABASE_URL=postgresql://postgres:password@containers-us-west-XX.railway.app:XXXX/railway
NODE_ENV=production

# JWT
JWT_SECRET=votre-secret-jwt-super-securise-changez-cela

# CORS
CORS_ORIGIN=https://votre-app.railway.app

# API
REACT_APP_API_URL=https://votre-app.railway.app/api
```

### Étape 3 : Initialiser la Base de Données

1. **Redéployer l'application**
   - Railway va automatiquement redéployer
   - La base de données sera initialisée

2. **Vérifier les logs**
   - Allez dans "Deploy Logs"
   - Vous devriez voir : "✅ Base de données PostgreSQL initialisée avec succès"

## 🔐 Informations de Connexion

Une fois déployé, vous pouvez vous connecter avec :

- **Email :** `admin@rupagency.com`
- **Mot de passe :** `password123`

## 🛠️ Développement Local

### Configuration Locale

1. **Créer un fichier `.env`**
```env
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/rupagency
JWT_SECRET=dev-secret-key
CORS_ORIGIN=http://localhost:3000
REACT_APP_API_URL=http://localhost:5000/api
```

2. **Installer PostgreSQL localement**
   - Ou utiliser Docker : `docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`

3. **Initialiser la base de données locale**
```bash
npm run setup-db
```

4. **Lancer l'application**
```bash
npm run dev
```

## 📊 Structure de la Base de Données

### Tables Principales

- **users** : Utilisateurs du système
- **companies** : Entreprises/prospects
- **calls** : Appels programmés
- **appointments** : Rendez-vous

### Données de Test Incluses

- 3 utilisateurs (admin + 2 closers)
- 2 entreprises d'exemple
- Configuration complète des rôles

## 🔍 Vérification du Déploiement

### Tests à Effectuer

1. **Connexion utilisateur**
   - Se connecter avec admin@rupagency.com
   - Vérifier l'accès au dashboard

2. **Fonctionnalités CRUD**
   - Créer une entreprise
   - Modifier un utilisateur
   - Programmer un appel

3. **API Endpoints**
   - `/api/auth/login`
   - `/api/companies`
   - `/api/users`
   - `/api/calls`
   - `/api/appointments`

## 🚨 Dépannage

### Problèmes Courants

1. **Erreur de connexion à la base de données**
   - Vérifier `DATABASE_URL`
   - S'assurer que `NODE_ENV=production`

2. **Erreurs CORS**
   - Vérifier `CORS_ORIGIN`
   - S'assurer que l'URL correspond à votre domaine

3. **Erreurs JWT**
   - Vérifier `JWT_SECRET`
   - Redémarrer l'application

### Logs Utiles

```bash
# Vérifier les logs Railway
railway logs

# Vérifier la base de données
railway connect
```

## 🔄 Mise à Jour

### Pour Mettre à Jour l'Application

1. **Pousser les changements sur GitHub**
```bash
git add .
git commit -m "Update application"
git push origin main
```

2. **Railway redéploie automatiquement**
   - Surveiller les logs de déploiement
   - Vérifier que tout fonctionne

### Pour Mettre à Jour la Base de Données

1. **Créer une migration**
```bash
npm run migrate
```

2. **Ou utiliser le script de setup**
```bash
npm run setup-db
```

## 📞 Support

En cas de problème :
1. Vérifier les logs Railway
2. Tester en local d'abord
3. Vérifier la configuration des variables d'environnement

---

**🎉 Votre CRM est maintenant connecté à une base de données PostgreSQL en ligne !** 