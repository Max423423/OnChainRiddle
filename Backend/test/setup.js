process.env.NODE_ENV = 'test';

// Mock environment variables for testing
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.PRIVATE_KEY = '0x123456789abcdef';
process.env.CONTRACT_ADDRESS = '0x123456789';
process.env.RPC_URL = 'http://127.0.0.1:8545';

// Increase timeout for blockchain operations
jest.setTimeout(10000);

// Suppress console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}; 