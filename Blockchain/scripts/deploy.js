const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying OnchainRiddle...");

  // Get deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 Deploying with account:", deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");

  // Deploy contract
  const OnchainRiddle = await hre.ethers.getContractFactory("OnchainRiddle");
  const contract = await OnchainRiddle.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ Contract deployed to:", address);

  // Setup riddle
  const riddle = "What has keys, but no locks; space, but no room; and you can enter, but not go in?";
  const answer = "keyboard";
  const answerHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(answer));

  const tx = await contract.setRiddle(riddle, answerHash);
  await tx.wait();
  console.log("✅ Riddle set!");

  console.log("\n📋 Summary:");
  console.log("Contract:", address);
  console.log("Riddle:", riddle);
  console.log("Answer:", answer);
  console.log("Network:", hre.network.name);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 