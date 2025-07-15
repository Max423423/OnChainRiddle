# 🚀 Déploiement Simple

## 📋 Prérequis
- Node.js installé
- Compte MetaMask avec ETH (pour Sepolia)

## 🔧 Installation
```bash
npm install
```

## 🏠 Déploiement Local

### 1. Démarrer le nœud Hardhat
```bash
npx hardhat node
```

### 2. Déployer le contrat
```bash
npx hardhat run deploy.js --network localhost
```

### 3. Copier l'adresse du contrat
Remplace `CONTRACT_ADDRESS` dans `Frontend/src/presentation/components/RiddleGame.tsx`

## 🌐 Déploiement Sepolia

### 1. Configurer les variables d'environnement

**Option A - Copier le fichier d'exemple :**
```bash
cp env.example .env
```

**Option B - Créer manuellement :**
Créer un fichier `.env` avec :
```
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_private_key_here
```

**📋 Variables disponibles :**
- `SEPOLIA_URL` - URL du RPC Sepolia (Infura/Alchemy)
- `PRIVATE_KEY` - Clé privée du compte (sans 0x)
- `ETHERSCAN_API_KEY` - Pour vérifier les contrats (optionnel)
- `GAS_LIMIT` - Limite de gas (optionnel)
- `GAS_PRICE` - Prix du gas en Gwei (optionnel)

### 2. Déployer
```bash
npx hardhat run deploy.js --network sepolia
```

### 3. Mettre à jour le frontend
- Remplacer `CONTRACT_ADDRESS` dans le frontend
- Changer le Chain ID dans MetaMask (11155111)

## 🎯 Test
- Réponse : `keyboard`
- Vérifier que la transaction passe sur le réseau choisi

## 🔒 Sécurité
- **Ne partagez JAMAIS** vos clés privées
- Ajoutez `.env` à votre `.gitignore`
- Utilisez des comptes de test pour le développement
- Vérifiez les URLs avant de les utiliser

## 📚 Ressources
- **ETH de test Sepolia :** https://sepoliafaucet.com/
- **Infura :** https://infura.io/
- **Alchemy :** https://alchemy.com/
- **Etherscan :** https://etherscan.io/ 