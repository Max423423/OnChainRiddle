import { ethers } from 'ethers';

// ABI du contrat OnchainRiddle
const RIDDLE_ABI = [
  "function riddle() external view returns (string memory)",
  "function submitAnswer(string memory _answer) external",
  "function winner() external view returns (address)",
  "function isActive() external view returns (bool)",
  "function bot() external view returns (address)"
];

export class RiddleContract {
  private contract: any;
  private provider: ethers.Provider;
  private signer: ethers.Signer | null = null;

  constructor(contractAddress: string, provider: ethers.Provider) {
    this.provider = provider;
    this.contract = new ethers.Contract(contractAddress, RIDDLE_ABI, provider);
  }

  async connectWallet(signer: ethers.Signer) {
    this.signer = signer;
    this.contract = this.contract.connect(signer);
  }

  async getCurrentRiddle(): Promise<string> {
    try {
      console.log('Calling contract.riddle()...');
      
      // Ajouter un timeout de 10 secondes
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Contract call timeout after 10 seconds')), 10000);
      });
      
      const resultPromise = this.contract.riddle();
      const result = await Promise.race([resultPromise, timeoutPromise]);
      
      console.log('Contract call result:', result);
      return result;
    } catch (error) {
      console.error('Error getting current riddle:', error);
      return 'Error loading riddle';
    }
  }

  async submitAnswer(answer: string): Promise<ethers.ContractTransaction> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const tx = await this.contract.submitAnswer(answer);
      return tx;
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  }

  async getWinner(): Promise<string> {
    try {
      return await this.contract.winner();
    } catch (error) {
      console.error('Error getting winner:', error);
      return ethers.ZeroAddress;
    }
  }

  async isActive(): Promise<boolean> {
    try {
      return await this.contract.isActive();
    } catch (error) {
      console.error('Error checking if active:', error);
      return false;
    }
  }

  async getBot(): Promise<string> {
    try {
      return await this.contract.bot();
    } catch (error) {
      console.error('Error getting bot address:', error);
      return ethers.ZeroAddress;
    }
  }
}

export default RiddleContract; 