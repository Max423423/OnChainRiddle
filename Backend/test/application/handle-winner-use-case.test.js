const HandleWinnerUseCase = require('../../src/application/use-cases/handleWinnerUseCase');
const RiddleRepository = require('../../src/domain/repositories/riddleRepository');
const GenerateRiddleUseCase = require('../../src/application/use-cases/generateRiddleUseCase');

jest.mock('../../src/domain/repositories/riddleRepository');
jest.mock('../../src/application/use-cases/generateRiddleUseCase');

describe('HandleWinnerUseCase', () => {
  let useCase;
  let mockRiddleRepository;
  let mockGenerateRiddleUseCase;
  let mockActiveRiddle;

  beforeEach(() => {
    mockRiddleRepository = {
      findActive: jest.fn(),
      update: jest.fn()
    };

    mockGenerateRiddleUseCase = {
      execute: jest.fn()
    };

    mockActiveRiddle = {
      id: { value: 'riddle_123' },
      question: 'What has keys but no locks?',
      answer: 'keyboard',
      isActive: true,
      winner: null,
      setWinner: jest.fn(),
      toDTO: jest.fn().mockReturnValue({
        id: 'riddle_123',
        question: 'What has keys but no locks?',
        isActive: true,
        winner: '0x1234567890123456789012345678901234567890'
      })
    };

    RiddleRepository.mockImplementation(() => mockRiddleRepository);
    GenerateRiddleUseCase.mockImplementation(() => mockGenerateRiddleUseCase);

    useCase = new HandleWinnerUseCase(mockRiddleRepository, mockGenerateRiddleUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('Given an active riddle exists', () => {
    beforeEach(() => {
      mockRiddleRepository.findActive.mockResolvedValue(mockActiveRiddle);
    });

    it('When handling a winner Then it should update riddle with winner and schedule new riddle generation', async () => {
      const winnerAddress = '0x1234567890123456789012345678901234567890';
      mockRiddleRepository.update.mockResolvedValue(mockActiveRiddle);
      mockGenerateRiddleUseCase.execute.mockResolvedValue({ success: true });

      const result = await useCase.execute(winnerAddress);

      expect(mockActiveRiddle.setWinner).toHaveBeenCalledWith(winnerAddress);
      expect(mockRiddleRepository.update).toHaveBeenCalledWith(mockActiveRiddle);
      expect(result.success).toBe(true);
      expect(result.winner).toBe(winnerAddress);
      expect(result.riddle).toBeDefined();
      expect(result.message).toBe('Winner registered and new riddle generation scheduled');
    });

    it('When repository update fails Then it should return error', async () => {
      const winnerAddress = '0x1234567890123456789012345678901234567890';
      mockRiddleRepository.update.mockRejectedValue(new Error('Database error'));

      const result = await useCase.execute(winnerAddress);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
      expect(mockActiveRiddle.setWinner).toHaveBeenCalledWith(winnerAddress);
    });

    it('When new riddle generation fails Then it should still return success for winner handling', async () => {
      const winnerAddress = '0x1234567890123456789012345678901234567890';
      mockRiddleRepository.update.mockResolvedValue(mockActiveRiddle);
      mockGenerateRiddleUseCase.execute.mockResolvedValue({ success: false, error: 'AI service unavailable' });

      const result = await useCase.execute(winnerAddress);

      expect(result.success).toBe(true);
      expect(result.winner).toBe(winnerAddress);
      expect(result.message).toBe('Winner registered and new riddle generation scheduled');
    });

    it('When new riddle generation throws exception Then it should still return success for winner handling', async () => {
      const winnerAddress = '0x1234567890123456789012345678901234567890';
      mockRiddleRepository.update.mockResolvedValue(mockActiveRiddle);
      mockGenerateRiddleUseCase.execute.mockRejectedValue(new Error('AI service crashed'));

      const result = await useCase.execute(winnerAddress);

      expect(result.success).toBe(true);
      expect(result.winner).toBe(winnerAddress);
      expect(result.message).toBe('Winner registered and new riddle generation scheduled');
    });
  });

  describe('Given no active riddle exists', () => {
    beforeEach(() => {
      mockRiddleRepository.findActive.mockResolvedValue(null);
    });

    it('When handling a winner Then it should still schedule new riddle generation', async () => {
      const winnerAddress = '0x1234567890123456789012345678901234567890';
      mockGenerateRiddleUseCase.execute.mockResolvedValue({ success: true });

      const result = await useCase.execute(winnerAddress);

      expect(mockRiddleRepository.update).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.winner).toBe(winnerAddress);
      expect(result.riddle).toBeNull();
      expect(result.message).toBe('Winner registered (no active riddle to update) and new riddle generation scheduled');
    });

    it('When new riddle generation succeeds Then it should return success', async () => {
      const winnerAddress = '0x1234567890123456789012345678901234567890';
      mockGenerateRiddleUseCase.execute.mockResolvedValue({ success: true });

      const result = await useCase.execute(winnerAddress);

      expect(result.success).toBe(true);
      expect(result.winner).toBe(winnerAddress);
    });

    it('When new riddle generation fails Then it should still return success for winner handling', async () => {
      const winnerAddress = '0x1234567890123456789012345678901234567890';
      mockGenerateRiddleUseCase.execute.mockResolvedValue({ success: false, error: 'AI service unavailable' });

      const result = await useCase.execute(winnerAddress);

      expect(result.success).toBe(true);
      expect(result.winner).toBe(winnerAddress);
    });
  });

  describe('Given repository findActive fails', () => {
    beforeEach(() => {
      mockRiddleRepository.findActive.mockRejectedValue(new Error('Repository connection failed'));
    });

    it('When handling a winner Then it should return error', async () => {
      const winnerAddress = '0x1234567890123456789012345678901234567890';

      const result = await useCase.execute(winnerAddress);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Repository connection failed');
      expect(mockGenerateRiddleUseCase.execute).not.toHaveBeenCalled();
    });
  });

  describe('Given winner address validation', () => {
    beforeEach(() => {
      mockRiddleRepository.findActive.mockResolvedValue(mockActiveRiddle);
    });

    it('When handling empty winner address Then it should still process', async () => {
      const winnerAddress = '';
      mockRiddleRepository.update.mockResolvedValue(mockActiveRiddle);
      mockGenerateRiddleUseCase.execute.mockResolvedValue({ success: true });

      const result = await useCase.execute(winnerAddress);

      expect(result.success).toBe(true);
      expect(result.winner).toBe('');
    });

    it('When handling null winner address Then it should still process', async () => {
      const winnerAddress = null;
      mockRiddleRepository.update.mockResolvedValue(mockActiveRiddle);
      mockGenerateRiddleUseCase.execute.mockResolvedValue({ success: true });

      const result = await useCase.execute(winnerAddress);

      expect(result.success).toBe(true);
      expect(result.winner).toBeNull();
    });

    it('When handling undefined winner address Then it should still process', async () => {
      const winnerAddress = undefined;
      mockRiddleRepository.update.mockResolvedValue(mockActiveRiddle);
      mockGenerateRiddleUseCase.execute.mockResolvedValue({ success: true });

      const result = await useCase.execute(winnerAddress);

      expect(result.success).toBe(true);
      expect(result.winner).toBeUndefined();
    });
  });

  describe('Given timing behavior', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      mockRiddleRepository.findActive.mockResolvedValue(mockActiveRiddle);
      mockRiddleRepository.update.mockResolvedValue(mockActiveRiddle);
      mockGenerateRiddleUseCase.execute.mockResolvedValue({ success: true });
    });

    it('When handling winner Then new riddle generation should be scheduled with 1 second delay', async () => {
      const winnerAddress = '0x1234567890123456789012345678901234567890';

      const resultPromise = useCase.execute(winnerAddress);
      
      // New riddle generation should not be called immediately
      expect(mockGenerateRiddleUseCase.execute).not.toHaveBeenCalled();
      
      const result = await resultPromise;
      expect(result.success).toBe(true);

      // Advance timers by 1 second
      jest.advanceTimersByTime(1000);

      // Now new riddle generation should be called
      expect(mockGenerateRiddleUseCase.execute).toHaveBeenCalled();
    });

    it('When handling winner Then result should be returned immediately without waiting for new riddle generation', async () => {
      const winnerAddress = '0x1234567890123456789012345678901234567890';

      const result = await useCase.execute(winnerAddress);
      
      expect(result.success).toBe(true);
      expect(mockGenerateRiddleUseCase.execute).not.toHaveBeenCalled();

      // Advance timers to trigger the scheduled generation
      jest.advanceTimersByTime(1000);
      expect(mockGenerateRiddleUseCase.execute).toHaveBeenCalled();
    });
  });
}); 