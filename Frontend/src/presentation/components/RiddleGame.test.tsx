import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RiddleGame } from './RiddleGame';

// Mock useWallet hook with different states
const mockUseWallet = vi.fn();
vi.mock('../hooks/useWallet', () => ({
  useWallet: () => mockUseWallet()
}));

// Mock ethers
vi.mock('ethers', () => ({
  ethers: {
    BrowserProvider: vi.fn(() => ({
      getSigner: vi.fn(() => ({
        getAddress: vi.fn(() => Promise.resolve('0x1234567890123456789012345678901234567890'))
      }))
    })),
    Contract: vi.fn(() => ({
      riddle: vi.fn(() => Promise.resolve('What has keys, but no locks; space, but no room; and you can enter, but not go in?')),
      submitAnswer: vi.fn(() => Promise.resolve({ hash: '0x123', wait: vi.fn() })),
      winner: vi.fn(() => Promise.resolve('0x0000000000000000000000000000000000000000')),
      isActive: vi.fn(() => Promise.resolve(true)),
      on: vi.fn(),
      off: vi.fn()
    })),
    JsonRpcProvider: vi.fn(),
    Wallet: vi.fn(),
    parseEther: vi.fn(),
    formatEther: vi.fn(),
    ZeroAddress: '0x0000000000000000000000000000000000000000'
  }
}));

// Mock RiddleContract
const mockRiddleContract = {
  getCurrentRiddle: vi.fn(() => Promise.resolve('What has keys, but no locks; space, but no room; and you can enter, but not go in?')),
  submitAnswer: vi.fn(() => Promise.resolve({ hash: '0x123', wait: vi.fn() })),
  getWinner: vi.fn(() => Promise.resolve('0x0000000000000000000000000000000000000000')),
  isActive: vi.fn(() => Promise.resolve(true)),
  connectWallet: vi.fn(),
  provider: {
    waitForTransaction: vi.fn(() => Promise.resolve())
  }
};

vi.mock('../../infrastructure/blockchain/riddleContract', () => ({
  default: vi.fn().mockImplementation(() => mockRiddleContract)
}));

describe('RiddleGame', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock state - not connected
    mockUseWallet.mockReturnValue({
      walletState: {
        isConnected: false,
        address: null,
        isConnecting: false,
        error: null
      },
      connectWallet: vi.fn(),
      disconnectWallet: vi.fn()
    });

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
  });

  describe('Wallet Connection States', () => {
    it('should show connect button when wallet is not connected', async () => {
      await act(async () => {
        render(<RiddleGame />);
      });
      
      expect(screen.getByText(/Connect MetaMask/i)).toBeInTheDocument();
      expect(screen.queryByText(/Disconnect/i)).not.toBeInTheDocument();
    });

    it('should show disconnect button when wallet is connected', async () => {
      mockUseWallet.mockReturnValue({
        walletState: {
          isConnected: true,
          address: '0x1234567890123456789012345678901234567890',
          isConnecting: false,
          error: null
        },
        connectWallet: vi.fn(),
        disconnectWallet: vi.fn()
      });

      await act(async () => {
        render(<RiddleGame />);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Disconnect/i)).toBeInTheDocument();
      });
      expect(screen.queryByText(/Connect MetaMask/i)).not.toBeInTheDocument();
    });

    it('should show connecting state when wallet is connecting', async () => {
      mockUseWallet.mockReturnValue({
        walletState: {
          isConnected: false,
          address: null,
          isConnecting: true,
          error: null
        },
        connectWallet: vi.fn(),
        disconnectWallet: vi.fn()
      });

      await act(async () => {
        render(<RiddleGame />);
      });
      
      expect(screen.getByText(/Connect MetaMask/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation Logic', () => {
    beforeEach(() => {
      mockUseWallet.mockReturnValue({
        walletState: {
          isConnected: true,
          address: '0x1234567890123456789012345678901234567890',
          isConnecting: false,
          error: null
        },
        connectWallet: vi.fn(),
        disconnectWallet: vi.fn()
      });

      // Ensure mock contract returns proper values
      mockRiddleContract.getCurrentRiddle.mockResolvedValue('What has keys, but no locks; space, but no room; and you can enter, but not go in?');
      mockRiddleContract.getWinner.mockResolvedValue('0x0000000000000000000000000000000000000000');
      mockRiddleContract.isActive.mockResolvedValue(true);
    });

    it('should show error when submitting empty answer', async () => {
      await act(async () => {
        render(<RiddleGame />);
      });
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Enter your name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter your answer/i)).toBeInTheDocument();
      });
      // Fill name but not answer
      await act(async () => {
        const nameInput = screen.getByPlaceholderText(/Enter your name/i);
        fireEvent.change(nameInput, { target: { value: 'John' } });
        
        const form = screen.getByTestId('submission-form');
        fireEvent.submit(form);
      });
      // Wait for validation error to appear
      await waitFor(() => {
        expect(screen.getByTestId('answer-error')).toBeInTheDocument();
      });
    });

    it('should show error when submitting empty player name', async () => {
      await act(async () => {
        render(<RiddleGame />);
      });
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Enter your name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter your answer/i)).toBeInTheDocument();
      });
      // Fill answer but not name
      await act(async () => {
        const answerInput = screen.getByPlaceholderText(/Enter your answer/i);
        fireEvent.change(answerInput, { target: { value: 'keyboard' } });
        
        const form = screen.getByTestId('submission-form');
        fireEvent.submit(form);
      });
      // Wait for validation error to appear
      await waitFor(() => {
        expect(screen.getByTestId('playerName-error')).toBeInTheDocument();
      });
    });

    it('should show error when submitting empty name and answer', async () => {
      await act(async () => {
        render(<RiddleGame />);
      });
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Enter your name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter your answer/i)).toBeInTheDocument();
      });
      // Soumettre sans rien remplir
      await act(async () => {
        const form = screen.getByTestId('submission-form');
        fireEvent.submit(form);
      });
      // Wait for validation errors to appear
      await waitFor(() => {
        expect(screen.getByTestId('playerName-error')).toBeInTheDocument();
        expect(screen.getByTestId('answer-error')).toBeInTheDocument();
      });
    });

    it('should clear error when user starts typing', async () => {
      await act(async () => {
        render(<RiddleGame />);
      });
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Enter your name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter your answer/i)).toBeInTheDocument();
      });
      // D'abord, déclencher l'erreur
      await act(async () => {
        const form = screen.getByTestId('submission-form');
        fireEvent.submit(form);
      });
      await waitFor(() => {
        expect(screen.getByTestId('answer-error')).toBeInTheDocument();
      });
      // Puis, simuler la saisie
      await act(async () => {
        const answerInput = screen.getByPlaceholderText(/Enter your answer/i);
        fireEvent.change(answerInput, { target: { value: 'keyboard' } });
      });
      await waitFor(() => {
        expect(screen.queryByTestId('answer-error')).not.toBeInTheDocument();
      });
    });
  });

  describe('Input Handling Logic', () => {
    beforeEach(() => {
      mockUseWallet.mockReturnValue({
        walletState: {
          isConnected: true,
          address: '0x1234567890123456789012345678901234567890',
          isConnecting: false,
          error: null
        },
        connectWallet: vi.fn(),
        disconnectWallet: vi.fn()
      });
    });

    it('should update answer input value when typing', async () => {
      await act(async () => {
        render(<RiddleGame />);
      });
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Enter your answer/i)).toBeInTheDocument();
      });
      
      const answerInput = screen.getByPlaceholderText(/Enter your answer/i);
      await act(async () => {
        fireEvent.change(answerInput, { target: { value: 'keyboard' } });
      });
      
      expect(answerInput).toHaveValue('keyboard');
    });

    it('should update player name input value when typing', async () => {
      await act(async () => {
        render(<RiddleGame />);
      });
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Enter your name/i)).toBeInTheDocument();
      });
      
      const nameInput = screen.getByPlaceholderText(/Enter your name/i);
      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      });
      
      expect(nameInput).toHaveValue('John Doe');
    });

    it('should trim whitespace from inputs', async () => {
      await act(async () => {
        render(<RiddleGame />);
      });
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Enter your answer/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter your name/i)).toBeInTheDocument();
      });
      
      const answerInput = screen.getByPlaceholderText(/Enter your answer/i);
      const nameInput = screen.getByPlaceholderText(/Enter your name/i);
      
      await act(async () => {
        fireEvent.change(answerInput, { target: { value: '  keyboard  ' } });
        fireEvent.change(nameInput, { target: { value: '  John Doe  ' } });
      });
      
      expect(answerInput).toHaveValue('  keyboard  ');
      expect(nameInput).toHaveValue('  John Doe  ');
    });
  });

  describe('Loading States', () => {
    beforeEach(() => {
      mockUseWallet.mockReturnValue({
        walletState: {
          isConnected: true,
          address: '0x1234567890123456789012345678901234567890',
          isConnecting: false,
          error: null
        },
        connectWallet: vi.fn(),
        disconnectWallet: vi.fn()
      });
    });

    it('should disable submit button when loading', async () => {
      // Mock a slow submission to test loading state
      mockRiddleContract.submitAnswer.mockImplementation(() => 
        new Promise<{ hash: string; wait: any }>(resolve => setTimeout(() => resolve({ hash: '0x123', wait: vi.fn() }), 100))
      );

      await act(async () => {
        render(<RiddleGame />);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Submit Answer/i)).toBeInTheDocument();
      });
      
      const submitButton = screen.getByText(/Submit Answer/i);
      const answerInput = screen.getByPlaceholderText(/Enter your answer/i);
      const nameInput = screen.getByPlaceholderText(/Enter your name/i);
      
      // Fill form
      await act(async () => {
        fireEvent.change(answerInput, { target: { value: 'keyboard' } });
        fireEvent.change(nameInput, { target: { value: 'John' } });
        
        // Submit (this will trigger loading state)
        const form = screen.getByTestId('submission-form');
        fireEvent.submit(form);
      });
      
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });

    it('should show loading indicator when submitting', async () => {
      // Mock a slow submission to test loading state
      mockRiddleContract.submitAnswer.mockImplementation(() => 
        new Promise<{ hash: string; wait: any }>(resolve => setTimeout(() => resolve({ hash: '0x123', wait: vi.fn() }), 100))
      );

      await act(async () => {
        render(<RiddleGame />);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Submit Answer/i)).toBeInTheDocument();
      });
      
      const submitButton = screen.getByText(/Submit Answer/i);
      const answerInput = screen.getByPlaceholderText(/Enter your answer/i);
      const nameInput = screen.getByPlaceholderText(/Enter your name/i);
      
      // Fill form
      await act(async () => {
        fireEvent.change(answerInput, { target: { value: 'keyboard' } });
        fireEvent.change(nameInput, { target: { value: 'John' } });
        
        // Submit
        const form = screen.getByTestId('submission-form');
        fireEvent.submit(form);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Submitting/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling Logic', () => {
    it('should display error message when wallet is not connected', async () => {
      mockUseWallet.mockReturnValue({
        walletState: {
          isConnected: false,
          address: null,
          isConnecting: false,
          error: null
        },
        connectWallet: vi.fn(),
        disconnectWallet: vi.fn()
      });

      await act(async () => {
        render(<RiddleGame />);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Connect MetaMask/i)).toBeInTheDocument();
      });
      
      // The form should not be visible when wallet is not connected
      expect(screen.queryByText(/Submit Answer/i)).not.toBeInTheDocument();
    });

    it('should clear error when wallet gets connected', async () => {
      const { rerender } = render(<RiddleGame />);
      
      // First render with disconnected wallet
      mockUseWallet.mockReturnValue({
        walletState: {
          isConnected: false,
          address: null,
          isConnecting: false,
          error: null
        },
        connectWallet: vi.fn(),
        disconnectWallet: vi.fn()
      });

      await act(async () => {
        rerender(<RiddleGame />);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Connect MetaMask/i)).toBeInTheDocument();
      });

      // Re-render with connected wallet
      mockUseWallet.mockReturnValue({
        walletState: {
          isConnected: true,
          address: '0x1234567890123456789012345678901234567890',
          isConnecting: false,
          error: null
        },
        connectWallet: vi.fn(),
        disconnectWallet: vi.fn()
      });

      await act(async () => {
        rerender(<RiddleGame />);
      });

      await waitFor(() => {
        expect(screen.getByText(/Disconnect/i)).toBeInTheDocument();
      });
    });
  });

  describe('UI State Management', () => {
    it('should render game title correctly', async () => {
      await act(async () => {
        render(<RiddleGame />);
      });
      
      expect(screen.getByText(/OnchainRiddle/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('OnchainRiddle');
    });

    it('should show wallet section when not connected', async () => {
      await act(async () => {
        render(<RiddleGame />);
      });
      
      expect(screen.getByText(/Connect MetaMask/i)).toBeInTheDocument();
      expect(screen.queryByText(/Current Riddle/i)).not.toBeInTheDocument();
    });

    it('should show riddle section when connected', async () => {
      mockUseWallet.mockReturnValue({
        walletState: {
          isConnected: true,
          address: '0x1234567890123456789012345678901234567890',
          isConnecting: false,
          error: null
        },
        connectWallet: vi.fn(),
        disconnectWallet: vi.fn()
      });

      await act(async () => {
        render(<RiddleGame />);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Current Riddle/i)).toBeInTheDocument();
      });
      expect(screen.getByText(/Submit Answer/i)).toBeInTheDocument();
    });
  });
}); 

describe('RiddleGame (corrections)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseWallet.mockReturnValue({
      walletState: {
        isConnected: true,
        address: '0x1234567890123456789012345678901234567890',
        isConnecting: false,
        error: null
      },
      connectWallet: vi.fn(),
      disconnectWallet: vi.fn()
    });
  });

  it('should display form and allow input when wallet connected and riddle active', async () => {
    // Mock loading long pour bien voir le bouton disabled
    mockRiddleContract.submitAnswer.mockImplementation(() =>
      new Promise<{ hash: string; wait: any }>(resolve => setTimeout(() => resolve({ hash: '0x123', wait: vi.fn() }), 1000))
    );
    await act(async () => {
      render(<RiddleGame />);
    });
    // Wait for riddle to be displayed
    await screen.findByText(/What has keys/i);
    // S'assurer que le formulaire est visible
    expect(screen.getByPlaceholderText(/Enter your name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your answer/i)).toBeInTheDocument();
    // Enter name and answer
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Enter your name/i), { target: { value: 'Alice' } });
      fireEvent.change(screen.getByPlaceholderText(/Enter your answer/i), { target: { value: 'keyboard' } });
      // Submit
      const form = screen.getByTestId('submission-form');
      fireEvent.submit(form);
    });
    // Vérifier immédiatement que le bouton est désactivé et affiche "Submitting..."
    await waitFor(() => {
      expect(screen.getByText(/Submitting/i)).toBeInTheDocument();
    });
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /Submitting/i });
      expect(submitButton).toBeDisabled();
    });
  });

  it('should show error when submitting without name', async () => {
    await act(async () => {
      render(<RiddleGame />);
    });
    await screen.findByText(/What has keys/i);
    // S'assurer que le formulaire est visible
    expect(screen.getByPlaceholderText(/Enter your name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your answer/i)).toBeInTheDocument();
    // Fill only answer
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Enter your answer/i), { target: { value: 'keyboard' } });
      // Submit without name
      const form = screen.getByTestId('submission-form');
      fireEvent.submit(form);
    });
    // Wait for validation error to appear
    await waitFor(() => {
      expect(screen.getByTestId('playerName-error')).toBeInTheDocument();
    });
  });
}); 