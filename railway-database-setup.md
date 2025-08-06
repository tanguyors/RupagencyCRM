# 🗄️ Guide Visuel : Ajouter PostgreSQL sur Railway

## 🔍 **Méthodes alternatives pour trouver l'option**

### **Méthode 1 : Via le Dashboard Principal**

1. **Allez sur [Railway.app](https://railway.app)**
2. **Connectez-vous à votre compte**
3. **Dans votre projet RupagencyCRM, cherchez :**
   - Un bouton **"New"** ou **"Add"** en haut à droite
   - Un bouton **"Deploy"** avec un menu déroulant
   - Un bouton **"Create"** ou **"Start"**

### **Méthode 2 : Via le Menu Services**

1. **Dans votre projet, cherchez un onglet "Services"**
2. **Ou un menu latéral avec "Services"**
3. **Cliquez sur "Add Service" ou "New Service"**

### **Méthode 3 : Interface Alternative**

1. **Cherchez un bouton "Deploy from template"**
2. **Ou "Start a new project"**
3. **Sélectionnez "Database" dans les options**

### **Méthode 4 : Si rien ne fonctionne**

1. **Allez dans les paramètres du projet**
2. **Cherchez "Resources" ou "Add Resource"**
3. **Ou "Infrastructure" → "Add Database"**

## 🎯 **Une fois que vous avez trouvé l'option :**

### **Étape 1 : Sélectionner PostgreSQL**
- Choisissez **"Database"** ou **"PostgreSQL"**
- Ou **"Add Database"** → **"PostgreSQL"**

### **Étape 2 : Configuration automatique**
- Railway va créer automatiquement une base PostgreSQL
- Notez la **DATABASE_URL** qui sera générée

### **Étape 3 : Récupérer les variables**
1. **Cliquez sur votre service PostgreSQL**
2. **Allez dans l'onglet "Variables"**
3. **Copiez la variable `DATABASE_URL`**

## 🔧 **Configuration des variables d'environnement**

Dans votre service d'application (RupagencyCRM), ajoutez :

```env
# Base de données (remplacez par votre DATABASE_URL)
DATABASE_URL=postgresql://postgres:password@containers-us-west-XX.railway.app:XXXX/railway
NODE_ENV=production

# JWT
JWT_SECRET=votre-secret-jwt-super-securise

# CORS
CORS_ORIGIN=https://votre-app.railway.app

# API
REACT_APP_API_URL=https://votre-app.railway.app/api
```

## 🆘 **Si vous ne trouvez toujours pas l'option :**

### **Alternative 1 : Créer un nouveau projet**
1. **Créez un nouveau projet Railway**
2. **Choisissez "Deploy from template"**
3. **Sélectionnez "PostgreSQL"**

### **Alternative 2 : Utiliser Supabase**
1. **Allez sur [Supabase.com](https://supabase.com)**
2. **Créez un projet gratuit**
3. **Récupérez la DATABASE_URL**
4. **Configurez les variables d'environnement**

### **Alternative 3 : Utiliser Railway CLI**
```bash
# Installer Railway CLI
npm install -g @railway/cli

# Se connecter
railway login

# Créer un service PostgreSQL
railway service create postgresql
```

## 📞 **Support Railway**

Si vous ne trouvez toujours pas :
1. **Allez sur [Railway Discord](https://discord.gg/railway)**
2. **Ou contactez le support : support@railway.app**
3. **Ou utilisez la documentation : docs.railway.app**

---

**💡 Conseil :** L'interface Railway peut changer, mais l'option pour ajouter une base de données est toujours présente. Cherchez les mots-clés : "New", "Add", "Create", "Database", "PostgreSQL". 