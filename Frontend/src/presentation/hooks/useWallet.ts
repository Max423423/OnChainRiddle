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
        throw new Error('MetaMask is not installed');
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) || [];
      const address = accounts[0] || null;
      
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
        error: error instanceof Error ? error.message : 'Failed to connect wallet'
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

  // Écouter les changements de compte MetaMask
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // L'utilisateur s'est déconnecté
          disconnectWallet();
        } else {
          // Le compte a changé
          setWalletState(prev => ({
            ...prev,
            address: accounts[0]
          }));
        }
      };

      const handleChainChanged = () => {
        // Recharger la page quand le réseau change
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