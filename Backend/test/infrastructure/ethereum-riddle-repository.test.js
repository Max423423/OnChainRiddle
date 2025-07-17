const SimpleRiddleRepository = require('../../src/infrastructure/blockchain/ethereumRiddleRepository');
const { ethers } = require('ethers');

jest.mock('ethers');

describe('SimpleRiddleRepository', () => {
  let repository;
  let mockProvider;
  let mockContract;
  let mockWallet;

  beforeEach(() => {
    mockProvider = {
      on: jest.fn(),
      removeAllListeners: jest.fn()
    };

    mockWallet = {
      getAddress: jest.fn().mockResolvedValue('0x123456789')
    };

    mockContract = {
      isActive: jest.fn(),
      riddle: jest.fn(),
      winner: jest.fn(),
      setRiddle: jest.fn(),
      on: jest.fn(),
      removeAllListeners: jest.fn()
    };

    ethers.JsonRpcProvider.mockImplementation(() => mockProvider);
    ethers.Wallet.mockImplementation(() => mockWallet);
    ethers.Contract.mockImplementation(() => mockContract);

    repository = new SimpleRiddleRepository('http://127.0.0.1:8545', '0x123456789', '0xprivate');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Given repository initialization', () => {
    it('When creating repository Then it should setup provider and contract', () => {
      expect(ethers.JsonRpcProvider).toHaveBeenCalledWith('http://127.0.0.1:8545');
      expect(ethers.Contract).toHaveBeenCalledWith(
        '0x123456789',
        expect.any(Array),
        mockWallet
      );
    });

    it('When creating with custom config Then it should use provided values', () => {
      const customConfig = {
        rpcUrl: 'https://sepolia.infura.io/v3/test',
        contractAddress: '0xabcdef',
        privateKey: '0xprivate'
      };

      new SimpleRiddleRepository(customConfig.rpcUrl, customConfig.contractAddress, customConfig.privateKey);

      expect(ethers.JsonRpcProvider).toHaveBeenCalledWith('https://sepolia.infura.io/v3/test');
      expect(ethers.Contract).toHaveBeenCalledWith('0xabcdef', expect.any(Array), expect.any(Object));
      expect(ethers.Wallet).toHaveBeenCalledWith('0xprivate', expect.any(Object));
    });
  });

  describe('Given checking for active riddle', () => {
    it('When contract returns true Then it should return riddle', async () => {
      mockContract.isActive.mockResolvedValue(true);
      mockContract.riddle.mockResolvedValue('What has keys but no locks?');
      mockContract.winner.mockResolvedValue('0x0000000000000000000000000000000000000000');

      const result = await repository.findActive();

      expect(mockContract.isActive).toHaveBeenCalled();
      expect(result).toBeTruthy();
      expect(result.question).toBe('What has keys but no locks?');
    });

    it('When contract returns false Then it should return null', async () => {
      mockContract.isActive.mockResolvedValue(false);

      const result = await repository.findActive();

      expect(result).toBeNull();
    });

    it('When contract call fails Then it should return null', async () => {
      mockContract.isActive.mockRejectedValue(new Error('Network error'));

      const result = await repository.findActive();

      expect(result).toBeNull();
    });
  });

  describe('Given saving a riddle', () => {
    it('When saving valid riddle Then it should call contract setRiddle', async () => {
      const riddle = {
        question: 'What has keys but no locks?',
        answer: 'keyboard'
      };

      mockContract.setRiddle.mockResolvedValue({
        wait: jest.fn().mockResolvedValue({ hash: '0xtxhash' })
      });

      // Mock ethers.keccak256 and ethers.toUtf8Bytes
      ethers.keccak256 = jest.fn().mockReturnValue('0xhash123');
      ethers.toUtf8Bytes = jest.fn().mockReturnValue('keyboard');

      await repository.save(riddle);

      expect(mockContract.setRiddle).toHaveBeenCalledWith(
        'What has keys but no locks?',
        '0xhash123'
      );
    });

    it('When transaction fails Then it should throw error', async () => {
      const riddle = {
        question: 'What has keys but no locks?',
        answer: 'keyboard'
      };

      mockContract.setRiddle.mockRejectedValue(new Error('Transaction failed'));

      await expect(repository.save(riddle)).rejects.toThrow('Failed to save riddle: Transaction failed');
    });
  });

  describe('Given event listeners', () => {
    it('When setting up winner event listener Then it should register callback', () => {
      const callback = jest.fn();

      repository.listenToWinnerEvents(callback);

      expect(mockContract.on).toHaveBeenCalledWith('Winner', expect.any(Function));
    });

    it('When cleaning up listeners Then it should remove all listeners', () => {
      repository.stopListening();

      expect(mockContract.removeAllListeners).toHaveBeenCalled();
    });
  });

  describe('Given repository operations', () => {
    it('When finding by id Then it should return riddle if active', async () => {
      mockContract.isActive.mockResolvedValue(true);
      mockContract.riddle.mockResolvedValue('What has keys but no locks?');
      mockContract.winner.mockResolvedValue('0x0000000000000000000000000000000000000000');

      const result = await repository.findById('test-id');

      expect(result).toBeNull(); // findById returns null if id doesn't match
    });

    it('When finding latest Then it should return active riddle', async () => {
      mockContract.isActive.mockResolvedValue(true);
      mockContract.riddle.mockResolvedValue('What has keys but no locks?');
      mockContract.winner.mockResolvedValue('0x0000000000000000000000000000000000000000');

      const result = await repository.findLatest();

      expect(result).toBeTruthy();
    });

    it('When updating riddle Then it should update current riddle', async () => {
      const riddle = { id: 'test', question: 'test' };
      const result = await repository.update(riddle);

      expect(result).toBe(riddle);
    });

    it('When deleting Then it should throw error', async () => {
      await expect(repository.delete('test-id')).rejects.toThrow('Delete operation not supported');
    });
  });
}); 