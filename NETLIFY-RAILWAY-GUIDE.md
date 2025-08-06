t # 🚀 Guide complet : Netlify + Railway

## 📋 **Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Netlify       │    │   Railway       │    │   PostgreSQL    │
│   (Frontend)    │◄──►│   (API)         │◄──►│   (Base de      │
│   React         │    │   Express.js    │    │    données)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎯 **Étapes de déploiement**

### **Étape 1: Préparer le projet**

1. **Installer les dépendances PostgreSQL**
```bash
npm install pg dotenv
```

2. **Vérifier que tous les fichiers sont commités**
```bash
git add .
git commit -m "Préparation pour déploiement Netlify + Railway"
git push
```

### **Étape 2: Déployer l'API sur Railway**

1. **Aller sur [Railway.app](https://railway.app)**
2. **Se connecter avec GitHub**
3. **Créer un nouveau projet**
4. **Choisir "Deploy from GitHub repo"**
5. **Sélectionner votre repository RupagencyCRM**

### **Étape 3: Ajouter PostgreSQL**

1. **Dans votre projet Railway, cliquer sur "New"**
2. **Sélectionner "Database" → "PostgreSQL"**
3. **Railway créera automatiquement une base PostgreSQL**

### **Étape 4: Configurer Railway**

1. **Aller dans les paramètres du projet Railway**
2. **Cliquer sur "Variables"**
3. **Ajouter les variables suivantes :**

```
NODE_ENV=production
JWT_SECRET=votre-secret-jwt-super-securise
CORS_ORIGIN=https://votre-app.netlify.app
```

### **Étape 5: Déployer le frontend sur Netlify**

1. **Aller sur [Netlify.com](https://netlify.com)**
2. **Se connecter avec GitHub**
3. **Cliquer sur "New site from Git"**
4. **Sélectionner votre repository RupagencyCRM**
5. **Configurer le build :**
   - **Build command :** `npm run build`
   - **Publish directory :** `build`

### **Étape 6: Configurer Netlify**

1. **Dans votre site Netlify, aller dans "Site settings"**
2. **Cliquer sur "Environment variables"**
3. **Ajouter :**

```
REACT_APP_API_URL=https://votre-api.railway.app/api
```

## 🔧 **Configuration des routes**

### **Railway (API)**
- **URL :** `https://votre-api.railway.app`
- **Endpoints :** `/api/auth`, `/api/companies`, etc.

### **Netlify (Frontend)**
- **URL :** `https://votre-app.netlify.app`
- **Redirection :** Toutes les routes vers `index.html`

## 🌐 **URLs finales**

Une fois déployé :
- **Frontend :** `https://votre-app.netlify.app`
- **API :** `https://votre-api.railway.app/api`

## 🔒 **Sécurité**

### **CORS Configuration**
Le serveur Railway est configuré pour accepter les requêtes uniquement depuis votre domaine Netlify.

### **Variables d'environnement**
- `JWT_SECRET` : Secret pour l'authentification
- `CORS_ORIGIN` : Domaine autorisé pour les requêtes
- `DATABASE_URL` : Automatiquement configuré par Railway

## 💰 **Coûts**

- **Netlify :** Gratuit (100GB bande passante/mois)
- **Railway :** Gratuit (500h/mois) → $5/mois pour usage illimité
- **Total :** Gratuit pour commencer !

## 🚨 **Dépannage**

### **Erreur CORS**
Vérifier que `CORS_ORIGIN` dans Railway correspond à votre URL Netlify.

### **Erreur de connexion API**
Vérifier que `REACT_APP_API_URL` dans Netlify correspond à votre URL Railway.

### **Base de données non initialisée**
Vérifier les logs Railway pour voir les erreurs d'initialisation.

## 📞 **Support**

- [Documentation Railway](https://docs.railway.app)
- [Documentation Netlify](https://docs.netlify.com)
- [Forum Railway](https://community.railway.app) 