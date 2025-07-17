import { ethers, ContractTransactionResponse } from 'ethers';

const RIDDLE_ABI = [
  "function riddle() external view returns (string memory)",
  "function submitAnswer(string memory _answer) external",
  "function winner() external view returns (address)",
  "function isActive() external view returns (bool)",
  "function bot() external view returns (address)"
];

export class RiddleContract {
  private contract: any;
  public provider: ethers.Provider;
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
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Contract call timeout after 25 seconds')), 25000);
      });
      
      const resultPromise = this.contract.riddle();
      const result = await Promise.race([resultPromise, timeoutPromise]);
      
      return result;
    } catch (error) {
      throw new Error(`Failed to get current riddle: ${String(error)}`);
    }
  }

  async submitAnswer(answer: string): Promise<ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const tx = await this.contract.submitAnswer(answer);
      return tx;
    } catch (error) {
      throw new Error(`Failed to submit answer: ${String(error)}`);
    }
  }

  async getWinner(): Promise<string> {
    try {
      return await this.contract.winner();
    } catch (error) {
      throw new Error(`Failed to get winner: ${String(error)}`);
    }
  }

  async isActive(): Promise<boolean> {
    try {
      return await this.contract.isActive();
    } catch (error) {
      throw new Error(`Failed to check if active: ${String(error)}`);
    }
  }
}

export default RiddleContract; 