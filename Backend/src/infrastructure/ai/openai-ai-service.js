const OpenAI = require('openai');
const logger = require('../logging/simple-logger');
const FallbackRiddleService = require('./fallback-riddle-service');

class OpenAIAIService {
  constructor(apiKey) {
    this._openai = new OpenAI({
      apiKey: apiKey,
    });
    this._fallbackService = new FallbackRiddleService();
  }

  async generateRiddle(language = 'english', difficulty = 'medium') {
    try {
      logger.info(`Generating ${difficulty} difficulty riddle in ${language}`);
      
      const prompt = this._buildRiddlePrompt(language, difficulty);
      
      const completion = await this._openai.chat.completions.create({
        model: "gpt-3.5-turbo-0125",
        messages: [
          {
            role: "system",
            content: this._getSystemPrompt(language)
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 100,
        temperature: 0.8,
      });

      const riddle = completion.choices[0].message.content.trim();
      logger.info('Riddle generated successfully with AI');
      
      return riddle;
    } catch (error) {
      logger.error('Error generating riddle:', error);
      throw new Error(`Failed to generate riddle with AI: ${error.message}`);
    }
  }

  async generateAnswer(riddle, language = 'english') {
    try {
      logger.info('Generating answer for riddle');
      
      const prompt = this._buildAnswerPrompt(riddle, language);

      const completion = await this._openai.chat.completions.create({
        model: "gpt-3.5-turbo-0125", // Using a more recent model
        messages: [
          {
            role: "system",
            content: this._getAnswerSystemPrompt(language)
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 30, // Reduced tokens to save costs
        temperature: 0.3,
      });

      const answer = completion.choices[0].message.content.trim().toLowerCase();
      logger.info('Answer generated successfully');
      
      return answer;
    } catch (error) {
      logger.error('Error generating answer:', error);
      throw new Error(`Failed to generate answer with AI: ${error.message}`);
    }
  }

  async generateRiddleWithAnswer(language = 'english', difficulty = 'medium') {
    try {
      const riddle = await this.generateRiddle(language, difficulty);
      const answer = await this.generateAnswer(riddle, language);
      
      return { riddle, answer };
    } catch (error) {
      // Check if we should force OpenAI usage (for development)
      if (process.env.FORCE_OPENAI === 'true') {
        logger.error('OpenAI failed and FORCE_OPENAI is enabled:', error.message);
        throw error;
      }
      
      logger.warn('OpenAI failed, using fallback riddle service:', error.message);
      
      try {
        const fallbackRiddle = await this._fallbackService.generateRiddle();
        logger.info('Fallback riddle generated successfully');
        return {
          riddle: fallbackRiddle.question,
          answer: fallbackRiddle.answer
        };
      } catch (fallbackError) {
        logger.error('Both OpenAI and fallback failed:', { 
          openaiError: error.message,
          fallbackError: fallbackError.message
        });
        throw new Error(`Failed to generate riddle: ${error.message}`);
      }
    }
  }

  _buildRiddlePrompt(language, difficulty) {
    const themes = ['animals', 'objects', 'food', 'nature', 'colors', 'numbers', 'body', 'time', 'weather', 'sports'];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];

    return `Generate a riddle about ${randomTheme} in ${language}. The riddle should have a clear, single-word answer.`;
  }

  _buildAnswerPrompt(riddle, language) {
    return `Given this ${language} riddle: "${riddle}"
    
    What is the single-word answer? Respond with only the answer word, nothing else.`;
  }

  _getSystemPrompt(language) {
    return `You are a creative riddle master. Generate unique riddles in ${language} with clear, single-word answers.`;
  }

  _getAnswerSystemPrompt(language) {
    return `You are a riddle solver. Provide only the single-word answer to ${language} riddles.`;
  }
}

module.exports = OpenAIAIService; 