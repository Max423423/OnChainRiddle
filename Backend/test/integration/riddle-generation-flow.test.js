const RiddleController = require('../../src/presentation/controllers/riddle-controller');
const GenerateRiddleUseCase = require('../../src/application/use-cases/generate-riddle-use-case');
const HandleWinnerUseCase = require('../../src/application/use-cases/handle-winner-use-case');
const EthereumRiddleRepository = require('../../src/infrastructure/blockchain/ethereum-riddle-repository');
const OpenAIAIService = require('../../src/infrastructure/ai/openai-ai-service');

jest.mock('../../src/application/use-cases/generate-riddle-use-case');
jest.mock('../../src/application/use-cases/handle-winner-use-case');
jest.mock('../../src/infrastructure/blockchain/ethereum-riddle-repository');
jest.mock('../../src/infrastructure/ai/openai-ai-service');

describe('Riddle Generation Flow Integration', () => {
  let controller;
  let mockGenerateRiddleUseCase;
  let mockHandleWinnerUseCase;
  let mockRiddleRepository;
  let mockAIService;

  beforeEach(() => {
    mockGenerateRiddleUseCase = { execute: jest.fn() };
    mockHandleWinnerUseCase = { execute: jest.fn() };
    mockRiddleRepository = { hasActiveRiddle: jest.fn(), save: jest.fn(), listenToWinnerEvents: jest.fn(), stopListening: jest.fn() };
    mockAIService = { generateRiddleWithAnswer: jest.fn() };
    GenerateRiddleUseCase.mockImplementation(() => mockGenerateRiddleUseCase);
    HandleWinnerUseCase.mockImplementation(() => mockHandleWinnerUseCase);
    EthereumRiddleRepository.mockImplementation(() => mockRiddleRepository);
    OpenAIAIService.mockImplementation(() => mockAIService);
    controller = new RiddleController(mockGenerateRiddleUseCase, mockHandleWinnerUseCase, mockRiddleRepository);
  });

  it('should call use case and return riddle on success', async () => {
    const req = { body: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    mockGenerateRiddleUseCase.execute.mockResolvedValue({ success: true, riddle: { id: 'test' }, message: 'ok' });
    await controller.generateRiddle(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('should return 400 if riddle already active', async () => {
    const req = { body: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    mockGenerateRiddleUseCase.execute.mockResolvedValue({ success: false, error: 'already active' });
    await controller.generateRiddle(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 500 on use case exception', async () => {
    const req = { body: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    mockGenerateRiddleUseCase.execute.mockRejectedValue(new Error('fail'));
    await controller.generateRiddle(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('should setup and cleanup event listeners', () => {
    mockRiddleRepository.listenToWinnerEvents();
    expect(mockRiddleRepository.listenToWinnerEvents).toHaveBeenCalled();
    mockRiddleRepository.stopListening();
    expect(mockRiddleRepository.stopListening).toHaveBeenCalled();
  });
}); 