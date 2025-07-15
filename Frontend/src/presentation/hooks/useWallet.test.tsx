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

Object.defineProperty(window, 'location', {
  value: {
    reload: jest.fn()
  },
  writable: true
});

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

  describe('Initial State', () => {
    test('Given a new useWallet hook, When initialized, Then it should start with disconnected state', () => {
      const { result } = renderHook(() => useWallet());

      expect(result.current.walletState).toEqual({
        isConnected: false,
        address: null,
        chainId: null,
        error: null
      });
    });
  });

  describe('Wallet Connection', () => {
    test('Given MetaMask is available, When connecting wallet successfully, Then it should update state with address and chainId', async () => {
      const mockAddress = '0x1234567890123456789012345678901234567890';
      const mockChainId = '0x1';

      mockEthereum.request
        .mockResolvedValueOnce([mockAddress])
        .mockResolvedValueOnce(mockChainId);

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connectWallet();
      });

      expect(mockEthereum.request).toHaveBeenCalledWith({
        method: 'eth_requestAccounts'
      });

      expect(result.current.walletState).toEqual({
        isConnected: true,
        address: mockAddress,
        chainId: 1,
        error: null
      });
    });

    test('Given MetaMask request fails, When connecting wallet, Then it should set error state', async () => {
      const errorMessage = 'User rejected request';
      mockEthereum.request.mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connectWallet();
      });

      expect(result.current.walletState).toEqual({
        isConnected: false,
        address: null,
        chainId: null,
        error: errorMessage
      });
    });

    test('Given MetaMask is not installed, When connecting wallet, Then it should set appropriate error', async () => {
      delete (window as any).ethereum;

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connectWallet();
      });

      expect(result.current.walletState).toEqual({
        isConnected: false,
        address: null,
        chainId: null,
        error: 'MetaMask is not installed'
      });
    });
  });

  describe('Wallet Disconnection', () => {
    test('Given a connected wallet, When disconnecting, Then it should reset to initial state', async () => {
      const mockAddress = '0x1234567890123456789012345678901234567890';
      mockEthereum.request
        .mockResolvedValueOnce([mockAddress])
        .mockResolvedValueOnce('0x1');

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connectWallet();
      });

      await act(async () => {
        await result.current.disconnectWallet();
      });

      expect(result.current.walletState).toEqual({
        isConnected: false,
        address: null,
        chainId: null,
        error: null
      });
    });
  });

  describe('Event Listeners', () => {
    test('Given useWallet hook mounts, When initialized, Then it should set up event listeners', () => {
      renderHook(() => useWallet());

      expect(mockEthereum.on).toHaveBeenCalledWith('accountsChanged', expect.any(Function));
      expect(mockEthereum.on).toHaveBeenCalledWith('chainChanged', expect.any(Function));
    });

    test('Given useWallet hook unmounts, When cleanup occurs, Then it should remove event listeners', () => {
      const { unmount } = renderHook(() => useWallet());

      unmount();

      expect(mockEthereum.removeListener).toHaveBeenCalledWith('accountsChanged', expect.any(Function));
      expect(mockEthereum.removeListener).toHaveBeenCalledWith('chainChanged', expect.any(Function));
    });
  });

  describe('Account Change Handling', () => {
    test('Given account changes in MetaMask, When accountsChanged event fires, Then it should update address', async () => {
      const initialAddress = '0x1234567890123456789012345678901234567890';
      const newAddress = '0x9876543210987654321098765432109876543210';

      mockEthereum.request
        .mockResolvedValueOnce([initialAddress])
        .mockResolvedValueOnce('0x1');

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connectWallet();
      });

      const accountsChangedCallback = mockEthereum.on.mock.calls.find(
        call => call[0] === 'accountsChanged'
      )?.[1];

      if (accountsChangedCallback) {
        await act(async () => {
          accountsChangedCallback([newAddress]);
        });
      }

      expect(result.current.walletState.address).toBe(newAddress);
    });

    test('Given all accounts are disconnected, When accountsChanged event fires with empty array, Then it should disconnect wallet', async () => {
      const initialAddress = '0x1234567890123456789012345678901234567890';

      mockEthereum.request
        .mockResolvedValueOnce([initialAddress])
        .mockResolvedValueOnce('0x1');

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connectWallet();
      });

      const accountsChangedCallback = mockEthereum.on.mock.calls.find(
        call => call[0] === 'accountsChanged'
      )?.[1];

      if (accountsChangedCallback) {
        await act(async () => {
          accountsChangedCallback([]);
        });
      }

      expect(result.current.walletState).toEqual({
        isConnected: false,
        address: null,
        chainId: null,
        error: null
      });
    });
  });

  describe('Network Change Handling', () => {
    test('Given network changes in MetaMask, When chainChanged event fires, Then it should reload page', async () => {
      const mockAddress = '0x1234567890123456789012345678901234567890';

      mockEthereum.request
        .mockResolvedValueOnce([mockAddress])
        .mockResolvedValueOnce('0x1');

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connectWallet();
      });

      const chainChangedCallback = mockEthereum.on.mock.calls.find(
        call => call[0] === 'chainChanged'
      )?.[1];

      if (chainChangedCallback) {
        await act(async () => {
          chainChangedCallback('0x5');
        });
      }

      expect(window.location.reload).toHaveBeenCalled();
    });
  });
}); 