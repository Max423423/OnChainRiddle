import { beforeAll, afterAll, beforeEach, describe, test, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWallet } from './useWallet';

beforeAll(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  vi.restoreAllMocks();
});

vi.mock('ethers', () => {
  class MockBrowserProvider {
    constructor(_: any) {}

    async getNetwork() {
      return { chainId: BigInt(1) };
    }

    async getSigner() {
      return {
        getAddress: async () => '0x1234567890123456789012345678901234567890'
      };
    }
  }

  return {
    __esModule: true,
    BrowserProvider: MockBrowserProvider
  };
});

const mockEthereum = {
  request: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn(),
  isMetaMask: true
};

Object.defineProperty(window, 'ethereum', {
  value: mockEthereum,
  writable: true
});

describe('useWallet Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEthereum.request.mockReset();
    mockEthereum.on.mockReset();
    mockEthereum.removeListener.mockReset();
    (window as any).ethereum = mockEthereum;
  });

  test('should connect wallet successfully', async () => {
    const mockAddress = '0x1234567890123456789012345678901234567890';
    mockEthereum.request.mockResolvedValueOnce([mockAddress]);

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