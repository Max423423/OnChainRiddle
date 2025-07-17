# OnchainRiddle Smart Contract

This project contains a Solidity smart contract for an on-chain riddle system using Hardhat.

## Features

- **Riddle Management**: Only the bot (deployer) can set new riddles
- **Answer Submission**: Users can submit answers to active riddles
- **Secure Verification**: Answers are verified by hash to prevent cheating
- **Winner Management**: The first user with the correct answer becomes the winner

## Project Structure

```
Blockchain/
├── contracts/
│   └── OnchainRiddle.sol    # Main smart contract
├── scripts/
│   └── deploy.js            # Deployment script
├── test/
│   └── OnchainRiddle.test.js # Smart contract tests
├── hardhat.config.js        # Hardhat configuration
├── hardhat.config.deployment.js # Deployment configuration
├── package.json             # Project dependencies
└── README.md               # This file
```

## Prerequisites

- **Node.js** (version 16 or higher)
- **npm** or **yarn**
- **MetaMask** or another Web3 wallet
- **Ethereum testnet tokens** (for deployment)

## Installation

1. Navigate to the Blockchain directory:
   ```bash
   cd Blockchain
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
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID   
   PRIVATE_KEY=your_private_key_here
   ETHERSCAN_API_KEY=your_etherscan_api_key
   ```

## Setup

### 1. Local Development Setup

For local development and testing:

```bash
# Start a local Hardhat node
npm run node

# In another terminal, deploy to local network
npm run deploy:local
```

The local node will run on `http://127.0.0.1:8545/` with pre-funded accounts.

### 2. MetaMask Configuration

To interact with the local network:

1. Open MetaMask
2. Add a new network:
   - **Network Name**: Hardhat Local
   - **RPC URL**: `http://127.0.0.1:8545/`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`

3. Import one of the test accounts using its private key (available in the Hardhat console output)

### 3. Testnet Setup (Sepolia)

For testing on Sepolia testnet:

1. Get testnet ETH from a faucet:
   - [Sepolia Faucet](https://sepoliafaucet.com/)
   - [Alchemy Faucet](https://sepoliafaucet.com/)

2. Deploy to Sepolia:
   ```bash
   npm run deploy:sepolia
   ```

## Usage

### Compilation
```bash
npm run compile
```

### Testing
```bash
npm run test
```

### Local Deployment
```bash
# Start a local Hardhat node
npm run node

# In another terminal, deploy the contract
npm run deploy:local
```

### Testnet Deployment
```bash
npm run deploy:sepolia
```

## Deployment

### Local Development
```bash
# Terminal 1: Start local node
npm run node

# Terminal 2: Deploy contract
npm run deploy:local
```

### Sepolia Testnet
```bash
npm run deploy:sepolia
```

### Mainnet (Production)
```bash
# Ensure you have sufficient ETH for deployment
npm run deploy:mainnet
```

### Deployment Verification

After deployment, verify your contract on Etherscan:

1. Go to [Etherscan](https://etherscan.io/) (or Sepolia Etherscan for testnet)
2. Search for your contract address
3. Click "Contract" tab
4. Click "Verify and Publish"
5. Fill in the contract details and source code

## Smart Contract Functions

### `setRiddle(string memory _riddle, bytes32 _answerHash)`
- **Caller**: Only the bot (deployer)
- **Function**: Sets a new riddle with its answer hash
- **Parameters**:
  - `_riddle`: The riddle text
  - `_answerHash`: The Keccak256 hash of the correct answer

### `submitAnswer(string memory _answer)`
- **Caller**: Any user
- **Function**: Submits an answer to the active riddle
- **Parameters**:
  - `_answer`: The answer submitted by the user

## Events

- `RiddleSet(string riddle)`: Emitted when a new riddle is set
- `AnswerAttempt(address indexed user, bool correct)`: Emitted on each answer attempt
- `Winner(address indexed user)`: Emitted when a user finds the correct answer

## Public Variables

- `bot`: Address of the bot (deployer)
- `riddle`: Text of the current riddle
- `winner`: Address of the winner (if solved)
- `isActive`: Boolean indicating if a riddle is active

## Usage Example

```javascript
// Generate hash for an answer
const answer = "keyboard";
const answerHash = ethers.keccak256(ethers.toUtf8Bytes(answer));

// Set a riddle (only the bot)
await contract.setRiddle("What has keys but no locks?", answerHash);

// Submit an answer (any user)
await contract.submitAnswer("keyboard");
```

## Security Features

- Only the "bot" can set new riddles
- Answers are verified by hash to prevent cheating
- Only one riddle can be active at a time
- The first user with the correct answer becomes the winner

## Testing

The project includes comprehensive tests covering:
- Contract deployment
- Riddle setting (bot-only access)
- Answer submission and validation
- Winner determination
- Security checks and access controls

Run tests with:
```bash
npm run test
```

## Development

### Adding New Tests
Tests are located in `test/OnchainRiddle.test.js`. Follow the existing pattern to add new test cases.
