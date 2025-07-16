import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../hooks/useWallet';
import RiddleContract from '../../infrastructure/blockchain/riddleContract';
import { ethers } from 'ethers';
import './RiddleGame.css';

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || '';
const COUNTDOWN_DURATION = 20;

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
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCountdownActive, setIsCountdownActive] = useState(false);

  const startCountdown = () => {
    setIsCountdownActive(true);
    setCountdown(COUNTDOWN_DURATION);
  };

  const stopCountdown = () => {
    setIsCountdownActive(false);
    setCountdown(null);
  };

  const loadCurrentRiddle = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (walletState.isConnected && riddleContract) {
        const currentRiddle = await riddleContract.getCurrentRiddle();
        const currentWinner = await riddleContract.getWinner();
        const isActive = await riddleContract.isActive();
        
        const newWinner = currentWinner !== ethers.ZeroAddress ? currentWinner : null;
        
        setRiddle(currentRiddle);
        setWinner(newWinner);
        
        if (!isActive) {
          setSubmissionResult(null);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load riddle');
    } finally {
      setIsLoading(false);
    }
  }, [walletState.isConnected, riddleContract]);

  const loadNewRiddleWithRetry = useCallback(async (maxRetries = 5, delay = 1000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (riddleContract) {
          const isActive = await riddleContract.isActive();
          const currentWinner = await riddleContract.getWinner();
          
          if (isActive && currentWinner === ethers.ZeroAddress) {
            await loadCurrentRiddle();
            return;
          }
        }
        
        await loadCurrentRiddle();
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    window.location.reload();
  }, [riddleContract, loadCurrentRiddle]);

  useEffect(() => {
    if (isCountdownActive && countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (isCountdownActive && countdown === 0) {
      stopCountdown();
      setSubmissionResult(null);
      setWinner(null);
      loadNewRiddleWithRetry();
    }
  }, [isCountdownActive, countdown, loadNewRiddleWithRetry]);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletState.isConnected || !walletState.address) {
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
      
      if (riddleContract) {
        const tx = await riddleContract.submitAnswer(answer.trim());
        
        await riddleContract.provider.waitForTransaction(tx.hash);
        
        const newWinner = await riddleContract.getWinner();
        const isActive = await riddleContract.isActive();
        
        if (newWinner.toLowerCase() === walletState.address.toLowerCase()) {
          setSubmissionResult('success');
          setWinner(newWinner);
          setAnswer('');
          setPlayerName('');
          
          startCountdown();
        } else if (!isActive) {
          setSubmissionResult('incorrect');
          setWinner(newWinner !== ethers.ZeroAddress ? newWinner : null);
          await loadCurrentRiddle();
        } else {
          setSubmissionResult('incorrect');
          await loadCurrentRiddle();
        }
      } else {
        setError('Contract not initialized');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
      setSubmissionResult('error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (walletState.isConnected) {
      const initializeContract = async () => {
        try {
          if (window.ethereum) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new RiddleContract(CONTRACT_ADDRESS, provider);
            
            const signer = await provider.getSigner();
            await contract.connectWallet(signer);
            
            setRiddleContract(contract);
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
  }, [walletState.isConnected, riddleContract, loadCurrentRiddle]);

  return (
    <div className="riddle-game">
      <div className="container">
        <h1 className="title">OnchainRiddle</h1>
        
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

        {isCountdownActive && countdown !== null && (
          <div className="countdown-section">
            <div className="countdown-display">
              <h3>🎉 Congratulations! New riddle coming soon...</h3>
              <div className="countdown-timer">
                <span className="countdown-number">{countdown}</span>
                <span className="countdown-text">seconds</span>
              </div>
              <p>Get ready for the next challenge!</p>
            </div>
          </div>
        )}

        {walletState.isConnected && !isCountdownActive && (
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

        {walletState.isConnected && riddle && !winner && !isCountdownActive && (
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

        {winner && !isCountdownActive && (
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