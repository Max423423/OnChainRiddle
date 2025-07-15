// Configuration example for OnchainRiddle deployment
// Copy this file to config.js and fill in your actual values

module.exports = {
  // Network Configuration
  networks: {
    // Local development
    hardhat: {
      chainId: 1337,
      url: "http://127.0.0.1:8545"
    },
    
    // Sepolia testnet
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111,
      gasPrice: "auto",
      gas: "auto"
    },
    
    // Mainnet (for production)
    mainnet: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 1,
      gasPrice: "auto",
      gas: "auto"
    }
  },

  // Contract Configuration
  contract: {
    name: "OnchainRiddle",
    version: "1.0.0",
    constructor: [], // No constructor parameters needed
    verify: {
      apiKey: process.env.ETHERSCAN_API_KEY // For contract verification
    }
  },

  // Deployment Configuration
  deployment: {
    // Gas settings
    gasLimit: 3000000,
    gasPrice: "auto",
    
    // Deployment settings
    confirmations: 2, // Number of confirmations to wait
    timeoutBlocks: 200, // Timeout for deployment
    
    // Contract verification
    verify: true, // Whether to verify contract on Etherscan
    
    // Network selection
    defaultNetwork: "sepolia" // Default network for deployment
  },

  // Environment Variables (create a .env file)
  env: {
    // Required for deployment
    PRIVATE_KEY: "your_private_key_here", // Your wallet private key
    ALCHEMY_API_KEY: "your_alchemy_api_key_here", // Alchemy API key
    
    // Optional for contract verification
    ETHERSCAN_API_KEY: "your_etherscan_api_key_here", // Etherscan API key
    
    // Optional for additional networks
    INFURA_API_KEY: "your_infura_api_key_here", // Infura API key (alternative to Alchemy)
  },

  // RPC URLs for different networks
  rpcUrls: {
    sepolia: "https://eth-sepolia.g.alchemy.com/v2/",
    mainnet: "https://eth-mainnet.g.alchemy.com/v2/",
    goerli: "https://eth-goerli.g.alchemy.com/v2/",
    polygon: "https://polygon-mainnet.g.alchemy.com/v2/",
    mumbai: "https://polygon-mumbai.g.alchemy.com/v2/"
  },

  // Explorer URLs for contract verification
  explorers: {
    sepolia: "https://sepolia.etherscan.io",
    mainnet: "https://etherscan.io",
    goerli: "https://goerli.etherscan.io",
    polygon: "https://polygonscan.com",
    mumbai: "https://mumbai.polygonscan.com"
  }
}; 