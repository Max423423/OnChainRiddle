# OnchainRiddle Frontend

React frontend for the OnchainRiddle blockchain-based riddle game, built with TypeScript, Vite, and ethers.js.

## Features

- **Wallet Integration**: Connect MetaMask and other Web3 wallets
- **Riddle Display**: View current active riddles
- **Answer Submission**: Submit answers to blockchain smart contracts
- **Real-time Updates**: Live updates when riddles are solved
- **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

- **Node.js** (version 16 or higher)
- **npm** or **yarn**
- **MetaMask** or another Web3 wallet
- **Backend service** running (for AI riddle generation)
- **Blockchain network** (local Hardhat node or testnet)

## Installation

1. Navigate to the Frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment configuration:
   ```bash
   cp env.example .env
   ```

4. Configure your environment variables in `.env`:
   ```env
   # Blockchain contract address
   VITE_CONTRACT_ADDRESS=your_deployed_contract_address
   
   # Backend API URL (optional, for additional features)
   VITE_API_URL=http://localhost:3001
   ```

## Development

### Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Run Tests
```bash
npm test
```

## Project Structure

```
src/
├── infrastructure/
│   └── blockchain/          # Blockchain integration (ethers.js)
├── presentation/
│   ├── components/          # React components
│   ├── hooks/              # Custom React hooks
│   └── pages/              # Page components
└── shared/
    └── types/              # TypeScript type definitions
```

## Architecture

The frontend follows Domain-Driven Design (DDD) principles:

- **Infrastructure Layer**: External services (blockchain, API)
- **Presentation Layer**: React components and UI logic
- **Shared**: Common utilities and types

## Key Components

### RiddleGame
Main component for displaying riddles and handling user interactions.

### useWallet
Custom hook for managing wallet connections and blockchain interactions.

### riddleContract
Service for interacting with the OnchainRiddle smart contract.

## Blockchain Integration

### Smart Contract Interaction
- Uses ethers.js for blockchain communication
- Handles transaction states (pending, success, failure)
- Provides user feedback for blockchain operations

### Wallet Support
- MetaMask integration (tested)
- Wallet connection state management
- Error handling for wallet issues
- Note: Currently tested with MetaMask only, but ethers.js supports other wallets

## Testing

The project uses Vitest and React Testing Library for testing:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:ui
```

### Test Structure
Tests follow the Given-When-Then pattern and are written in English without comments.

## Environment Configuration

### Development
- Uses local Hardhat node (`http://127.0.0.1:8545`)
- Backend service on `http://localhost:3001`

### Production
- Configure contract address for target network
- Set appropriate API endpoints

## Performance

The application is optimized for:
- Fast loading with Vite
- Efficient re-renders with React.memo
- Bundle size optimization
- Lazy loading for routes

## Security

- Input validation for user submissions
- Secure wallet integration
- No sensitive data stored in localStorage
- HTTPS in production

## Deployment

### Build
```bash
npm run build
```

### Environment Variables
Ensure production environment variables are set:
- `VITE_CONTRACT_ADDRESS`
- `VITE_API_URL` 