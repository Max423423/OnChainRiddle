const winston = require('winston');
const path = require('path');

class WinstonLogger {
  constructor() {
    this._logger = this._createLogger();
  }

  _createLogger() {
    const logLevel = process.env.LOG_LEVEL || 'info';
    const isProduction = process.env.NODE_ENV === 'production';

    const transports = [
      new winston.transports.File({ 
        filename: path.join(process.cwd(), 'logs', 'error.log'), 
        level: 'error' 
      }),
      new winston.transports.File({ 
        filename: path.join(process.cwd(), 'logs', 'combined.log') 
      })
    ];

    if (!isProduction) {
      transports.push(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }));
    }

    return winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { 
        service: 'onchain-riddle-backend',
        version: process.env.npm_package_version || '1.0.0'
      },
      transports
    });
  }

  info(message, meta = {}) {
    this._logger.info(message, meta);
  }

  error(message, meta = {}) {
    this._logger.error(message, meta);
  }

  warn(message, meta = {}) {
    this._logger.warn(message, meta);
  }

  debug(message, meta = {}) {
    this._logger.debug(message, meta);
  }

  log(level, message, meta = {}) {
    this._logger.log(level, message, meta);
  }

  // Convenience methods for domain-specific logging
  logRiddleGeneration(riddle, meta = {}) {
    this.info('Riddle generated', { 
      riddle: riddle.question,
      answer: riddle.answer,
      ...meta 
    });
  }

  logWinnerEvent(winnerAddress, meta = {}) {
    this.info('Winner event detected', { 
      winner: winnerAddress,
      ...meta 
    });
  }

  logBlockchainTransaction(txHash, operation, meta = {}) {
    this.info('Blockchain transaction', { 
      txHash,
      operation,
      ...meta 
    });
  }

  logError(error, context = {}) {
    this.error('Application error', {
      message: error.message,
      stack: error.stack,
      ...context
    });
  }
}

// Export singleton instance
module.exports = new WinstonLogger(); 