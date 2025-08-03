# Rupagency CRM - CRM SaaS pour Closers

Un CRM moderne et responsive destiné aux closers (cailleurs) en téléprospection, avec une interface fluide et professionnelle orientée business.

## 🚀 Fonctionnalités

### Pour les Closers
- **Dashboard personnalisé** avec aperçu des performances
- **Gestion des entreprises** avec recherche et filtres avancés
- **Fiches d'appel interactives** avec chronométrage automatique
- **Agenda hebdomadaire** avec vue semaine claire
- **Statistiques détaillées** avec graphiques et classements
- **Système de gamification** avec XP, niveaux et badges

### Pour les Administrateurs
- **Vue globale** de toutes les activités
- **Gestion des utilisateurs** et des profils
- **Statistiques d'équipe** avec classements
- **Contenu éditable** (messages "À la une")

## 🛠 Technologies utilisées

- **Frontend**: React 18 + TailwindCSS
- **State Management**: Zustand
- **Routing**: React Router v6
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Date handling**: date-fns

## 📦 Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd RupagencyCRM
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Lancer l'application**
```bash
npm start
```

L'application sera accessible sur `http://localhost:3000`

## 🔐 Comptes de démonstration

### Closer
- **Email**: `thomas@rupagency.com`
- **Mot de passe**: `password123`

### Administrateur
- **Email**: `admin@rupagency.com`
- **Mot de passe**: `password123`

## 📱 Fonctionnalités principales

### 1. Page de Connexion
- Design moderne et responsive
- Authentification sécurisée
- Mode sombre/clair

### 2. Dashboard
- Widgets de performance en temps réel
- Contenu "À la une" éditable (admin)
- RDV du jour et dernières entreprises
- Statistiques rapides

### 3. Gestion des Entreprises
- Formulaire complet d'ajout d'entreprise
- Liste avec recherche temps réel
- Filtres par statut, secteur, ville
- Actions rapides (voir, modifier, supprimer)

### 4. Fiches d'Appel
- Interface interactive pendant l'appel
- Chronométrage automatique
- Types d'appel et résultats prédéfinis
- Création automatique de RDV si "RDV fixé"

### 5. Agenda Hebdomadaire
- Vue semaine interactive
- Navigation entre les semaines
- RDV cliquables avec actions rapides
- Statuts visuels (confirmé, en attente, annulé)

### 6. Statistiques
- Graphiques en barres et camemberts
- Classement des closers
- Métriques de performance
- Système de badges et niveaux

## 🎨 Design System

### Couleurs
- **Mode clair**: Blanc, gris clair, bleu doux, crème
- **Mode sombre**: Gris foncé, bleu nuit
- **Accents**: Vert (succès), Orange (attention), Rouge (erreur)

### Composants
- Boutons avec variantes (primary, secondary, outline, ghost, danger)
- Champs de saisie avec validation
- Cartes avec ombres subtiles
- Navigation latérale avec icônes

## 📊 Structure des données

### Entreprises
- Informations de base (nom, téléphone, adresse)
- Informations légales (SIREN, gérant)
- Informations business (secteur, taille, site web)
- Notes et statut

### Appels
- Type d'appel (Prospection, Contrôle qualité, SAV)
- Résultat (RDV fixé, Rappel, Refus, Pas de réponse)
- Durée et résumé
- Lien vers l'entreprise

### RDV
- Date et heure
- Briefing
- Statut (En attente, Confirmé, Annulé)
- Lien vers l'entreprise

## 🔧 Configuration

### Variables d'environnement
Créez un fichier `.env` à la racine du projet :

```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_APP_NAME=Rupagency CRM
```

### Personnalisation
- Modifiez les couleurs dans `tailwind.config.js`
- Ajustez les données mockées dans `src/data/mockData.js`
- Personnalisez les composants UI dans `src/components/ui/`

## 🚀 Déploiement

### Build de production
```bash
npm run build
```

### Déploiement sur Vercel
```bash
npm install -g vercel
vercel
```

### Déploiement sur Netlify
```bash
npm run build
# Uploader le dossier build/ sur Netlify
```

## 📈 Roadmap

- [ ] Intégration API backend
- [ ] Notifications push
- [ ] Export de données (PDF, Excel)
- [ ] Intégration calendrier externe
- [ ] Mode hors ligne
- [ ] Application mobile (React Native)
- [ ] Intégration CRM externes
- [ ] Système de rapports avancés

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou support :
- Email: support@rupagency.com
- Documentation: [docs.rupagency.com](https://docs.rupagency.com)

---

**Rupagency CRM** - Optimisez vos performances de téléprospection ! 🚀 