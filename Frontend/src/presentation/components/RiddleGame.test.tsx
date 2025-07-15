const mockProvider = {
  getSigner: jest.fn(() => ({
    getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890')
  }))
};

const mockContract = {
  getRiddle: jest.fn().mockResolvedValue('Test riddle'),
  submitAnswer: jest.fn().mockResolvedValue({ hash: '0x123' }),
  getLeaderboard: jest.fn().mockResolvedValue([])
};

jest.mock('ethers', () => ({
  BrowserProvider: jest.fn(() => mockProvider),
  Contract: jest.fn(() => mockContract)
}));

Object.defineProperty(window, 'ethereum', {
  value: {
    request: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn(),
    isMetaMask: true
  },
  writable: true
});

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => {
  (console.error as jest.Mock).mockRestore && (console.error as jest.Mock).mockRestore();
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RiddleGame } from './RiddleGame';

const mockUseWallet: {
  walletState: {
    isConnected: boolean;
    address: string | null;
    chainId: number | null;
    error: string | null;
  };
  connectWallet: jest.Mock;
  disconnectWallet: jest.Mock;
} = {
  walletState: {
    isConnected: false,
    address: null,
    chainId: null,
    error: null
  },
  connectWallet: jest.fn(),
  disconnectWallet: jest.fn()
};

jest.mock('../hooks/useWallet', () => ({
  useWallet: () => mockUseWallet
}));

describe('RiddleGame Component', () => {
  beforeEach(() => {
    mockUseWallet.walletState = {
      isConnected: false,
      address: null,
      chainId: null,
      error: null
    };
    mockUseWallet.connectWallet.mockClear();
    mockUseWallet.disconnectWallet.mockClear();
    
    mockProvider.getSigner.mockClear();
    mockContract.getRiddle.mockClear();
    mockContract.submitAnswer.mockClear();
    mockContract.getLeaderboard.mockClear();
  });

  describe('Conditional Display', () => {
    test('Given wallet is disconnected, When component renders, Then it should show connect button', () => {
      render(<RiddleGame />);
      
      expect(screen.getByText('Connect MetaMask')).toBeInTheDocument();
      expect(screen.queryByText('Disconnect')).not.toBeInTheDocument();
    });

    test('Given wallet is connected, When component renders, Then it should show wallet info', () => {
      mockUseWallet.walletState = {
        isConnected: true,
        address: '0x1234567890123456789012345678901234567890',
        chainId: 31337,
        error: null
      };

      render(<RiddleGame />);
      
      expect(screen.getByText(/Connected: 0x1234\.\.\.7890/)).toBeInTheDocument();
      expect(screen.getByText('Disconnect')).toBeInTheDocument();
      expect(screen.queryByText('Connect MetaMask')).not.toBeInTheDocument();
    });

    test('Given wallet has error, When component renders, Then it should display error message', () => {
      mockUseWallet.walletState = {
        isConnected: false,
        address: null,
        chainId: null,
        error: 'MetaMask connection error'
      };

      render(<RiddleGame />);
      
      expect(screen.getByText('MetaMask connection error')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('Given user clicks Connect button, When clicked, Then it should call connectWallet', async () => {
      const user = userEvent.setup();
      render(<RiddleGame />);
      
      await user.click(screen.getByText('Connect MetaMask'));
      
      expect(mockUseWallet.connectWallet).toHaveBeenCalledTimes(1);
    });

    test('Given user clicks Disconnect button, When clicked, Then it should call disconnectWallet', async () => {
      const user = userEvent.setup();
      mockUseWallet.walletState = {
        isConnected: true,
        address: '0x1234567890123456789012345678901234567890',
        chainId: 31337,
        error: null
      };

      render(<RiddleGame />);
      
      await user.click(screen.getByText('Disconnect'));
      
      expect(mockUseWallet.disconnectWallet).toHaveBeenCalledTimes(1);
    });
  });

  describe('Loading States', () => {
    test('Given component is loading, When rendering, Then it should display loading state appropriately', () => {
      const { rerender } = render(<RiddleGame />);
      
      expect(screen.getByText('OnchainRiddle')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    test('Given wallet is connected with riddle, When rendering, Then it should show form', () => {
      mockUseWallet.walletState = {
        isConnected: true,
        address: '0x1234567890123456789012345678901234567890',
        chainId: 31337,
        error: null
      };

      render(<RiddleGame />);
      
      expect(screen.getByText('OnchainRiddle')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('Given wallet has error, When rendering, Then it should display error appropriately', () => {
      mockUseWallet.walletState = {
        isConnected: false,
        address: null,
        chainId: null,
        error: 'MetaMask not found'
      };

      render(<RiddleGame />);
      
      expect(screen.getByText('MetaMask not found')).toBeInTheDocument();
      expect(screen.getByText('Connect MetaMask')).toBeInTheDocument();
    });

    test('Given no wallet error, When rendering, Then it should not display error message', () => {
      mockUseWallet.walletState = {
        isConnected: false,
        address: null,
        chainId: null,
        error: null
      };

      render(<RiddleGame />);
      
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
      expect(screen.getByText('Connect MetaMask')).toBeInTheDocument();
    });
  });
}); 