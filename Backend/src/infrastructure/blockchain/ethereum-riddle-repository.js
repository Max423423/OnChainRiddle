const { ethers } = require('ethers');
const RiddleRepository = require('../../domain/repositories/riddle-repository');
const Riddle = require('../../domain/entities/riddle');
const RiddleId = require('../../domain/value-objects/riddle-id');
const logger = require('../logging/winston-logger');

class SimpleRiddleRepository extends RiddleRepository {
  constructor(provider, contractAddress, privateKey) {
    super();
    // Force IPv4 connection for localhost
    const providerUrl = provider.replace('localhost', '127.0.0.1');
    this._provider = new ethers.JsonRpcProvider(providerUrl);
    this._wallet = new ethers.Wallet(privateKey, this._provider);
    this._contract = new ethers.Contract(contractAddress, this._getABI(), this._wallet);
    this._currentRiddle = null;
  }

  _getABI() {
    return [
      "function riddle() external view returns (string memory)",
      "function submitAnswer(string memory _answer) external",
      "function winner() external view returns (address)",
      "function isActive() external view returns (bool)",
      "function bot() external view returns (address)",
      "function setRiddle(string memory _riddle, bytes32 _answerHash) external",
      "event Winner(address indexed user)",
      "event RiddleSet(string riddle)"
    ];
  }

  async save(riddle) {
    try {
      const answerHash = ethers.keccak256(ethers.toUtf8Bytes(riddle.answer));
      const tx = await this._contract.setRiddle(riddle.question, answerHash);
      await tx.wait();
      
      this._currentRiddle = riddle;
      logger.info('Riddle saved to blockchain', { question: riddle.question.substring(0, 50) + '...' });
      
      return riddle;
    } catch (error) {
      logger.error('Failed to save riddle to blockchain', { error: error.message });
      throw new Error(`Failed to save riddle: ${error.message}`);
    }
  }

  async findActive() {
    try {
      const isActive = await this._contract.isActive();
      if (!isActive) return null;

      const question = await this._contract.riddle();
      const winner = await this._contract.winner();
      
      if (!this._currentRiddle) {
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
      logger.error('Failed to find active riddle', { error: error.message });
      return null;
    }
  }

  async findById(id) {
    const activeRiddle = await this.findActive();
    return activeRiddle && activeRiddle.id === id ? activeRiddle : null;
  }

  async findLatest() {
    return await this.findActive();
  }

  async update(riddle) {
    this._currentRiddle = riddle;
    return riddle;
  }

  async delete(id) {
    throw new Error('Delete operation not supported for blockchain repository');
  }

  async listenToWinnerEvents(callback) {
    try {
      this._contract.on('Winner', async (winner, event) => {
        try {
          logger.info('Winner event detected', { winner });
          await callback(winner, event);
        } catch (error) {
          logger.error('Error in Winner event callback', { error: error.message });
        }
      });
    } catch (error) {
      logger.error('Failed to set up Winner event listener', { error: error.message });
      throw error;
    }
  }

  async listenToRiddleSetEvents(callback) {
    try {
      this._contract.on('RiddleSet', async (riddle, event) => {
        try {
          logger.info('RiddleSet event detected', { riddle });
          await callback(riddle, event);
        } catch (error) {
          logger.error('Error in RiddleSet event callback', { error: error.message });
        }
      });
    } catch (error) {
      logger.error('Failed to set up RiddleSet event listener', { error: error.message });
      throw error;
    }
  }

  async stopListening() {
    this._contract.removeAllListeners();
  }
}

module.exports = SimpleRiddleRepository; 