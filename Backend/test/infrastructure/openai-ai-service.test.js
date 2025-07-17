const OpenAIAIService = require('../../src/infrastructure/ai/openai-ai-service');
const OpenAI = require('openai');
const FallbackRiddleService = require('../../src/infrastructure/ai/fallback-riddle-service');

jest.mock('openai');
jest.mock('../../src/infrastructure/ai/fallback-riddle-service');
jest.mock('../../src/infrastructure/logging/simple-logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}));

describe('OpenAIAIService', () => {
  let aiService;
  let mockOpenAI;
  let mockFallbackService;

  beforeEach(() => {
    mockOpenAI = {
      chat: {
        completions: {
          create: jest.fn()
        }
      }
    };

    mockFallbackService = {
      generateRiddle: jest.fn()
    };

    OpenAI.mockImplementation(() => mockOpenAI);
    FallbackRiddleService.mockImplementation(() => mockFallbackService);

    aiService = new OpenAIAIService('test-api-key');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Given service initialization', () => {
    it('When creating service Then it should initialize OpenAI client', () => {
      expect(OpenAI).toHaveBeenCalledWith({
        apiKey: 'test-api-key'
      });
    });

    it('When creating service Then it should initialize fallback service', () => {
      expect(FallbackRiddleService).toHaveBeenCalled();
    });
  });

  describe('Given riddle generation', () => {
    beforeEach(() => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: 'What has keys but no locks?'
          }
        }]
      });
    });

    it('When generating riddle Then it should call OpenAI with correct parameters', async () => {
      const result = await aiService.generateRiddle('english');

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-3.5-turbo-0125',
        messages: [
          {
            role: 'system',
            content: expect.stringContaining('riddle master')
          },
          {
            role: 'user',
            content: expect.stringContaining('Generate a riddle')
          }
        ],
        max_tokens: 100,
        temperature: 0.8
      });
      expect(result).toBe('What has keys but no locks?');
    });

    it('When generating riddle in different language Then it should use correct language', async () => {
      await aiService.generateRiddle('french');

      const call = mockOpenAI.chat.completions.create.mock.calls[0][0];
      expect(call.messages[0].content).toContain('french');
      expect(call.messages[1].content).toContain('french');
    });

    it('When OpenAI fails Then it should throw error', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API rate limit'));

      await expect(aiService.generateRiddle()).rejects.toThrow('Failed to generate riddle with AI: API rate limit');
    });

    it('When OpenAI returns empty response Then it should throw error', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: ''
          }
        }]
      });

      const result = await aiService.generateRiddle();
      expect(result).toBe('');
    });
  });

  describe('Given answer generation', () => {
    beforeEach(() => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: 'keyboard'
          }
        }]
      });
    });

    it('When generating answer Then it should call OpenAI with correct parameters', async () => {
      const result = await aiService.generateAnswer('What has keys but no locks?', 'english');

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-3.5-turbo-0125',
        messages: [
          {
            role: 'system',
            content: expect.stringContaining('riddle solver')
          },
          {
            role: 'user',
            content: expect.stringContaining('What has keys but no locks?')
          }
        ],
        max_tokens: 30,
        temperature: 0.3
      });
      expect(result).toBe('keyboard');
    });

    it('When generating answer Then it should convert to lowercase', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: 'KEYBOARD'
          }
        }]
      });

      const result = await aiService.generateAnswer('What has keys but no locks?');
      expect(result).toBe('keyboard');
    });

    it('When OpenAI fails Then it should throw error', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API error'));

      await expect(aiService.generateAnswer('test riddle')).rejects.toThrow('Failed to generate answer with AI: API error');
    });
  });

  describe('Given riddle with answer generation', () => {
    beforeEach(() => {
      mockOpenAI.chat.completions.create
        .mockResolvedValueOnce({
          choices: [{
            message: {
              content: 'What has keys but no locks?'
            }
          }]
        })
        .mockResolvedValueOnce({
          choices: [{
            message: {
              content: 'keyboard'
            }
          }]
        });
    });

    it('When generating riddle with answer Then it should return both riddle and answer', async () => {
      const result = await aiService.generateRiddleWithAnswer('english');

      expect(result).toEqual({
        riddle: 'What has keys but no locks?',
        answer: 'keyboard'
      });
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(2);
    });

    it('When generating in different language Then it should use correct language', async () => {
      await aiService.generateRiddleWithAnswer('french');

      const calls = mockOpenAI.chat.completions.create.mock.calls;
      expect(calls[0][0].messages[0].content).toContain('french');
      expect(calls[1][0].messages[0].content).toContain('french');
    });
  });

  describe('Given prompt building', () => {
    it('When building riddle prompt Then it should include random theme', () => {
      const prompt = aiService._buildRiddlePrompt('english');
      
      expect(prompt).toMatch(/Generate a riddle about .* in english/);
      expect(prompt).toContain('single-word answer');
    });

    it('When building answer prompt Then it should include riddle text', () => {
      const prompt = aiService._buildAnswerPrompt('What has keys but no locks?', 'english');
      
      expect(prompt).toContain('What has keys but no locks?');
      expect(prompt).toContain('single-word answer');
      expect(prompt).toContain('english');
    });

    it('When getting system prompt Then it should include language', () => {
      const prompt = aiService._getSystemPrompt('french');
      
      expect(prompt).toContain('french');
      expect(prompt).toContain('riddle master');
    });

    it('When getting answer system prompt Then it should include language', () => {
      const prompt = aiService._getAnswerSystemPrompt('spanish');
      
      expect(prompt).toContain('spanish');
      expect(prompt).toContain('riddle solver');
    });
  });

  describe('Given theme randomization', () => {
    it('When building multiple prompts Then it should use different themes', () => {
      const themes = new Set();
      
      for (let i = 0; i < 10; i++) {
        const prompt = aiService._buildRiddlePrompt('english');
        const themeMatch = prompt.match(/about (.*?) in/);
        if (themeMatch) {
          themes.add(themeMatch[1]);
        }
      }
      
      expect(themes.size).toBeGreaterThan(1);
    });
  });

  describe('Given error handling', () => {
    it('When riddle generation fails Then it should log error', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('Network error'));

      await expect(aiService.generateRiddle()).rejects.toThrow();

      const logger = require('../../src/infrastructure/logging/simple-logger');
      expect(logger.error).toHaveBeenCalledWith('Error generating riddle:', expect.any(Error));
    });

    it('When answer generation fails Then it should log error', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API error'));

      await expect(aiService.generateAnswer('test')).rejects.toThrow();

      const logger = require('../../src/infrastructure/logging/simple-logger');
      expect(logger.error).toHaveBeenCalledWith('Error generating answer:', expect.any(Error));
    });
  });

  describe('Given API configuration', () => {
    it('When creating service Then it should use correct model', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: 'test'
          }
        }]
      });

      await aiService.generateRiddle();

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-3.5-turbo-0125'
        })
      );
    });

    it('When generating riddle Then it should use correct temperature and tokens', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: 'test'
          }
        }]
      });

      await aiService.generateRiddle();

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          max_tokens: 100,
          temperature: 0.8
        })
      );
    });

    it('When generating answer Then it should use correct temperature and tokens', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: 'test'
          }
        }]
      });

      await aiService.generateAnswer('test riddle');

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          max_tokens: 30,
          temperature: 0.3
        })
      );
    });
  });
}); 