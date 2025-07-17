require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Environment validation
if (!process.env.PRIVATE_KEY || !process.env.CONTRACT_ADDRESS || !process.env.RPC_URL || !process.env.OPENAI_API_KEY) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// Infrastructure
const EthereumRiddleRepository = require('./infrastructure/blockchain/ethereumRiddleRepository');
const OpenAIAIService = require('./infrastructure/ai/openaiAiService');
const logger = require('./infrastructure/logging/simpleLogger');

// Application
const GenerateRiddleUseCase = require('./application/use-cases/generateRiddleUseCase');
const HandleWinnerUseCase = require('./application/use-cases/handleWinnerUseCase');

// Presentation
const RiddleRoutes = require('./presentation/routes/riddleRoutes');
const ErrorHandler = require('./presentation/middleware/errorHandler');

class OnchainRiddleApplication {
  constructor() {
    this._app = express();
    this._port = process.env.PORT || 3001;
    this._isShuttingDown = false;
  }

  async initialize() {
    try {
      logger.info('Initializing OnchainRiddle application...');

      // Initialize infrastructure services
      await this._initializeInfrastructure();

      // Initialize application services
      await this._initializeApplication();

      // Setup presentation layer
      this._setupPresentation();

      // Setup event listeners
      await this._setupEventListeners();

      logger.info('Application initialized successfully');
    } catch (error) {
      logger.logError(error, { context: 'Application initialization' });
      throw error;
    }
  }

  async _initializeInfrastructure() {
    logger.info('Initializing infrastructure services...');

    // Initialize blockchain repository
    this._riddleRepository = new EthereumRiddleRepository(
      process.env.RPC_URL,
      process.env.CONTRACT_ADDRESS,
      process.env.PRIVATE_KEY
    );

    // Initialize AI service
    this._aiService = new OpenAIAIService(process.env.OPENAI_API_KEY);
    logger.info('Infrastructure services initialized');
  }

  async _initializeApplication() {
    logger.info('Initializing application services...');

    // Initialize use cases
    this._generateRiddleUseCase = new GenerateRiddleUseCase(
      this._riddleRepository,
      this._aiService
    );

    this._handleWinnerUseCase = new HandleWinnerUseCase(
      this._riddleRepository,
      this._generateRiddleUseCase
    );

    logger.info('Application services initialized');
  }

  _setupPresentation() {
    logger.info('Setting up presentation layer...');

    // Middleware
    this._app.use(helmet());
    this._app.use(cors());
    this._app.use(express.json());

    // Simple health check at root level
    this._app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'onchain-riddle-backend',
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    // Routes (only if services are initialized)
    if (this._generateRiddleUseCase && this._handleWinnerUseCase && this._riddleRepository) {
      const riddleRoutes = new RiddleRoutes(
        this._generateRiddleUseCase,
        this._handleWinnerUseCase,
        this._riddleRepository
      );
      this._app.use('/api', riddleRoutes.getRouter());
    } else {
      // Fallback routes for when services are not yet initialized
      this._app.get('/api/health', (req, res) => {
        res.status(200).json({
          status: 'INITIALIZING',
          timestamp: new Date().toISOString(),
          service: 'onchain-riddle-backend',
          message: 'Services are being initialized'
        });
      });
    }

    // Error handling
    this._app.use(ErrorHandler.handleNotFound);
    this._app.use(ErrorHandler.handleError);

    logger.info('Presentation layer setup complete');
  }

  async _setupEventListeners() {
    logger.info('Setting up event listeners...');

    // Listen for winner events
    await this._riddleRepository.listenToWinnerEvents(async (winner, event) => {
      if (this._isShuttingDown) return;

      try {
        logger.logWinnerEvent(winner, { event });
        logger.info('Main.js: Winner event detected, calling HandleWinnerUseCase');
        await this._handleWinnerUseCase.execute(winner);
        logger.info('Main.js: HandleWinnerUseCase completed successfully');
      } catch (error) {
        logger.error('Main.js: Error in HandleWinnerUseCase', { error: error.message });
        logger.logError(error, { context: 'Winner event handling' });
      }
    });

    // Listen for riddle set events
    await this._riddleRepository.listenToRiddleSetEvents((riddle, event) => {
      logger.info('New riddle set on blockchain', { riddle, event });
    });

    logger.info('Event listeners setup complete');
  }

  async start() {
    try {
      // Setup presentation layer first (so server can start immediately)
      this._setupPresentation();

      // Start server immediately
      this._server = this._app.listen(this._port, () => {
        logger.info(`Server running on port ${this._port}`);
        logger.info(`Health check: http://localhost:${this._port}/health`);
        logger.info(`API Health check: http://localhost:${this._port}/api/health`);
      });

      // Initialize services in background
      this._initializeServicesInBackground();

    } catch (error) {
      logger.logError(error, { context: 'Application startup' });
      process.exit(1);
    }
  }

  async _initializeServicesInBackground() {
    try {
      logger.info('Initializing services in background...');
      
      // Initialize infrastructure services
      await this._initializeInfrastructure();

      // Initialize application services
      await this._initializeApplication();

      // Setup event listeners
      await this._setupEventListeners();

      // Re-setup presentation layer with full routes
      this._setupPresentation();

      logger.info('All services initialized successfully');

      // Check if initial riddle is needed
      const activeRiddle = await this._riddleRepository.findActive();
      
      if (!activeRiddle) {
        logger.info('No active riddle found, generating initial riddle...');
        try {
          const result = await this._generateRiddleUseCase.execute();
          
          if (result.success) {
            logger.info('Initial riddle generated successfully');
          } else {
            logger.error('Failed to generate initial riddle:', result.error);
          }
        } catch (error) {
          logger.error('Exception during initial riddle generation:', error);
        }
      } else {
        logger.info('Active riddle found, no need to generate initial riddle');
      }

    } catch (error) {
      logger.error('Failed to initialize services:', error);
    }
  }

  async shutdown() {
    if (this._isShuttingDown) return;

    this._isShuttingDown = true;
    logger.info('Shutting down application...');

    try {
      if (this._riddleRepository) {
        await this._riddleRepository.stopListening();
      }

      if (this._server) {
        await new Promise((resolve) => {
          this._server.close(resolve);
        });
      }

      logger.info('Application shutdown complete');
    } catch (error) {
      logger.logError(error, { context: 'Application shutdown' });
    }
  }
}

process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  await app.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  await app.shutdown();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.logError(error, { context: 'Uncaught exception' });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.logError(new Error(`Unhandled rejection at ${promise}: ${reason}`), {
    context: 'Unhandled rejection'
  });
  process.exit(1);
});

const app = new OnchainRiddleApplication();
app.start().catch((error) => {
  logger.logError(error, { context: 'Application startup' });
  process.exit(1);
}); 