const logger = require('../../infrastructure/logging/winston-logger');

class HandleWinnerUseCase {
  constructor(riddleRepository, generateRiddleUseCase) {
    this._riddleRepository = riddleRepository;
    this._generateRiddleUseCase = generateRiddleUseCase;
  }

  async execute(winnerAddress) {
    try {
      logger.info('HandleWinnerUseCase: execute() called', { winner: winnerAddress });
      
      const activeRiddle = await this._riddleRepository.findActive();
      logger.info('HandleWinnerUseCase: activeRiddle check', { found: !!activeRiddle });
      
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

      logger.info('HandleWinnerUseCase: Scheduling new riddle generation in 5 seconds');
      setTimeout(async () => {
        try {
          logger.info('HandleWinnerUseCase: Trying to generate new riddle after winner');
          const result = await this._generateRiddleUseCase.execute();
          logger.info('HandleWinnerUseCase: Result of riddle generation after winner', { result });
        } catch (error) {
          logger.error('Failed to generate new riddle after winner', { error: error.message });
        }
      }, 1000);

      return {
        success: true,
        ...winnerInfo
      };
    } catch (error) {
      logger.error('HandleWinnerUseCase: Unexpected error', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = HandleWinnerUseCase; 