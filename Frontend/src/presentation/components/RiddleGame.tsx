import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import RiddleContract from '../../infrastructure/blockchain/riddleContract';
import { ethers } from 'ethers';
import './RiddleGame.css';

// Adresse du contrat déployé (via variable d'environnement)
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || ''; // Adresse du contrat déployé

export const RiddleGame: React.FC = () => {
  const { walletState, connectWallet, disconnectWallet } = useWallet();
  const [riddle, setRiddle] = useState<string>('');
  const [playerName, setPlayerName] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<'success' | 'error' | 'incorrect' | null>(null);
  const [riddleContract, setRiddleContract] = useState<RiddleContract | null>(null);
  const [winner, setWinner] = useState<string | null>(null);

  const loadCurrentRiddle = async () => {
    try {
      console.log('Loading current riddle...');
      setIsLoading(true);
      setError(null);
      
      if (walletState.isConnected && riddleContract) {
        console.log('Wallet connected and contract initialized, fetching riddle...');
        const currentRiddle = await riddleContract.getCurrentRiddle();
        const currentWinner = await riddleContract.getWinner();
        const isActive = await riddleContract.isActive();
        
        console.log('Riddle loaded:', currentRiddle);
        console.log('Winner:', currentWinner);
        console.log('Is active:', isActive);
        
        setRiddle(currentRiddle);
        setWinner(currentWinner !== ethers.ZeroAddress ? currentWinner : null);
        
        // Si l'énigme n'est plus active, réinitialiser le résultat
        if (!isActive) {
          setSubmissionResult(null);
        }
      } else {
        console.log('Wallet not connected or contract not initialized:', { 
          isConnected: walletState.isConnected, 
          hasContract: !!riddleContract 
        });
      }
    } catch (err) {
      console.error('Error loading riddle:', err);
      setError(err instanceof Error ? err.message : 'Failed to load riddle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Submit answer clicked');
    console.log('Wallet state:', walletState);
    console.log('Answer:', answer);
    console.log('Player name:', playerName);
    
    if (!walletState.isConnected || !walletState.address) {
      console.log('Wallet not connected');
      setError('Please connect your wallet first');
      return;
    }

    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!answer.trim()) {
      setError('Please enter an answer');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSubmissionResult(null);

      console.log('Submitting answer:', answer.trim());
      
      if (riddleContract) {
        // Soumettre la réponse
        const tx = await riddleContract.submitAnswer(answer.trim());
        console.log('Transaction sent:', tx);
        
        // Attendre la confirmation de la transaction
        console.log('Waiting for transaction confirmation...');
        await riddleContract.provider.waitForTransaction(tx.hash);
        console.log('Transaction confirmed');
        
        // Vérifier si l'utilisateur est devenu le gagnant
        const newWinner = await riddleContract.getWinner();
        const isActive = await riddleContract.isActive();
        
        console.log('New winner:', newWinner);
        console.log('Is still active:', isActive);
        
        if (newWinner === walletState.address) {
          // L'utilisateur a gagné !
          setSubmissionResult('success');
          setWinner(newWinner);
          setAnswer('');
          setPlayerName('');
        } else if (!isActive) {
          // L'énigme n'est plus active mais l'utilisateur n'a pas gagné
          setSubmissionResult('incorrect');
          setWinner(newWinner !== ethers.ZeroAddress ? newWinner : null);
        } else {
          // L'énigme est toujours active, réponse incorrecte
          setSubmissionResult('incorrect');
        }
        
        // Recharger l'énigme pour voir les changements
        await loadCurrentRiddle();
      } else {
        console.log('Riddle contract not initialized');
        setError('Contract not initialized');
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
      setSubmissionResult('error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (walletState.isConnected) {
      // Initialiser le contrat
      const initializeContract = async () => {
        try {
          console.log('Initializing contract...');
          if (window.ethereum) {
            console.log('MetaMask found, creating provider...');
            const provider = new ethers.BrowserProvider(window.ethereum);
            console.log('Creating contract instance with address:', CONTRACT_ADDRESS);
            const contract = new RiddleContract(CONTRACT_ADDRESS, provider);
            
            // Connecter le signer au contrat
            console.log('Connecting signer to contract...');
            const signer = await provider.getSigner();
            await contract.connectWallet(signer);
            console.log('Signer connected to contract');
            
            console.log('Contract initialized successfully');
            setRiddleContract(contract);
          } else {
            console.error('MetaMask not found');
          }
        } catch (error) {
          console.error('Error initializing contract:', error);
        }
      };
      
      initializeContract();
    }
  }, [walletState.isConnected]);

  useEffect(() => {
    if (walletState.isConnected && riddleContract) {
      loadCurrentRiddle();
    }
  }, [walletState.isConnected, riddleContract]);

  return (
    <div className="riddle-game">
      <div className="container">
        <h1 className="title">OnchainRiddle</h1>
        
        {/* Connexion Wallet */}
        <div className="wallet-section">
          {!walletState.isConnected ? (
            <button 
              className="connect-button"
              onClick={connectWallet}
              disabled={isLoading}
            >
              Connect MetaMask
            </button>
          ) : (
            <div className="wallet-info">
              <span>Connected: {walletState.address?.slice(0, 6)}...{walletState.address?.slice(-4)}</span>
              <button 
                className="disconnect-button"
                onClick={disconnectWallet}
              >
                Disconnect
              </button>
            </div>
          )}
          
          {walletState.error && (
            <div className="error-message">{walletState.error}</div>
          )}
        </div>

        {/* Affichage de l'énigme */}
        {walletState.isConnected && (
          <div className="riddle-section">
            {isLoading ? (
              <div className="loading">Loading...</div>
            ) : riddle ? (
              <div className="riddle-display">
                <h2>Current Riddle</h2>
                <p className="riddle-question">{riddle}</p>
                
                {winner && (
                  <div className="winner-info">
                    <h3>🏆 Winner</h3>
                    <p>{winner.slice(0, 6)}...{winner.slice(-4)}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-riddle">
                <p>No active riddle at the moment.</p>
              </div>
            )}
          </div>
        )}

        {/* Formulaire de soumission */}
        {walletState.isConnected && riddle && !winner && (
          <div className="submission-section">
            <h3>Submit Your Answer</h3>
            
            <form onSubmit={handleSubmitAnswer} className="submission-form">
              <div className="form-group">
                <label htmlFor="playerName">Your Name:</label>
                <input
                  type="text"
                  id="playerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="answer">Your Answer:</label>
                <input
                  type="text"
                  id="answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter your answer"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <button 
                type="submit" 
                className="submit-button"
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit Answer'}
              </button>
            </form>
            
            {error && (
              <div className="error-message">{error}</div>
            )}
            
            {submissionResult && (
              <div className={`result-message ${submissionResult}`}>
                {submissionResult === 'success' && (
                  <div>
                    <h3>🎉 Congratulations!</h3>
                    <p>You are the winner! The riddle has been solved.</p>
                  </div>
                )}
                {submissionResult === 'incorrect' && (
                  <div>
                    <h3>❌ Incorrect Answer</h3>
                    <p>Your answer was wrong. Try again!</p>
                  </div>
                )}
                {submissionResult === 'error' && (
                  <div>
                    <h3>⚠️ Error</h3>
                    <p>Something went wrong. Please try again.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Message si l'énigme est résolue */}
        {winner && (
          <div className="solved-section">
            <h3>🎯 Riddle Solved!</h3>
            <p>This riddle has been solved by: {winner.slice(0, 6)}...{winner.slice(-4)}</p>
            <p>Wait for the next riddle to be generated automatically.</p>
          </div>
        )}
      </div>
    </div>
  );
}; 