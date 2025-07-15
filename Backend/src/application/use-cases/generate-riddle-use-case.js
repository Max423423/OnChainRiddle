class GenerateRiddleUseCase {
  constructor(riddleRepository, aiService, blockchainService) {
    this._riddleRepository = riddleRepository;
    this._aiService = aiService;
    this._blockchainService = blockchainService;
  }

  async execute() {
    try {
      // Check if there's already an active riddle
      const activeRiddle = await this._riddleRepository.findActive();
      if (activeRiddle) {
        throw new Error('Cannot generate new riddle while one is active');
      }

      // Generate riddle and answer using AI
      const { riddle: question, answer } = await this._aiService.generateRiddleWithAnswer();

      // Create riddle entity
      const riddle = Riddle.create(question, answer);
      riddle.activate();

      // Save to repository
      await this._riddleRepository.save(riddle);

      // Publish to blockchain
      await this._blockchainService.setNewRiddle(question, answer);

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