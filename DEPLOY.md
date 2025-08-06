# 🚀 Déploiement rapide sur Railway

## Étape 1: Préparer votre projet

1. **Installer les dépendances PostgreSQL**
```bash
npm install pg dotenv
```

2. **Créer un repository GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/votre-username/RupagencyCRM.git
git push -u origin main
```

## Étape 2: Déployer sur Railway

1. **Aller sur [Railway.app](https://railway.app)**
2. **Se connecter avec GitHub**
3. **Créer un nouveau projet**
4. **Choisir "Deploy from GitHub repo"**
5. **Sélectionner votre repository RupagencyCRM**

## Étape 3: Configurer la base de données

1. **Dans votre projet Railway, cliquer sur "New"**
2. **Sélectionner "Database" → "PostgreSQL"**
3. **Railway créera automatiquement une base PostgreSQL**

## Étape 4: Configurer les variables d'environnement

Dans les paramètres de votre projet Railway, ajouter :

```
NODE_ENV=production
JWT_SECRET=votre-secret-jwt-super-securise
CORS_ORIGIN=https://votre-frontend.vercel.app
```

## Étape 5: Modifier le serveur pour PostgreSQL

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
app.use(express.static(path.join(__dirname, '../build')));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/calls', callsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/stats', statsRoutes);

// Serve React app for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Étape 6: Déployer le frontend sur Vercel

1. **Aller sur [Vercel.com](https://vercel.com)**
2. **Se connecter avec GitHub**
3. **Importer votre repository**
4. **Configurer les variables d'environnement :**
   ```
   REACT_APP_API_URL=https://votre-api.railway.app/api
   ```

## Étape 7: Tester votre déploiement

Votre CRM sera accessible sur :
- **Frontend :** `https://votre-app.vercel.app`
- **API :** `https://votre-api.railway.app/api`

## 🔧 Commandes utiles

```bash
# Voir les logs Railway
railway logs

# Ouvrir le projet Railway
railway open

# Déployer manuellement
railway up

# Voir les variables d'environnement
railway variables
```

## 💰 Coûts

- **Railway :** Gratuit (500h/mois) → $5/mois pour usage illimité
- **Vercel :** Gratuit pour les projets personnels

## 🆘 Support

- [Documentation Railway](https://docs.railway.app)
- [Documentation Vercel](https://vercel.com/docs)
- [Forum Railway](https://community.railway.app) 