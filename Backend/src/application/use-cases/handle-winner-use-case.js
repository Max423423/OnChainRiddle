class HandleWinnerUseCase {
  constructor(riddleRepository, generateRiddleUseCase) {
    this._riddleRepository = riddleRepository;
    this._generateRiddleUseCase = generateRiddleUseCase;
  }

  async execute(winnerAddress) {
    try {
      // Find active riddle
      const activeRiddle = await this._riddleRepository.findActive();
      if (!activeRiddle) {
        throw new Error('No active riddle found');
      }

      // Set winner
      activeRiddle.setWinner(winnerAddress);

      // Update repository
      await this._riddleRepository.update(activeRiddle);

      // Generate new riddle after a delay
      setTimeout(async () => {
        try {
          await this._generateRiddleUseCase.execute();
        } catch (error) {
          console.error('Failed to generate new riddle after winner:', error);
        }
      }, 5000);

      return {
        success: true,
        winner: winnerAddress,
        riddle: activeRiddle.toDTO(),
        message: 'Winner registered and new riddle generation scheduled'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = HandleWinnerUseCase; 