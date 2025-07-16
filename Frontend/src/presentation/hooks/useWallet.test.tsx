beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => {
  (console.error as jest.Mock).mockRestore && (console.error as jest.Mock).mockRestore();
});

jest.mock('ethers', () => {
  class MockBrowserProvider {
    constructor(_: any) {}
    async getNetwork() {
      return { chainId: BigInt(1) };
    }
  }
  return {
    __esModule: true,
    BrowserProvider: MockBrowserProvider
  };
});

import { renderHook, act } from '@testing-library/react';
import { useWallet } from './useWallet';

const mockEthereum = {
  request: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
  isMetaMask: true
};

Object.defineProperty(window, 'ethereum', {
  value: mockEthereum,
  writable: true
});

describe('useWallet Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEthereum.request.mockReset();
    mockEthereum.on.mockReset();
    mockEthereum.removeListener.mockReset();
    (window as any).ethereum = mockEthereum;
  });

  test('should connect wallet successfully', async () => {
    const mockAddress = '0x1234567890123456789012345678901234567890';
    mockEthereum.request
      .mockResolvedValueOnce([mockAddress])
      .mockResolvedValueOnce('0x1');

    const { result } = renderHook(() => useWallet());

    await act(async () => {
      await result.current.connectWallet();
    });

    expect(result.current.walletState).toEqual({
      isConnected: true,
      address: mockAddress,
      chainId: 1,
      error: null
    });
  });

  test('should handle connection error', async () => {
    mockEthereum.request.mockRejectedValueOnce(new Error('User rejected'));

    const { result } = renderHook(() => useWallet());

    await act(async () => {
      await result.current.connectWallet();
    });

    expect(result.current.walletState.error).toBe('User rejected');
  });
}); 