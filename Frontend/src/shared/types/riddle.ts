export interface Riddle {
  id: string;
  question: string;
  isActive: boolean;
  winner?: string;
  botAddress: string;
}

export interface RiddleSubmission {
  answer: string;
  playerName: string;
  playerAddress: string;
}

export interface RiddleState {
  currentRiddle: Riddle | null;
  isLoading: boolean;
  error: string | null;
  isSubmitting: boolean;
  submissionResult: 'success' | 'error' | null;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  error: string | null;
} 