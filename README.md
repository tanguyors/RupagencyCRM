# Rupagency CRM

CRM SaaS moderne pour closers en téléprospection avec base de données réelle.

## 🚀 Fonctionnalités

- **Gestion des entreprises** : Ajout, modification, suppression et recherche d'entreprises
- **Gestion des appels** : Planification et suivi des appels de prospection
- **Gestion des rendez-vous** : Création et suivi des rendez-vous clients
- **Gestion des utilisateurs** : Système d'authentification et gestion des rôles
- **Statistiques** : Tableaux de bord avec métriques de performance
- **Interface moderne** : Design responsive avec thème sombre/clair
- **Base de données réelle** : SQLite avec API REST complète

## 🛠️ Installation

### Prérequis

- Node.js (version 14 ou supérieure)
- npm ou yarn

### Installation des dépendances

```bash
npm install
```

### Configuration

1. Créez un fichier `.env` à la racine du projet :

```env
REACT_APP_API_URL=http://localhost:5000/api
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### Démarrage

#### Mode développement (Frontend + Backend)

```bash
npm run dev
```

Cette commande démarre simultanément :
- Le serveur backend sur le port 5000
- L'application React sur le port 3000

#### Démarrage séparé

**Backend uniquement :**
```bash
npm run server
```

**Frontend uniquement :**
```bash
npm start
```

## 📊 Base de données

Le système utilise SQLite comme base de données. La base de données est automatiquement créée lors du premier démarrage avec des données d'exemple.

### Structure de la base de données

- **users** : Utilisateurs du système (closers, admin)
- **companies** : Entreprises prospectées
- **calls** : Appels de prospection
- **appointments** : Rendez-vous clients

### Données initiales

Le système est pré-configuré avec :

**Utilisateurs de test :**
- Email: `thomas@rupagency.com` / Mot de passe: `password123`
- Email: `sophie@rupagency.com` / Mot de passe: `password123`
- Email: `admin@rupagency.com` / Mot de passe: `password123`

## 🔐 Authentification

Le système utilise JWT (JSON Web Tokens) pour l'authentification. Les tokens sont stockés dans le localStorage et renouvelés automatiquement.

## 📱 API REST

### Endpoints principaux

- `POST /api/auth/login` - Connexion
- `GET /api/auth/verify` - Vérification du token

- `GET /api/companies` - Liste des entreprises
- `POST /api/companies` - Créer une entreprise
- `PUT /api/companies/:id` - Modifier une entreprise
- `DELETE /api/companies/:id` - Supprimer une entreprise

- `GET /api/calls` - Liste des appels
- `POST /api/calls` - Créer un appel
- `PUT /api/calls/:id` - Modifier un appel
- `DELETE /api/calls/:id` - Supprimer un appel

- `GET /api/appointments` - Liste des rendez-vous
- `POST /api/appointments` - Créer un rendez-vous
- `PUT /api/appointments/:id` - Modifier un rendez-vous
- `DELETE /api/appointments/:id` - Supprimer un rendez-vous

- `GET /api/users` - Liste des utilisateurs
- `POST /api/users` - Créer un utilisateur
- `PUT /api/users/:id` - Modifier un utilisateur
- `DELETE /api/users/:id` - Supprimer un utilisateur

- `GET /api/stats` - Statistiques globales
- `GET /api/stats/user/:id` - Statistiques par utilisateur
- `GET /api/stats/monthly` - Statistiques mensuelles

## 🎨 Interface utilisateur

### Thèmes
- Mode clair/sombre
- Interface responsive
- Composants modernes avec Tailwind CSS

### Navigation
- Dashboard avec statistiques
- Gestion des entreprises
- Gestion des appels
- Gestion des rendez-vous
- Administration des utilisateurs

## 🔧 Développement

### Structure du projet

```
RupagencyCRM/
├── server/                 # Backend Express.js
│   ├── routes/            # Routes API
│   ├── database.js        # Configuration SQLite
│   └── index.js           # Serveur principal
├── src/                   # Frontend React
│   ├── components/        # Composants réutilisables
│   ├── pages/            # Pages de l'application
│   ├── services/         # Services API
│   ├── store/            # Store Zustand
│   └── contexts/         # Contextes React
└── public/               # Fichiers statiques
```

### Technologies utilisées

**Backend :**
- Express.js
- SQLite3
- JWT pour l'authentification
- bcryptjs pour le hashage des mots de passe

**Frontend :**
- React 18
- Zustand pour la gestion d'état
- React Router pour la navigation
- Tailwind CSS pour le styling
- Lucide React pour les icônes

## 🚀 Déploiement

### Production

1. Build de l'application :
```bash
npm run build
```

2. Le serveur Express sert automatiquement les fichiers statiques du build

3. Configuration des variables d'environnement pour la production

### Variables d'environnement

- `PORT` : Port du serveur (défaut: 5000)
- `JWT_SECRET` : Clé secrète pour les JWT
- `REACT_APP_API_URL` : URL de l'API (frontend)

## 📝 Licence

Ce projet est sous licence MIT.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request. 