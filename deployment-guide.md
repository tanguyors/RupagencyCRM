# 🚀 Guide de déploiement Rupagency CRM

## Option 1: Railway (Recommandé)

### Étape 1: Créer un compte Railway
1. Allez sur [railway.app](https://railway.app)
2. Créez un compte gratuit
3. Connectez-vous avec GitHub

### Étape 2: Créer un projet
1. Cliquez sur "New Project"
2. Choisissez "Deploy from GitHub repo"
3. Sélectionnez votre repository RupagencyCRM

### Étape 3: Ajouter PostgreSQL
1. Dans votre projet Railway, cliquez sur "New"
2. Sélectionnez "Database" → "PostgreSQL"
3. Railway créera automatiquement une base PostgreSQL

### Étape 4: Configurer les variables d'environnement
Railway détectera automatiquement votre `package.json` et configurera :
- `DATABASE_URL` (PostgreSQL)
- `PORT` (pour le serveur)
- `JWT_SECRET` (pour l'authentification)

### Étape 5: Déployer
1. Railway déploiera automatiquement à chaque push sur GitHub
2. Votre API sera accessible sur `https://votre-app.railway.app`

## Option 2: Heroku

### Étape 1: Créer un compte Heroku
1. Allez sur [heroku.com](https://heroku.com)
2. Créez un compte (gratuit pour les petits projets)

### Étape 2: Installer Heroku CLI
```bash
npm install -g heroku
```

### Étape 3: Créer l'application
```bash
heroku create rupagency-crm
heroku addons:create heroku-postgresql:hobby-dev
```

### Étape 4: Configurer les variables
```bash
heroku config:set JWT_SECRET=votre-secret-jwt
heroku config:set NODE_ENV=production
```

### Étape 5: Déployer
```bash
git push heroku main
```

## Option 3: Vercel + Supabase

### Étape 1: Supabase (Base de données)
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un projet gratuit
3. Récupérez l'URL de connexion

### Étape 2: Vercel (Hébergement)
1. Allez sur [vercel.com](https://vercel.com)
2. Connectez votre repository GitHub
3. Configurez les variables d'environnement

## 🔧 Modifications nécessaires

### 1. Modifier database.js pour PostgreSQL
```javascript
// Remplacer SQLite par PostgreSQL
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
```

### 2. Ajouter les dépendances
```bash
npm install pg
npm install dotenv
```

### 3. Créer un script de migration
```javascript
// scripts/migrate.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Créer les tables PostgreSQL
const createTables = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'closer',
        status VARCHAR(50) DEFAULT 'active',
        avatar VARCHAR(10),
        xp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        badges JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    // ... autres tables
  } finally {
    client.release();
  }
};
```

## 🌐 Configuration du frontend

### 1. Modifier l'URL de l'API
```javascript
// src/services/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://votre-app.railway.app/api';
```

### 2. Déployer le frontend
- **Vercel** : Connectez votre repo, déploiement automatique
- **Netlify** : Drag & drop du dossier `build`
- **GitHub Pages** : Action GitHub pour déployer automatiquement

## 💰 Coûts estimés

### Railway (Recommandé)
- **Gratuit** : 500 heures/mois
- **Payant** : $5/mois pour usage illimité

### Heroku
- **Gratuit** : 550 heures/mois (avec carte bancaire)
- **Payant** : $7/mois pour usage illimité

### Supabase
- **Gratuit** : 500MB base + 2GB transfert
- **Payant** : $25/mois pour plus de ressources

## 🔒 Sécurité

### Variables d'environnement à configurer
```bash
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=votre-secret-super-securise
NODE_ENV=production
CORS_ORIGIN=https://votre-frontend.com
```

## 📱 Accès pour vos clients

Une fois déployé, vos clients pourront accéder à :
- **URL** : `https://votre-app.vercel.app`
- **API** : `https://votre-api.railway.app/api`

## 🚀 Déploiement automatique

Configurez GitHub Actions pour déployer automatiquement :

```yaml
# .github/workflows/deploy.yml
name: Deploy to Railway
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: railway/deploy@v1
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
```

## 📞 Support

Pour toute question sur le déploiement, consultez :
- [Documentation Railway](https://docs.railway.app)
- [Documentation Heroku](https://devcenter.heroku.com)
- [Documentation Vercel](https://vercel.com/docs) 