# 🚀 Configuration Railway + Netlify

## Étape 1: Déployer l'API sur Railway

### 1. Aller sur [Railway.app](https://railway.app)
### 2. Se connecter avec GitHub
### 3. Créer un nouveau projet
### 4. Choisir "Deploy from GitHub repo"
### 5. Sélectionner votre repository RupagencyCRM

## Étape 2: Ajouter PostgreSQL

### 1. Dans votre projet Railway, cliquer sur "New"
### 2. Sélectionner "Database" → "PostgreSQL"
### 3. Railway créera automatiquement une base PostgreSQL

## Étape 3: Configurer les variables d'environnement

Dans les paramètres de votre projet Railway, ajouter :

```
NODE_ENV=production
JWT_SECRET=votre-secret-jwt-super-securise
CORS_ORIGIN=https://votre-app.netlify.app
```

## Étape 4: Modifier le serveur pour PostgreSQL

Remplacer le contenu de `server/index.js` :

```javascript
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { router: authRoutes } = require('./routes/auth');
const companiesRoutes = require('./routes/companies');
const callsRoutes = require('./routes/calls');
const appointmentsRoutes = require('./routes/appointments');
const usersRoutes = require('./routes/users');
const statsRoutes = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 5000;

// Utiliser PostgreSQL en production, SQLite en développement
const { initDatabase } = process.env.NODE_ENV === 'production' 
  ? require('./database-postgres')
  : require('./database');

// Initialiser la base de données
initDatabase().then(() => {
  console.log('Base de données initialisée avec succès');
}).catch(err => {
  console.error('Erreur lors de l\'initialisation de la base de données:', err);
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/calls', callsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/stats', statsRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Étape 5: Configurer Netlify

### 1. Dans votre projet Netlify, aller dans "Site settings"
### 2. Cliquer sur "Environment variables"
### 3. Ajouter :

```
REACT_APP_API_URL=https://votre-api.railway.app/api
```

## Étape 6: Tester la connexion

Votre CRM sera accessible sur :
- **Frontend :** `https://votre-app.netlify.app`
- **API :** `https://votre-api.railway.app/api`

## 💰 Coûts

- **Railway :** Gratuit (500h/mois) → $5/mois pour usage illimité
- **Netlify :** Gratuit pour les projets personnels
- **Total :** Gratuit pour commencer ! 