const OpenAI = require('openai');
const logger = require('../logging/winston-logger');

class OpenAIAIService {
  constructor(apiKey) {
    this._openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async generateRiddle(language = 'english', difficulty = 'medium') {
    try {
      logger.info(`Generating ${difficulty} difficulty riddle in ${language}`);
      
      const prompt = this._buildRiddlePrompt(language, difficulty);
      
      const completion = await this._openai.chat.completions.create({
        model: "gpt-3.5-turbo",
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
        max_tokens: 150,
        temperature: 0.8,
      });

      const riddle = completion.choices[0].message.content.trim();
      logger.info('Riddle generated successfully');
      
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
        model: "gpt-3.5-turbo",
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
        max_tokens: 50,
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
      logger.error('Error generating riddle with answer:', error);
      throw error;
    }
  }

  _buildRiddlePrompt(language, difficulty) {
    const difficultySettings = {
      easy: 'simple and straightforward',
      medium: 'moderately challenging',
      hard: 'complex and thought-provoking'
    };

    return `Generate a ${difficultySettings[difficulty] || 'moderately challenging'} riddle in ${language}. The riddle should be:
    - Creative and engaging
    - Have a clear, single-word answer
    - Be appropriate for all ages
    - Written in ${language}
    
    Please respond with only the riddle text, nothing else.`;
  }

  _buildAnswerPrompt(riddle, language) {
    return `Given this ${language} riddle: "${riddle}"
    
    What is the single-word answer? Respond with only the answer word, nothing else.`;
  }

  _getSystemPrompt(language) {
    return `You are a creative riddle master. Generate engaging riddles in ${language} with clear, single-word answers.`;
  }

  _getAnswerSystemPrompt(language) {
    return `You are a riddle solver. Provide only the single-word answer to ${language} riddles.`;
  }
}

module.exports = OpenAIAIService; 