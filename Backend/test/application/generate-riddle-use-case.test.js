const GenerateRiddleUseCase = require('../../src/application/use-cases/generate-riddle-use-case');
const RiddleRepository = require('../../src/domain/repositories/riddle-repository');
const OpenAIAIService = require('../../src/infrastructure/ai/openai-ai-service');

jest.mock('../../src/domain/repositories/riddle-repository');
jest.mock('../../src/infrastructure/ai/openai-ai-service');

describe('GenerateRiddleUseCase', () => {
  let useCase;
  let mockRiddleRepository;
  let mockAIService;
  let mockBlockchainService;

  beforeEach(() => {
    mockRiddleRepository = {
      findActive: jest.fn(),
      save: jest.fn()
    };
    mockAIService = {
      generateRiddleWithAnswer: jest.fn()
    };
    mockBlockchainService = {};

    RiddleRepository.mockImplementation(() => mockRiddleRepository);
    OpenAIAIService.mockImplementation(() => mockAIService);

    useCase = new GenerateRiddleUseCase(mockRiddleRepository, mockAIService, mockBlockchainService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Given no active riddle exists', () => {
    beforeEach(() => {
      mockRiddleRepository.findActive.mockResolvedValue(null);
    });

    it('When generating a new riddle Then it should create and save riddle', async () => {
      const mockRiddle = {
        id: { value: 'riddle_123' },
        question: 'What has keys but no locks?',
        answer: 'keyboard',
        isActive: false,
        activate: jest.fn(),
        toDTO: jest.fn().mockReturnValue({
          id: 'riddle_123',
          question: 'What has keys but no locks?',
          answer: 'keyboard',
          isActive: true
        })
      };

      mockAIService.generateRiddleWithAnswer.mockResolvedValue({
        riddle: 'What has keys but no locks?',
        answer: 'keyboard'
      });

      mockRiddleRepository.save.mockResolvedValue(mockRiddle);

      const result = await useCase.execute();

      expect(mockAIService.generateRiddleWithAnswer).toHaveBeenCalled();
      expect(mockRiddleRepository.save).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.riddle).toHaveProperty('id');
      expect(result.riddle.id).toMatch(/^riddle_\d+_[a-z0-9]+$/);
      expect(result.riddle).toHaveProperty('question', 'What has keys but no locks?');
      expect(result.riddle).not.toHaveProperty('answer');
      expect(result.riddle).toHaveProperty('isActive', true);
    });

    it('When AI service fails Then it should return error', async () => {
      mockAIService.generateRiddleWithAnswer.mockRejectedValue(new Error('AI service unavailable'));

      const result = await useCase.execute();

      expect(result.success).toBe(false);
      expect(result.error).toBe('AI service unavailable');
      expect(mockRiddleRepository.save).not.toHaveBeenCalled();
    });

    it('When repository save fails Then it should return error', async () => {
      mockAIService.generateRiddleWithAnswer.mockResolvedValue({
        riddle: 'What has keys but no locks?',
        answer: 'keyboard'
      });
      mockRiddleRepository.save.mockRejectedValue(new Error('Database error'));

      const result = await useCase.execute();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('Given an active riddle exists', () => {
    beforeEach(() => {
      mockRiddleRepository.findActive.mockResolvedValue({
        question: 'Existing riddle',
        isActive: true
      });
    });

    it('When generating a new riddle Then it should return error', async () => {
      const result = await useCase.execute();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cannot generate new riddle while one is active');
      expect(mockAIService.generateRiddleWithAnswer).not.toHaveBeenCalled();
      expect(mockRiddleRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('Given AI service returns invalid data', () => {
    beforeEach(() => {
      mockRiddleRepository.findActive.mockResolvedValue(null);
    });

    it('When AI returns empty question Then it should return error', async () => {
      mockAIService.generateRiddleWithAnswer.mockResolvedValue({
        riddle: '',
        answer: 'keyboard'
      });

      const result = await useCase.execute();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Riddle question cannot be empty');
    });

    it('When AI returns empty answer Then it should return error', async () => {
      mockAIService.generateRiddleWithAnswer.mockResolvedValue({
        riddle: 'What has keys but no locks?',
        answer: ''
      });

      const result = await useCase.execute();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Riddle answer cannot be empty');
    });

    it('When AI returns missing properties Then it should return error', async () => {
      mockAIService.generateRiddleWithAnswer.mockResolvedValue({
        riddle: 'What has keys but no locks?'
      });

      const result = await useCase.execute();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Riddle answer cannot be empty');
    });
  });
}); 