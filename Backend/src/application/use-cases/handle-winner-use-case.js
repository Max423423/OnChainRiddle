const logger = require('../../infrastructure/logging/simple-logger');

class HandleWinnerUseCase {
  constructor(riddleRepository, generateRiddleUseCase) {
    this._riddleRepository = riddleRepository;
    this._generateRiddleUseCase = generateRiddleUseCase;
  }

  async execute(winnerAddress) {
    try {
      logger.info('HandleWinnerUseCase: execute() called', { winner: winnerAddress });
      
      const activeRiddle = await this._riddleRepository.findActive();
      
      let winnerInfo = {
        winner: winnerAddress,
        riddle: null,
        message: 'Winner registered and new riddle generation scheduled'
      };

      if (activeRiddle) {
        activeRiddle.setWinner(winnerAddress);
        await this._riddleRepository.update(activeRiddle);
        winnerInfo.riddle = activeRiddle.toDTO();
      } else {
        logger.info('HandleWinnerUseCase: No active riddle found (normal after someone wins)');
        winnerInfo.message = 'Winner registered (no active riddle to update) and new riddle generation scheduled';
      }

      setTimeout(async () => {
        try {
          const result = await this._generateRiddleUseCase.execute();
          
          if (result.success) {
            logger.info('HandleWinnerUseCase: New riddle generated successfully after winner');
          } else {
            logger.error('HandleWinnerUseCase: Failed to generate new riddle after winner', result.error);
          }
        } catch (error) {
          logger.error('HandleWinnerUseCase: Exception during riddle generation after winner', { error: error.message });
        }
      }, 1000);

      const result = {
        success: true,
        ...winnerInfo
      };
      
      return result;
      
    } catch (error) {
      logger.error('HandleWinnerUseCase: Unexpected error', { error: error.message });
      
      const result = {
        success: false,
        error: error.message
      };
      
      return result;
    }
  }
}

module.exports = HandleWinnerUseCase; 