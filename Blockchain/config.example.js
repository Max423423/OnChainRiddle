module.exports = {
  networks: {
    hardhat: {
      chainId: 1337,
      url: "http://127.0.0.1:8545"
    },
    
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111,
      gasPrice: "auto",
      gas: "auto"
    },
    
  },

  contract: {
    name: "OnchainRiddle",
    version: "1.0.0",
    constructor: [],
    verify: {
      apiKey: process.env.ETHERSCAN_API_KEY
    }
  },

  deployment: {
    gasLimit: 3000000,
    gasPrice: "auto",
    
    confirmations: 2,
    timeoutBlocks: 200,
    
    verify: true,
    
    defaultNetwork: "sepolia"
  },

  env: {
    PRIVATE_KEY: "your_private_key_here",
    ALCHEMY_API_KEY: "your_alchemy_api_key_here",
    ETHERSCAN_API_KEY: "your_etherscan_api_key_here",
  },

  rpcUrls: {
    sepolia: "https://eth-sepolia.g.alchemy.com/v2/"
  },

  explorers: {
    sepolia: "https://sepolia.etherscan.io",
  }
}; 