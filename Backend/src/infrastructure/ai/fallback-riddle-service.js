const logger = require('../logging/winston-logger');

class FallbackRiddleService {
  constructor() {
    this._riddles = [
      {
        question: "What has keys, but no locks; space, but no room; and you can enter, but not go in?",
        answer: "keyboard"
      },
      {
        question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
        answer: "echo"
      },
      {
        question: "What has cities, but no houses; forests, but no trees; and rivers, but no water?",
        answer: "map"
      },
      {
        question: "What gets wetter and wetter the more it dries?",
        answer: "towel"
      },
      {
        question: "What has a head and a tail but no body?",
        answer: "coin"
      },
      {
        question: "What can travel around the world while staying in a corner?",
        answer: "stamp"
      },
      {
        question: "What has keys that open no door, space but no room, and you can enter but not go in?",
        answer: "computer"
      },
      {
        question: "What breaks when you say it?",
        answer: "silence"
      },
      {
        question: "What has legs, but doesn't walk?",
        answer: "table"
      },
      {
        question: "What has one eye, but can't see?",
        answer: "needle"
      }
    ];
    this._currentIndex = 0;
  }

  async generateRiddle() {
    try {
      const riddle = this._riddles[this._currentIndex];
      this._currentIndex = (this._currentIndex + 1) % this._riddles.length;
      
      logger.info('Generated fallback riddle', { 
        question: riddle.question.substring(0, 50) + '...',
        index: this._currentIndex 
      });
      
      return {
        question: riddle.question,
        answer: riddle.answer
      };
    } catch (error) {
      logger.error('Error generating fallback riddle:', error);
      throw new Error('Failed to generate fallback riddle');
    }
  }
}

module.exports = FallbackRiddleService; 