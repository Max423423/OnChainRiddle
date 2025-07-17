# OnchainRiddle Backend

Node.js backend service for the OnchainRiddle blockchain-based riddle game, implementing Domain-Driven Design (DDD) and Clean Architecture principles.

## Features

- **AI Riddle Generation**: Automatic riddle generation using OpenAI API
- **Blockchain Integration**: Real-time interaction with smart contracts
- **Event Listening**: Automatic winner detection and riddle updates
- **REST API**: HTTP endpoints for frontend integration
- **Automatic Riddle Management**: Generates new riddles when previous ones are solved

## Prerequisites

- **Node.js** (version 16 or higher)
- **npm** or **yarn**
- **OpenAI API Key** (for riddle generation)
- **Ethereum RPC URL** (for blockchain interaction)
- **Private Key** (for blockchain transactions)
- **Smart Contract Address** (deployed OnchainRiddle contract)

## Installation

1. Navigate to the Backend directory:
   ```bash
   cd Backend
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
   # Server configuration
   PORT=3001
   NODE_ENV=development
   
   # OpenAI configuration
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Blockchain configuration
   RPC_URL=http://127.0.0.1:8545
   CONTRACT_ADDRESS=your_deployed_contract_address
   PRIVATE_KEY=your_private_key_here
   ```

## Development

### Start Development Server
```bash
npm run dev
```

The server will be available at `http://localhost:3001`

### Start Production Server
```bash
npm start
```

### Run Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

## Project Structure

```
src/
├── domain/              # Business entities and rules
│   ├── entities/        # Core business entities
│   ├── value-objects/   # Immutable value objects
│   └── repositories/    # Repository interfaces
├── application/         # Use cases and services
│   ├── use-cases/       # Application use cases
│   ├── services/        # Application services
│   └── dto/            # Data Transfer Objects
├── infrastructure/      # External services and technical concerns
│   ├── blockchain/      # Blockchain integration (ethers.js)
│   ├── ai/             # AI service integration (OpenAI)
│   ├── database/       # Database connections and repositories
│   └── logging/        # Logging infrastructure
└── presentation/        # API layer (Express.js)
    ├── controllers/     # Request handlers
    ├── middleware/      # Express middleware
    └── routes/         # API route definitions
```

## Architecture

The backend follows Domain-Driven Design (DDD) and Clean Architecture:

- **Domain Layer**: Core business logic and entities
- **Application Layer**: Use cases and orchestration
- **Infrastructure Layer**: External services and technical concerns
- **Presentation Layer**: API endpoints and controllers

## API Endpoints

### Health Check
```
GET /health
```
Returns server health status.

### API Health Check
```
GET /api/health
```
Returns API health status with service information.

### Get Riddle Status
```
GET /api/status
```
Returns current riddle status (active riddle, winner, etc.).

### Generate New Riddle
```
POST /api/generate-riddle
```
Manually triggers riddle generation (bot only).

### Handle Winner
```
POST /api/handle-winner
```
Manually handles winner event (for testing).

## Key Components

### GenerateRiddleUseCase
Handles the business logic for generating new riddles using AI.

### HandleWinnerUseCase
Manages winner events and triggers new riddle generation.

### EthereumRiddleRepository
Interfaces with the blockchain smart contract for riddle operations.

### OpenAIAIService
Generates riddles using OpenAI's API with fallback to predefined riddles.

## Blockchain Integration

### Smart Contract Events
The backend listens to blockchain events:
- **Winner Events**: Automatically detected when someone solves a riddle
- **Riddle Set Events**: Logged when new riddles are set

### Automatic Riddle Generation
When a winner is detected:
1. Current riddle is marked as solved
2. Winner information is updated
3. New riddle is automatically generated
4. New riddle is set on the blockchain

## AI Integration

### OpenAI Service
- Generates creative riddles using GPT models
- Handles API rate limits and errors
- Falls back to predefined riddles if AI fails

### Riddle Generation Process
1. AI generates riddle and answer
2. Answer is hashed for blockchain storage
3. Riddle is validated and formatted
4. Riddle is set on the blockchain

## Testing

The project uses Jest for testing:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Test Structure
- **Unit Tests**: Business logic and use cases
- **Integration Tests**: API endpoints and blockchain interaction
- **Mock Tests**: External dependencies (AI, blockchain)

## Environment Configuration

### Development
- Local Hardhat node (`http://127.0.0.1:8545`)
- OpenAI API for riddle generation
- Detailed logging

### Production
- Ethereum mainnet or testnet RPC
- Production OpenAI API key
- Optimized logging

## Troubleshooting

### Common Issues

1. **OpenAI API errors**: Check API key and rate limits
2. **Blockchain connection**: Verify RPC URL and network
3. **Contract not found**: Ensure contract address is correct
4. **Private key issues**: Verify private key has sufficient funds

### Development Issues
- **Port already in use**: Change PORT in `.env`
- **Test failures**: Ensure all dependencies are installed
- **Compilation errors**: Check Node.js version compatibility

## Performance

The service is optimized for:
- Efficient blockchain event listening
- Minimal API response times
- Proper error handling and logging
- Memory-efficient operations

## Security

- Environment variables for sensitive data
- Input validation on all endpoints
- Secure blockchain key management
- Error handling without exposing internals

## Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Docker (if applicable)
```bash
docker build -t onchain-riddle-backend .
docker run -p 3001:3001 onchain-riddle-backend
```

### Environment Variables
Ensure production environment variables are set:
- `OPENAI_API_KEY`
- `RPC_URL`
- `CONTRACT_ADDRESS`
- `PRIVATE_KEY`
- `PORT`

## Contributing

1. Create a feature branch from main
2. Write tests first (TDD approach)
3. Implement the feature
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details 