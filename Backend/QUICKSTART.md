# 🚀 Quick Start Guide - OnchainRiddle Backend

This guide will help you quickly deploy the automatic riddle generation service.

## Prerequisites

- Node.js 18+ installed
- An Ethereum wallet with funds (to pay for transactions)
- An OpenAI API key
- A deployed OnchainRiddle contract

## Express Installation (5 minutes)

### 1. Install dependencies
```bash
cd Backend
npm install
```

### 2. Automatic configuration
```bash
npm run setup
```

The script will ask for:
- **Bot wallet private key** : The private key of the wallet that will be the contract bot
- **Contract address** : The address of your deployed OnchainRiddle contract
- **RPC URL** : Your Ethereum endpoint (Infura, Alchemy, etc.)
- **OpenAI API key** : Your key for generating riddles
- **Port** : Server port (default: 3001)

### 3. Start the service
```bash
npm run dev
```

## Verification

### Health test
```bash
curl http://localhost:3001/health
```
Expected response: `{"status":"OK","timestamp":"..."}`

### System status
```bash
curl http://localhost:3001/status
```
Expected response: `{"isActive":true,"currentRiddle":"...","winner":null,"isProcessing":false}`

## Complete Test

1. **Start the service** : `npm run dev`
2. **Check that it works** : `curl http://localhost:3001/health`
3. **Solve the current riddle** via your frontend
4. **Observe the logs** : The service should automatically generate a new riddle
5. **Check the new riddle** : `curl http://localhost:3001/status`

## Logs

Follow logs in real time:
```bash
tail -f logs/combined.log
```

## Troubleshooting

### Error "Only bot can call this function"
- Check that the private key matches the contract bot
- Make sure the contract was deployed with this address as bot

### Error "Failed to generate riddle with AI"
- Check your OpenAI API key
- Make sure you have credits on your OpenAI account

### RPC connection error
- Check your RPC URL
- Test connectivity: `curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' YOUR_RPC_URL`

## Production

To deploy in production:

```bash
# Install PM2
npm install -g pm2

# Start the service
pm2 start src/main.js --name "onchain-riddle-backend"

# Save configuration
pm2 save

# Configure automatic startup
pm2 startup
```

## Support

In case of problems, check:
1. Logs in `logs/error.log`
2. Configuration in `.env`
3. Network connectivity
4. Bot wallet funds 