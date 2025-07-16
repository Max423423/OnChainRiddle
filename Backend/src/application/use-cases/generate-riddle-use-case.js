const logger = require('../../infrastructure/logging/winston-logger');

class GenerateRiddleUseCase {
  constructor(riddleRepository, aiService, blockchainService) {
    this._riddleRepository = riddleRepository;
    this._aiService = aiService;
    this._blockchainService = blockchainService;
  }

  async execute() {
    try {
      logger.info('GenerateRiddleUseCase: execute() called');
      
      const activeRiddle = await this._riddleRepository.findActive();
      logger.info('GenerateRiddleUseCase: activeRiddle check', { found: !!activeRiddle });
      if (activeRiddle) {
        logger.info('GenerateRiddleUseCase: Active riddle found, cannot generate new one', {
          question: activeRiddle.question,
          isActive: activeRiddle.isActive,
          winner: activeRiddle.winner
        });
        throw new Error('Cannot generate new riddle while one is active');
      }

      const { riddle: question, answer } = await this._aiService.generateRiddleWithAnswer();

      const riddle = Riddle.create(question, answer);
      riddle.activate();

      await this._riddleRepository.save(riddle);

      return {
        success: true,
        riddle: riddle.toDTO(),
        message: 'Riddle generated and published successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

const Riddle = require('../../domain/entities/riddle');

module.exports = GenerateRiddleUseCase; 