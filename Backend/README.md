# OnchainRiddle Backend

Backend service for automatic riddle generation with AI and blockchain integration.

## Features

- 🧠 AI-powered riddle generation (OpenAI + fallback)
- ⛓️ Ethereum smart contract integration
- 🔄 Automatic new riddle generation when solved
- 📡 REST API for monitoring and control
- 📝 Structured logging with Winston

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp env.example .env
```

3. Configure environment variables in `.env`:
```env
# Blockchain
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=your_contract_address_here
RPC_URL=http://127.0.0.1:8545

# AI
OPENAI_API_KEY=your_openai_api_key_here

# Server
PORT=3001
NODE_ENV=development
```

## Usage

### Starting the service
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### API Endpoints

- `GET /health` - Service health check
- `GET /status` - Current riddle and contract status
- `POST /generate-riddle` - Manual generation of a new riddle

### Usage examples

```bash
# Check service health
curl http://localhost:3001/health

# Get current status
curl http://localhost:3001/status

# Manually generate a new riddle
curl -X POST http://localhost:3001/generate-riddle
```

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Smart Contract│    │   Backend Service│    │   OpenAI API    │
│                 │    │   (Node.js)      │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │ Event: Winner         │                       │
         │──────────────────────▶│                       │
         │                       │ Generate new riddle   │
         │                       │──────────────────────▶│
         │                       │                       │
         │                       │◀──────────────────────│
         │                       │ Riddle + Answer       │
         │                       │                       │
         │◀──────────────────────│                       │
         │ setRiddle()           │                       │
```

## Configuration

### Required environment variables

- `PRIVATE_KEY` : Bot wallet private key (must be the contract bot)
- `CONTRACT_ADDRESS` : Deployed OnchainRiddle contract address
- `RPC_URL` : Ethereum RPC URL (Infura, Alchemy, etc.)
- `OPENAI_API_KEY` : OpenAI API key for riddle generation

### Security

⚠️ **Important** : The private key must match the bot address defined in the smart contract.

## Logs

Logs are stored in the `logs/` folder:
- `error.log` : Errors only
- `combined.log` : All logs

## Deployment

### Docker (optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### PM2 (recommended for production)

```bash
npm install -g pm2
pm2 start src/index.js --name "onchain-riddle-backend"
pm2 save
pm2 startup
```

## Monitoring

The service exposes several endpoints for monitoring:

- `/health` : Simple health check
- `/status` : Detailed system status
- Structured logs with Winston

## Troubleshooting

### Common errors

1. **"Only bot can call this function"** : Check that the private key matches the contract bot
2. **"Failed to generate riddle with AI"** : Check your OpenAI API key
3. **"Contract call timeout"** : Check your RPC_URL and network connectivity

### Useful logs

```bash
# Follow logs in real time
tail -f logs/combined.log

# View errors only
tail -f logs/error.log
``` 