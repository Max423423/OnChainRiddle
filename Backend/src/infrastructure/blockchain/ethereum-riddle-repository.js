const { ethers } = require('ethers');
const RiddleRepository = require('../../domain/repositories/riddle-repository');
const Riddle = require('../../domain/entities/riddle');
const RiddleId = require('../../domain/value-objects/riddle-id');
const logger = require('../logging/winston-logger');

class EthereumRiddleRepository extends RiddleRepository {
  constructor(provider, contractAddress, privateKey) {
    super();
    // Force IPv4 connection for localhost
    const providerUrl = provider.replace('localhost', '127.0.0.1');
    this._provider = new ethers.JsonRpcProvider(providerUrl);
    this._wallet = new ethers.Wallet(privateKey, this._provider);
    this._contractAddress = contractAddress;
    this._contract = this._createContract();
    this._currentRiddle = null;
  }

  _createContract() {
    const abi = [
      "function riddle() external view returns (string memory)",
      "function submitAnswer(string memory _answer) external",
      "function winner() external view returns (address)",
      "function isActive() external view returns (bool)",
      "function bot() external view returns (address)",
      "function setRiddle(string memory _riddle, bytes32 _answerHash) external",
      "event Winner(address indexed user)",
      "event RiddleSet(string riddle)"
    ];

    return new ethers.Contract(this._contractAddress, abi, this._wallet);
  }

  async save(riddle) {
    try {
      logger.info(`Saving riddle to blockchain: ${riddle.question}`);
      
      const answerHash = ethers.keccak256(ethers.toUtf8Bytes(riddle.answer));
      const tx = await this._contract.setRiddle(riddle.question, answerHash);
      await tx.wait();
      
      this._currentRiddle = riddle;
      logger.info('Riddle saved to blockchain successfully');
      
      return riddle;
    } catch (error) {
      logger.error('Error saving riddle to blockchain:', error);
      throw new Error(`Failed to save riddle to blockchain: ${error.message}`);
    }
  }

  async findById(id) {
    // For blockchain implementation, we only have one active riddle at a time
    const activeRiddle = await this.findActive();
    if (activeRiddle && activeRiddle.id === id) {
      return activeRiddle;
    }
    return null;
  }

  async findActive() {
    try {
      logger.info('Checking if contract is accessible...');
      
      // First, let's check if we can call basic functions
      try {
        const bot = await this._contract.bot();
        logger.info(`Contract bot address: ${bot}`);
      } catch (error) {
        logger.error('Error calling bot() function:', error);
        throw new Error(`Contract not accessible or wrong ABI: ${error.message}`);
      }

      // Try to call isActive with more detailed error handling
      let isActive;
      try {
        isActive = await this._contract.isActive();
        logger.info(`isActive result: ${isActive}`);
      } catch (error) {
        logger.error('Error calling isActive():', error);
        // Try alternative approach - call the contract directly
        try {
          const data = await this._provider.call({
            to: this._contractAddress,
            data: '0x1626ba7e' // isActive() function selector
          });
          logger.info(`Raw isActive data: ${data}`);
          isActive = data === '0x0000000000000000000000000000000000000000000000000000000000000001';
        } catch (rawError) {
          logger.error('Error with raw call:', rawError);
          throw new Error(`Failed to check if riddle is active: ${error.message}`);
        }
      }

      if (!isActive) {
        logger.info('No active riddle found');
        return null;
      }

      const question = await this._contract.riddle();
      const winner = await this._contract.winner();
      
      logger.info(`Active riddle found - Question: ${question}, Winner: ${winner}`);
      
      if (!this._currentRiddle) {
        // Create a placeholder riddle entity for the active blockchain riddle
        this._currentRiddle = new Riddle(
          RiddleId.generate().value,
          question,
          'unknown', // We don't store the answer in the blockchain
          true,
          winner !== ethers.ZeroAddress ? winner : null
        );
      } else {
        this._currentRiddle._question = question;
        this._currentRiddle._winner = winner !== ethers.ZeroAddress ? winner : null;
        this._currentRiddle._isActive = true;
      }

      return this._currentRiddle;
    } catch (error) {
      logger.error('Error finding active riddle:', error);
      throw new Error(`Failed to find active riddle: ${error.message}`);
    }
  }

  async findLatest() {
    return await this.findActive();
  }

  async update(riddle) {
    // For blockchain implementation, updates are handled through events
    // We just update our local reference
    this._currentRiddle = riddle;
    return riddle;
  }

  async delete(id) {
    // Not supported in blockchain implementation
    throw new Error('Delete operation not supported for blockchain repository');
  }

  async listenToWinnerEvents(callback) {
    try {
      logger.info('Setting up winner event listener');
      
      this._contract.on('Winner', async (winner, event) => {
        logger.info(`Winner event detected: ${winner}`);
        await callback(winner, event);
      });
      
      logger.info('Winner event listener started');
    } catch (error) {
      logger.error('Error setting up winner event listener:', error);
      throw error;
    }
  }

  async listenToRiddleSetEvents(callback) {
    try {
      logger.info('Setting up RiddleSet event listener');
      
      this._contract.on('RiddleSet', async (riddle, event) => {
        logger.info(`RiddleSet event detected: ${riddle}`);
        await callback(riddle, event);
      });
      
      logger.info('RiddleSet event listener started');
    } catch (error) {
      logger.error('Error setting up RiddleSet event listener:', error);
      throw error;
    }
  }

  async stopListening() {
    try {
      this._contract.removeAllListeners();
      logger.info('Stopped listening to contract events');
    } catch (error) {
      logger.error('Error stopping event listeners:', error);
    }
  }
}

module.exports = EthereumRiddleRepository; 