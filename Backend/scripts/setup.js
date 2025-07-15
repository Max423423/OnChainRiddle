#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  console.log('🚀 OnchainRiddle Backend Service Configuration\n');
  
  const envPath = path.join(__dirname, '..', '.env');
  const envExamplePath = path.join(__dirname, '..', 'env.example');
  
  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    const overwrite = await question('.env already exists. Do you want to replace it? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Configuration cancelled.');
      rl.close();
      return;
    }
  }
  
  console.log('Please provide the following information:\n');
  
  // Read template
  const template = fs.readFileSync(envExamplePath, 'utf8');
  
  // Collect information
  const privateKey = await question('Bot wallet private key (0x...): ');
  const contractAddress = await question('OnchainRiddle contract address: ');
  const rpcUrl = await question('Ethereum RPC URL (ex: https://sepolia.infura.io/v3/...): ');
  const openaiKey = await question('OpenAI API key: ');
  const port = await question('Server port (default: 3001): ') || '3001';
  
  // Generate .env content
  const envContent = template
    .replace('your_private_key_here', privateKey)
    .replace('your_contract_address_here', contractAddress)
    .replace('https://sepolia.infura.io/v3/your_project_id', rpcUrl)
    .replace('your_openai_api_key_here', openaiKey)
    .replace('3001', port);
  
  // Write .env file
  fs.writeFileSync(envPath, envContent);
  
  // Create logs directory
  const logsDir = path.join(__dirname, '..', 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
  }
  
  console.log('\n✅ Configuration completed!');
  console.log('📁 .env file created');
  console.log('📁 logs directory created');
  console.log('\nTo start the service:');
  console.log('  npm install');
  console.log('  npm run dev');
  
  rl.close();
}

setup().catch(console.error); 