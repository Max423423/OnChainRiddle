# 🎯 OnchainRiddle

A blockchain-based interactive riddle game with AI-powered automatic riddle generation.

## 🏗️ Architecture

This project follows **Domain-Driven Design (DDD)** and **Clean Architecture** principles:

```
on_chain_riddle/
├── Blockchain/          # Smart contracts and deployment
│   └── README.md       # Blockchain setup and deployment guide
├── Frontend/           # React application
│   └── README.md       # Frontend development guide
├── Backend/            # Node.js service
│   └── README.md       # Backend API and integration guide
└── README.md           # This file (project overview)
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (version 16 or higher)
- **npm**
- **MetaMask** or Web3 wallet
- **OpenAI API Key** (for riddle generation)


## 📚 Documentation

Each subproject has its own comprehensive README:

- **[Blockchain/README.md](./Blockchain/README.md)** - Smart contract setup, deployment, and testing
- **[Frontend/README.md](./Frontend/README.md)** - React development, wallet integration, and deployment
- **[Backend/README.md](./Backend/README.md)** - Node.js API, AI integration, and blockchain events

## 🎯 Features

- ✅ **AI-Powered Riddles**: Automatic generation using OpenAI
- ✅ **Blockchain Validation**: Secure answer verification on Ethereum
- ✅ **Real-time Updates**: Live winner detection and riddle updates
- ✅ **Wallet Integration**: MetaMask and Web3 wallet support
- ✅ **Responsive UI**: Modern React interface
- ✅ **DDD Architecture**: Clean, maintainable code structure


## 🚀 Deployment

### Production Environment
The application is deployed on **Railway**, chosen for its seamless CI/CD pipeline and developer-friendly features:

- **🌐 Live Application**: [https://onchainriddle-production.up.railway.app/](https://onchainriddle-production.up.railway.app/)
- **🔗 Smart Contract**: [https://sepolia.etherscan.io/address/0x6ed6aec631938dbc57895466cec0e0d89041095e](https://sepolia.etherscan.io/address/0x6ed6aec631938dbc57895466cec0e0d89041095e)

Railway provides automatic deployments from Git, built-in monitoring, and secure environment variable management - perfect for blockchain applications requiring reliable API endpoints and real-time updates.

For detailed deployment instructions, see each subproject's README:
- **Blockchain**: Deploy to testnet sepolia (eth testnet)
- **Backend**: Deploy to Railway
- **Frontend**: Deploy to Railway

## 🔧 Technologies

- **Blockchain**: Solidity, Hardhat, Ethers.js
- **Frontend**: React, TypeScript, Vite, Ethers.js
- **Backend**: Node.js, Express, OpenAI API
- **Testing**: Jest, Vitest, React Testing Library

