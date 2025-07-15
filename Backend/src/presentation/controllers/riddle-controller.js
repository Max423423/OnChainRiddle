const { GenerateRiddleRequestDTO, GenerateRiddleResponseDTO } = require('../../application/dto/riddle-dto');
const logger = require('../../infrastructure/logging/winston-logger');

class RiddleController {
  constructor(generateRiddleUseCase, handleWinnerUseCase, riddleRepository) {
    this._generateRiddleUseCase = generateRiddleUseCase;
    this._handleWinnerUseCase = handleWinnerUseCase;
    this._riddleRepository = riddleRepository;
  }

  async getHealth(req, res) {
    try {
      const health = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'onchain-riddle-backend',
        version: process.env.npm_package_version || '1.0.0'
      };

      res.json(health);
    } catch (error) {
      logger.logError(error, { endpoint: '/health' });
      res.status(500).json({ error: 'Health check failed' });
    }
  }

  async getStatus(req, res) {
    try {
      const activeRiddle = await this._riddleRepository.findActive();
      const latestRiddle = await this._riddleRepository.findLatest();

      const status = {
        isActive: !!activeRiddle,
        currentRiddle: activeRiddle ? activeRiddle.question : null,
        winner: activeRiddle ? activeRiddle.winner : null,
        lastRiddle: latestRiddle ? latestRiddle.toDTO() : null,
        timestamp: new Date().toISOString()
      };

      res.json(status);
    } catch (error) {
      logger.logError(error, { endpoint: '/status' });
      res.status(500).json({ error: 'Failed to get status' });
    }
  }

  async generateRiddle(req, res) {
    try {
      const requestDTO = GenerateRiddleRequestDTO.fromRequest(req);
      
      logger.info('Manual riddle generation requested', {
        language: requestDTO.language,
        difficulty: requestDTO.difficulty
      });

      const result = await this._generateRiddleUseCase.execute();

      if (result.success) {
        const responseDTO = GenerateRiddleResponseDTO.success(
          result.riddle,
          result.message
        );
        res.json(responseDTO);
      } else {
        const responseDTO = GenerateRiddleResponseDTO.error(result.error);
        res.status(400).json(responseDTO);
      }
    } catch (error) {
      logger.logError(error, { endpoint: '/generate-riddle' });
      const responseDTO = GenerateRiddleResponseDTO.error('Failed to generate riddle');
      res.status(500).json(responseDTO);
    }
  }

  async handleWinner(req, res) {
    try {
      const { winnerAddress } = req.body;

      if (!winnerAddress) {
        return res.status(400).json({
          success: false,
          error: 'Winner address is required'
        });
      }

      logger.info('Manual winner handling requested', { winnerAddress });

      const result = await this._handleWinnerUseCase.execute(winnerAddress);

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      logger.logError(error, { endpoint: '/handle-winner' });
      res.status(500).json({
        success: false,
        error: 'Failed to handle winner'
      });
    }
  }

  async getRiddleHistory(req, res) {
    try {
      // For blockchain implementation, we only have current riddle
      const activeRiddle = await this._riddleRepository.findActive();
      const latestRiddle = await this._riddleRepository.findLatest();

      const history = [];
      
      if (activeRiddle) {
        history.push(activeRiddle.toDTO());
      }
      
      if (latestRiddle && latestRiddle !== activeRiddle) {
        history.push(latestRiddle.toDTO());
      }

      res.json({
        riddles: history,
        count: history.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.logError(error, { endpoint: '/riddle-history' });
      res.status(500).json({ error: 'Failed to get riddle history' });
    }
  }
}

module.exports = RiddleController; 