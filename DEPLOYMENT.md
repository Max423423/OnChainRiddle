# 🚀 Déploiement OnchainRiddle sur Railway

## 📋 Prérequis

1. **Compte Railway** : [railway.app](https://railway.app)
2. **Compte GitHub** : Pour connecter le repository
3. **Clé API Alchemy** : Pour Sepolia testnet
4. **Clé API OpenAI** : Pour la génération d'énigmes
5. **Contrat déployé** : Sur Sepolia testnet

## 🔧 Étapes de déploiement

### 1. **Déployer le Backend**

1. **Connecter le repository GitHub**
   - Va sur [railway.app](https://railway.app)
   - Clique sur "New Project"
   - Choisis "Deploy from GitHub repo"
   - Sélectionne ton repository `on_chain_riddle`

2. **Configurer le service Backend**
   - Choisis le dossier `Backend/`
   - Railway détectera automatiquement Node.js

3. **Configurer les variables d'environnement**
   ```
   PORT=3001
   RPC_URL=https://eth-sepolia.g.alchemy.com/v2/TON_ALCHEMY_API_KEY
   CONTRACT_ADDRESS=TON_CONTRACT_ADDRESS_DEPLOYE
   PRIVATE_KEY=TA_CLE_PRIVEE_SANS_0x
   OPENAI_API_KEY=TON_OPENAI_API_KEY
   NODE_ENV=production
   ```

4. **Déployer**
   - Railway va automatiquement construire et déployer
   - Note l'URL générée (ex: `https://backend-abc123.railway.app`)

### 2. **Déployer le Frontend**

1. **Créer un nouveau service**
   - Dans le même projet Railway
   - Clique sur "New Service" > "GitHub Repo"
   - Sélectionne le dossier `Frontend/`

2. **Configurer les variables d'environnement**
   ```
   REACT_APP_BACKEND_URL=https://backend-abc123.railway.app
   REACT_APP_CONTRACT_ADDRESS=TON_CONTRACT_ADDRESS_DEPLOYE
   REACT_APP_CHAIN_ID=11155111
   REACT_APP_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/TON_ALCHEMY_API_KEY
   NODE_ENV=production
   ```

3. **Déployer**
   - Railway va construire l'app React
   - Note l'URL générée (ex: `https://frontend-xyz789.railway.app`)

## 🔍 Vérification

### Backend Health Check
```bash
curl https://backend-abc123.railway.app/api/health
```

### Frontend Access
- Ouvre l'URL du frontend dans ton navigateur
- Connecte MetaMask au réseau Sepolia
- Teste la résolution d'énigme

## 📊 Monitoring

### Logs Railway
- Va dans l'onglet "Deployments" de chaque service
- Clique sur "View Logs" pour voir les logs en temps réel

### Métriques
- Railway fournit des métriques automatiques
- CPU, mémoire, requêtes par minute

## 🔧 Configuration avancée

### Domaine personnalisé
1. Va dans les paramètres du service
2. Onglet "Domains"
3. Ajoute ton domaine personnalisé

### Variables d'environnement par environnement
- Railway supporte les environnements (dev, staging, prod)
- Configure des variables différentes par environnement

## 🚨 Dépannage

### Backend ne démarre pas
- Vérifie les logs Railway
- Vérifie que toutes les variables d'environnement sont définies
- Vérifie que le contrat est bien déployé sur Sepolia

### Frontend ne se connecte pas au backend
- Vérifie `REACT_APP_BACKEND_URL` dans les variables d'environnement
- Vérifie que le backend répond sur `/api/health`

### Erreurs CORS
- Le backend est configuré avec CORS activé
- Si problème, vérifie les logs du backend

## 💰 Coûts

- **Gratuit** : 500 heures/mois par service
- **Payant** : $5/mois par service après la limite gratuite
- **Base de données** : $5/mois si nécessaire

## 🔄 Mise à jour

Pour mettre à jour l'application :
1. Push tes changements sur GitHub
2. Railway déploiera automatiquement
3. Ou déclenche un déploiement manuel depuis l'interface Railway

## 📞 Support

- **Railway Docs** : [docs.railway.app](https://docs.railway.app)
- **Railway Discord** : [discord.gg/railway](https://discord.gg/railway) 