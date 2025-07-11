const hre = require("hardhat");

async function main() {
  console.log("Deploying OnchainRiddle contract...");

  const OnchainRiddle = await hre.ethers.getContractFactory("OnchainRiddle");
  const onchainRiddle = await OnchainRiddle.deploy();

  await onchainRiddle.waitForDeployment();

  const address = await onchainRiddle.getAddress();
  console.log("OnchainRiddle deployed to:", address);

  // Get the bot address (deployer)
  const [deployer] = await hre.ethers.getSigners();
  console.log("Bot address (deployer):", deployer.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 