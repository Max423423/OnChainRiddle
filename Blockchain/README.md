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
├── package.json             # Project dependencies
└── README.md               # This file
```

## Installation

1. Make sure you have Node.js installed (version 16 or higher)
2. Install dependencies:
   ```bash
   npm install
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
npm run deploy
```

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

- Only the bot can set new riddles
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

## Development

### Adding New Tests
Tests are located in `test/OnchainRiddle.test.js`. Follow the existing pattern to add new test cases.

### Contract Modifications
When modifying the smart contract, ensure to:
1. Update tests accordingly
2. Test all scenarios including edge cases
3. Verify security constraints are maintained

## Troubleshooting

### Common Issues

1. **Node.js not found**: Install Node.js from https://nodejs.org/
2. **Hardhat not found**: Run `npm install` in the Blockchain directory
3. **Compilation errors**: Check Solidity version compatibility in `hardhat.config.js`

### Test Failures
If tests fail, check:
- Solidity compiler version compatibility
- Network configuration in `hardhat.config.js`
- Test environment setup

## License

MIT License - see LICENSE file for details 