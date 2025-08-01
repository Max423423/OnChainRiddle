const RiddleController = require('../../src/presentation/controllers/riddleController');

jest.mock('../../src/application/use-cases/generateRiddleUseCase');
jest.mock('../../src/application/use-cases/handleWinnerUseCase');
jest.mock('../../src/domain/repositories/riddleRepository');

describe('RiddleController', () => {
  let controller;
  let mockGenerateRiddleUseCase;
  let mockHandleWinnerUseCase;
  let mockRiddleRepository;

  beforeEach(() => {
    mockGenerateRiddleUseCase = { execute: jest.fn() };
    mockHandleWinnerUseCase = { execute: jest.fn() };
    mockRiddleRepository = { findActive: jest.fn(), findLatest: jest.fn() };
    controller = new RiddleController(mockGenerateRiddleUseCase, mockHandleWinnerUseCase, mockRiddleRepository);
  });

  it('should return health status', async () => {
    const req = {};
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    await controller.getHealth(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'OK' }));
  });

  it('should return 200 and riddle data on generateRiddle success', async () => {
    const req = { body: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    mockGenerateRiddleUseCase.execute.mockResolvedValue({ success: true, riddle: { id: 'test' }, message: 'ok' });
    await controller.generateRiddle(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('should return 400 on generateRiddle business error', async () => {
    const req = { body: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    mockGenerateRiddleUseCase.execute.mockResolvedValue({ success: false, error: 'already active' });
    await controller.generateRiddle(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('should return 500 on generateRiddle exception', async () => {
    const req = { body: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    mockGenerateRiddleUseCase.execute.mockRejectedValue(new Error('fail'));
    await controller.generateRiddle(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
}); 