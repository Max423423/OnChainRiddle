const logger = require('../../infrastructure/logging/simple-logger');

class GenerateRiddleUseCase {
  constructor(riddleRepository, aiService) {
    this._riddleRepository = riddleRepository;
    this._aiService = aiService;
  }

    async execute() {
    try {
      logger.info('GenerateRiddleUseCase: execute() called');

      const activeRiddle = await this._riddleRepository.findActive();

      if (activeRiddle) {
        logger.info('GenerateRiddleUseCase: Active riddle found, cannot generate new one');
        throw new Error('Cannot generate new riddle while one is active');
      }

      const { riddle: question, answer } = await this._aiService.generateRiddleWithAnswer();
      const riddle = Riddle.create(question, answer);
      riddle.activate();

      await this._riddleRepository.save(riddle);

      const result = {
        success: true,
        riddle: riddle.toDTO(),
        message: 'Riddle generated and published successfully'
      };

      logger.info('GenerateRiddleUseCase: Successfully completed');
      return result;

    } catch (error) {
      logger.error('GenerateRiddleUseCase: Error occurred', { error: error.message });

      const result = {
        success: false,
        error: error.message
      };

      return result;
    }
  }
}

const Riddle = require('../../domain/entities/riddle');

module.exports = GenerateRiddleUseCase; 