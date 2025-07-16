class SimpleLogger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  info(message, meta = {}) {
    const timestamp = new Date().toISOString();
    console.log(`[INFO] ${timestamp} - ${message}`, meta);
  }

  error(message, error = null) {
    const timestamp = new Date().toISOString();
    console.error(`[ERROR] ${timestamp} - ${message}`, error);
  }

  warn(message, meta = {}) {
    const timestamp = new Date().toISOString();
    console.warn(`[WARN] ${timestamp} - ${message}`, meta);
  }

  debug(message, meta = {}) {
    if (this.isDevelopment) {
      const timestamp = new Date().toISOString();
      console.log(`[DEBUG] ${timestamp} - ${message}`, meta);
    }
  }

  log(message, meta = {}) {
    this.info(message, meta);
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

module.exports = new SimpleLogger(); 