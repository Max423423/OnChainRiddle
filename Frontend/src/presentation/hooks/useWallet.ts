import { useState, useEffect, useCallback } from 'react';
import { WalletState } from '../../shared/types/riddle';
import { BrowserProvider } from 'ethers';

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    error: null
  });

  const connectWallet = useCallback(async () => {
    try {
      setWalletState(prev => ({ ...prev, error: null }));
      
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to use this application.');
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) || [];
      const address = accounts[0] || null;
      
      if (!address) {
        throw new Error('No account selected. Please select an account in MetaMask.');
      }
      
      const provider = new BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      
      setWalletState({
        isConnected: !!address,
        address,
        chainId: address ? chainId : null,
        error: null
      });
    } catch (error) {
      setWalletState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to connect wallet. Please try again.'
      }));
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWalletState({
      isConnected: false,
      address: null,
      chainId: null,
      error: null
    });
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setWalletState(prev => ({
            ...prev,
            address: accounts[0]
          }));
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [disconnectWallet]);

  return {
    walletState,
    connectWallet,
    disconnectWallet
  };
}; 