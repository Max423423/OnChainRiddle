# 🎯 OnchainRiddle

Un jeu d'énigmes interactif basé sur la blockchain avec génération automatique d'énigmes par IA.

## 🏗️ Architecture

Le projet suit les principes de **Domain-Driven Design (DDD)** et **Clean Architecture** :

```
OnchainRiddle/
├── Blockchain/          # Smart contracts Solidity
├── Frontend/           # Application React + Vite
├── Backend/            # Service Node.js + Express
└── DEPLOYMENT.md       # Guide de déploiement
```

## 🚀 Technologies

- **Blockchain** : Solidity, Hardhat, Ethers.js
- **Frontend** : React, TypeScript, Vite, Ethers.js
- **Backend** : Node.js, Express, OpenAI API
- **Déploiement** : Railway

## 📋 Prérequis

- Node.js 18+
- MetaMask
- Compte Alchemy (pour Sepolia)
- Clé API OpenAI

## 🔧 Installation

### 1. Cloner le repository
```bash
git clone <repository-url>
cd on_chain_riddle
```

### 2. Installer les dépendances
```bash
# Frontend
cd Frontend
npm install

# Backend
cd ../Backend
npm install

# Blockchain
cd ../Blockchain
npm install
```

### 3. Configuration

#### Frontend
```bash
cd Frontend
cp env.example .env
# Éditer .env avec tes valeurs
```

#### Backend
```bash
cd Backend
cp env.example .env
# Éditer .env avec tes valeurs
```

#### Blockchain
```bash
cd Blockchain
cp env.example .env
# Éditer .env avec tes valeurs
```

## 🎮 Utilisation

### Développement local

#### Frontend
```bash
cd Frontend
npm run dev
```

#### Backend
```bash
cd Backend
npm run dev
```

#### Blockchain (déploiement local)
```bash
cd Blockchain
npx hardhat node
npx hardhat run deploy.js --network localhost
```

### Tests

#### Frontend
```bash
cd Frontend
npm test
```

#### Backend
```bash
cd Backend
npm test
```

#### Blockchain
```bash
cd Blockchain
npx hardhat test
```

## 🌐 Déploiement

Voir [DEPLOYMENT.md](./DEPLOYMENT.md) pour le guide complet de déploiement sur Railway.

## 🎯 Fonctionnalités

- ✅ Génération automatique d'énigmes par IA
- ✅ Validation des réponses sur la blockchain
- ✅ Interface utilisateur moderne
- ✅ Connexion MetaMask
- ✅ Countdown automatique
- ✅ Gestion des gagnants
- ✅ Architecture DDD

## 📁 Structure du code

### Frontend (React + Vite)
```
Frontend/src/
├── domain/           # Logique métier
├── application/      # Cas d'usage
├── infrastructure/   # Services externes
└── presentation/     # Composants UI
```

### Backend (Node.js + Express)
```
Backend/src/
├── domain/           # Entités et règles métier
├── application/      # Cas d'usage
├── infrastructure/   # Services externes
└── presentation/     # Contrôleurs et routes
```

### Blockchain (Solidity)
```
Blockchain/
├── contracts/        # Smart contracts
├── scripts/          # Scripts de déploiement
└── test/            # Tests des contrats
```

## 🔒 Sécurité

- Validation des adresses Ethereum
- Gestion sécurisée des clés privées
- Variables d'environnement pour les secrets
- Tests automatisés

## 🤝 Contribution

1. Fork le projet
2. Crée une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit tes changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvre une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Crée une issue sur GitHub
- Consulte la documentation dans chaque dossier
- Vérifie les logs de déploiement sur Railway
