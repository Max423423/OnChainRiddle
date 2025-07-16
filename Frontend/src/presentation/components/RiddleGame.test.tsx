import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RiddleGame } from './RiddleGame';

// Mock ethers
vi.mock('ethers', () => ({
  ethers: {
    BrowserProvider: vi.fn(),
    Contract: vi.fn(),
    JsonRpcProvider: vi.fn(),
    Wallet: vi.fn(),
    parseEther: vi.fn(),
    formatEther: vi.fn(),
    ZeroAddress: '0x0000000000000000000000000000000000000000'
  }
}));

// Mock the contract ABI
const mockContract = {
  riddle: vi.fn(),
  submitAnswer: vi.fn(),
  winner: vi.fn(),
  isActive: vi.fn(),
  on: vi.fn(),
  off: vi.fn()
};

// Mock the provider
const mockProvider = {
  getSigner: vi.fn(() => ({
    getAddress: vi.fn(() => Promise.resolve('0x1234567890123456789012345678901234567890'))
  }))
};

describe('RiddleGame', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock window.ethereum
    Object.defineProperty(window, 'ethereum', {
      value: {
        request: vi.fn(),
        on: vi.fn(),
        removeListener: vi.fn(),
        isMetaMask: true
      },
      writable: true
    });

    // Mock contract methods
    mockContract.riddle.mockResolvedValue('What has keys, but no locks; space, but no room; and you can enter, but not go in?');
    mockContract.isActive.mockResolvedValue(true);
    mockContract.winner.mockResolvedValue('0x0000000000000000000000000000000000000000');
    mockContract.submitAnswer.mockResolvedValue({ wait: vi.fn() });
  });

  it('should render the game interface', () => {
    render(<RiddleGame />);
    
    expect(screen.getByText(/Connect MetaMask/i)).toBeInTheDocument();
    expect(screen.getByText(/OnchainRiddle/i)).toBeInTheDocument();
  });

  it('should show connect wallet button when not connected', () => {
    render(<RiddleGame />);
    
    const connectButton = screen.getByText(/Connect MetaMask/i);
    expect(connectButton).toBeInTheDocument();
  });

  it('should handle wallet connection', async () => {
    const mockRequest = vi.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']);
    
    Object.defineProperty(window, 'ethereum', {
      value: {
        request: mockRequest,
        on: vi.fn(),
        removeListener: vi.fn(),
        isMetaMask: true
      },
      writable: true
    });

    render(<RiddleGame />);
    
    const connectButton = screen.getByText(/Connect MetaMask/i);
    fireEvent.click(connectButton);

    await waitFor(() => {
      expect(mockRequest).toHaveBeenCalledWith({ method: 'eth_requestAccounts' });
    });
  });

  it('should display current riddle when connected and active', async () => {
    // Mock connected state
    const mockRequest = vi.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']);
    
    Object.defineProperty(window, 'ethereum', {
      value: {
        request: mockRequest,
        on: vi.fn(),
        removeListener: vi.fn(),
        isMetaMask: true
      },
      writable: true
    });

    render(<RiddleGame />);
    
    const connectButton = screen.getByText(/Connect MetaMask/i);
    fireEvent.click(connectButton);

    await waitFor(() => {
      expect(screen.getByText(/What has keys/i)).toBeInTheDocument();
    });
  });

  it('should handle answer submission', async () => {
    // Mock connected state
    const mockRequest = vi.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']);
    
    Object.defineProperty(window, 'ethereum', {
      value: {
        request: mockRequest,
        on: vi.fn(),
        removeListener: vi.fn(),
        isMetaMask: true
      },
      writable: true
    });

    render(<RiddleGame />);
    
    const connectButton = screen.getByText(/Connect MetaMask/i);
    fireEvent.click(connectButton);

    await waitFor(() => {
      const answerInput = screen.getByPlaceholderText(/Enter your answer/i);
      const submitButton = screen.getByText(/Submit Answer/i);
      
      fireEvent.change(answerInput, { target: { value: 'keyboard' } });
      fireEvent.click(submitButton);
    });
  });

  it('should show error message for invalid answer', async () => {
    // Mock connected state
    const mockRequest = vi.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']);
    
    Object.defineProperty(window, 'ethereum', {
      value: {
        request: mockRequest,
        on: vi.fn(),
        removeListener: vi.fn(),
        isMetaMask: true
      },
      writable: true
    });

    render(<RiddleGame />);
    
    const connectButton = screen.getByText(/Connect MetaMask/i);
    fireEvent.click(connectButton);

    await waitFor(() => {
      const answerInput = screen.getByPlaceholderText(/Enter your answer/i);
      const submitButton = screen.getByText(/Submit Answer/i);
      
      // Submit empty answer
      fireEvent.click(submitButton);
      
      expect(screen.getByText(/Please enter an answer/i)).toBeInTheDocument();
    });
  });
}); 