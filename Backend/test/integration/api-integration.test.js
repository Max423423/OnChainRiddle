const request = require('supertest');
const express = require('express');
const RiddleRoutes = require('../../src/presentation/routes/riddleRoutes');
const GenerateRiddleUseCase = require('../../src/application/use-cases/generateRiddleUseCase');
const HandleWinnerUseCase = require('../../src/application/use-cases/handleWinnerUseCase');
const EthereumRiddleRepository = require('../../src/infrastructure/blockchain/ethereumRiddleRepository');
const OpenAIAIService = require('../../src/infrastructure/ai/openaiAiService');
const Riddle = require('../../src/domain/entities/riddle');
const RiddleId = require('../../src/domain/value-objects/riddleId');

jest.mock('../../src/infrastructure/blockchain/ethereumRiddleRepository');
jest.mock('../../src/infrastructure/ai/openaiAiService');

describe('API Integration Tests', () => {
  let app;
  let mockRiddleRepository;
  let mockAIService;
  let generateRiddleUseCase;
  let handleWinnerUseCase;

  beforeEach(() => {
    mockRiddleRepository = {
      findActive: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      findLatest: jest.fn(),
      listenToWinnerEvents: jest.fn(),
      stopListening: jest.fn()
    };

    mockAIService = {
      generateRiddleWithAnswer: jest.fn()
    };

    EthereumRiddleRepository.mockImplementation(() => mockRiddleRepository);
    OpenAIAIService.mockImplementation(() => mockAIService);

    generateRiddleUseCase = new GenerateRiddleUseCase(mockRiddleRepository, mockAIService);
    handleWinnerUseCase = new HandleWinnerUseCase(mockRiddleRepository, generateRiddleUseCase);

    app = express();
    app.use(express.json());

    const riddleRoutes = new RiddleRoutes(generateRiddleUseCase, handleWinnerUseCase, mockRiddleRepository);
    app.use('/api', riddleRoutes.getRouter());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('service', 'onchain-riddle-backend');
    });
  });

  describe('GET /api/status', () => {
    it('should return status with active riddle', async () => {
      const activeRiddle = new Riddle(
        RiddleId.generate().value,
        'What has keys but no locks?',
        'keyboard',
        true
      );
      activeRiddle.setWinner('0x1234567890123456789012345678901234567890');

      mockRiddleRepository.findActive.mockResolvedValue(activeRiddle);
      mockRiddleRepository.findLatest.mockResolvedValue(activeRiddle);

      const response = await request(app)
        .get('/api/status')
        .expect(200);

      expect(response.body).toHaveProperty('isActive', true);
      expect(response.body).toHaveProperty('currentRiddle', 'What has keys but no locks?');
      expect(response.body).toHaveProperty('winner', '0x1234567890123456789012345678901234567890');
    });

    it('should return status without active riddle', async () => {
      mockRiddleRepository.findActive.mockResolvedValue(null);
      mockRiddleRepository.findLatest.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/status')
        .expect(200);

      expect(response.body).toHaveProperty('isActive', false);
      expect(response.body).toHaveProperty('currentRiddle', null);
      expect(response.body).toHaveProperty('winner', null);
    });
  });

  describe('POST /api/generate-riddle', () => {
    beforeEach(() => {
      mockRiddleRepository.findActive.mockResolvedValue(null);
      mockAIService.generateRiddleWithAnswer.mockResolvedValue({
        riddle: 'What has keys but no locks?',
        answer: 'keyboard'
      });
    });

    it('should generate new riddle successfully', async () => {
      const mockRiddle = new Riddle(
        RiddleId.generate().value,
        'What has keys but no locks?',
        'keyboard',
        false
      );
      mockRiddle.activate();
      mockRiddleRepository.save.mockResolvedValue(mockRiddle);

      const response = await request(app)
        .post('/api/generate-riddle')
        .send({ language: 'english', difficulty: 'medium' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('question', 'What has keys but no locks?');
      expect(response.body.data).toHaveProperty('isActive', true);
    });

    it('should return error when riddle already active', async () => {
      const activeRiddle = new Riddle(
        RiddleId.generate().value,
        'Existing riddle',
        'existing answer',
        true
      );
      mockRiddleRepository.findActive.mockResolvedValue(activeRiddle);

      const response = await request(app)
        .post('/api/generate-riddle')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Cannot generate new riddle while one is active');
    });
  });

  describe('POST /api/handle-winner', () => {
    let mockActiveRiddle;

    beforeEach(() => {
      mockActiveRiddle = new Riddle(
        RiddleId.generate().value,
        'What has keys but no locks?',
        'keyboard',
        true
      );
      mockRiddleRepository.findActive.mockResolvedValue(mockActiveRiddle);
      mockRiddleRepository.update.mockResolvedValue(mockActiveRiddle);
    });

    it('should handle winner successfully', async () => {
      const winnerAddress = '0x1234567890123456789012345678901234567890';

      const response = await request(app)
        .post('/api/handle-winner')
        .send({ winnerAddress })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('winner', winnerAddress);
      expect(response.body).toHaveProperty('riddle');
    });

    it('should return error when winner address is missing', async () => {
      const response = await request(app)
        .post('/api/handle-winner')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Winner address is required');
    });
  });

  describe('Complete API flow', () => {
    it('should handle complete game flow through API', async () => {
      mockRiddleRepository.findActive.mockResolvedValue(null);
      mockRiddleRepository.findLatest.mockResolvedValue(null);

      let response = await request(app)
        .get('/api/status')
        .expect(200);

      expect(response.body.isActive).toBe(false);

      mockAIService.generateRiddleWithAnswer.mockResolvedValue({
        riddle: 'What has keys but no locks?',
        answer: 'keyboard'
      });

      const mockRiddle = new Riddle(
        RiddleId.generate().value,
        'What has keys but no locks?',
        'keyboard',
        false
      );
      mockRiddle.activate();
      mockRiddleRepository.save.mockResolvedValue(mockRiddle);

      response = await request(app)
        .post('/api/generate-riddle')
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);

      mockRiddleRepository.findActive.mockResolvedValue(mockRiddle);
      mockRiddleRepository.findLatest.mockResolvedValue(mockRiddle);

      response = await request(app)
        .get('/api/status')
        .expect(200);

      expect(response.body.isActive).toBe(true);
      expect(response.body.currentRiddle).toBe('What has keys but no locks?');

      mockRiddleRepository.update.mockResolvedValue(mockRiddle);

      response = await request(app)
        .post('/api/handle-winner')
        .send({ winnerAddress: '0x1234567890123456789012345678901234567890' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.winner).toBe('0x1234567890123456789012345678901234567890');
    });
  });
}); 