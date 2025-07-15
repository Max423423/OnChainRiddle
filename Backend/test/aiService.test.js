const AIService = require('../src/services/aiService');

// Mock OpenAI
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn()
      }
    }
  }))
}));

describe('AIService', () => {
  let aiService;
  let mockOpenAI;

  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'test-key';
    aiService = new AIService();
    mockOpenAI = require('openai');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateRiddle', () => {
    it('should generate a riddle successfully', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'What has keys but no locks, space but no rooms, and enters but doesn\'t go in?'
          }
        }]
      };

      const mockCreate = jest.fn().mockResolvedValue(mockResponse);
      mockOpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      }));

      const result = await aiService.generateRiddle();

      expect(result).toBe('What has keys but no locks, space but no rooms, and enters but doesn\'t go in?');
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        model: 'gpt-3.5-turbo',
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'system',
            content: expect.stringContaining('riddle master')
          }),
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('English')
          })
        ])
      }));
    });

    it('should throw error when OpenAI API fails', async () => {
      const mockCreate = jest.fn().mockRejectedValue(new Error('API Error'));
      mockOpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      }));

      await expect(aiService.generateRiddle()).rejects.toThrow('Failed to generate riddle with AI');
    });
  });

  describe('generateAnswer', () => {
    it('should generate an answer successfully', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'keyboard'
          }
        }]
      };

      const mockCreate = jest.fn().mockResolvedValue(mockResponse);
      mockOpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      }));

      const riddle = 'What has keys but no locks?';
      const result = await aiService.generateAnswer(riddle);

      expect(result).toBe('keyboard');
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        model: 'gpt-3.5-turbo',
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining(riddle)
          })
        ])
      }));
    });

    it('should convert answer to lowercase', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'KEYBOARD'
          }
        }]
      };

      const mockCreate = jest.fn().mockResolvedValue(mockResponse);
      mockOpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      }));

      const result = await aiService.generateAnswer('test riddle');
      expect(result).toBe('keyboard');
    });
  });

  describe('generateRiddleWithAnswer', () => {
    it('should generate both riddle and answer', async () => {
      const mockRiddleResponse = {
        choices: [{
          message: {
            content: 'Test riddle'
          }
        }]
      };

      const mockAnswerResponse = {
        choices: [{
          message: {
            content: 'test'
          }
        }]
      };

      const mockCreate = jest.fn()
        .mockResolvedValueOnce(mockRiddleResponse)
        .mockResolvedValueOnce(mockAnswerResponse);

      mockOpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      }));

      const result = await aiService.generateRiddleWithAnswer();

      expect(result).toEqual({
        riddle: 'Test riddle',
        answer: 'test'
      });
      expect(mockCreate).toHaveBeenCalledTimes(2);
    });
  });
}); 