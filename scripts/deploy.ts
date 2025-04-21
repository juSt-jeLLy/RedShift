import { ethers } from "hardhat";

async function main() {
  console.log("Deploying contracts to", network.name);

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy DID Registry
  console.log("Deploying DID Registry...");
  const DIDRegistry = await ethers.getContractFactory("DIDRegistry");
  const didRegistry = await DIDRegistry.deploy();
  await didRegistry.deployed();
  console.log("DIDRegistry deployed to:", didRegistry.address);

  // Deploy Reputation NFT
  console.log("Deploying Reputation NFT...");
  const ReputationNFT = await ethers.getContractFactory("ReputationNFT");
  const reputationNFT = await ReputationNFT.deploy();
  await reputationNFT.deployed();
  console.log("ReputationNFT deployed to:", reputationNFT.address);

  // Deploy Invoice NFT
  console.log("Deploying Invoice NFT...");
  const InvoiceNFT = await ethers.getContractFactory("InvoiceNFT");
  const invoiceNFT = await InvoiceNFT.deploy();
  await invoiceNFT.deployed();
  console.log("InvoiceNFT deployed to:", invoiceNFT.address);

  // Deploy Invoice Marketplace
  console.log("Deploying Invoice Marketplace...");
  const InvoiceMarketplace = await ethers.getContractFactory("InvoiceMarketplace");
  const invoiceMarketplace = await InvoiceMarketplace.deploy(
    invoiceNFT.address,
    reputationNFT.address
  );
  await invoiceMarketplace.deployed();
  console.log("InvoiceMarketplace deployed to:", invoiceMarketplace.address);

  // Deploy Repayment Manager
  console.log("Deploying Repayment Manager...");
  const RepaymentManager = await ethers.getContractFactory("RepaymentManager");
  const repaymentManager = await RepaymentManager.deploy(
    invoiceNFT.address,
    reputationNFT.address
  );
  await repaymentManager.deployed();
  console.log("RepaymentManager deployed to:", repaymentManager.address);

  // Set up roles
  console.log("Setting up contract roles...");
  
  // Grant roles to InvoiceNFT
  const MINTER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE"));
  const UPDATER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("UPDATER_ROLE"));
  
  await invoiceNFT.grantRole(MINTER_ROLE, deployer.address);
  await invoiceNFT.grantRole(UPDATER_ROLE, invoiceMarketplace.address);
  await invoiceNFT.grantRole(UPDATER_ROLE, repaymentManager.address);
  
  // Grant roles to ReputationNFT
  await reputationNFT.grantRole(MINTER_ROLE, deployer.address);
  await reputationNFT.grantRole(UPDATER_ROLE, repaymentManager.address);

  console.log("Deployment and setup complete!");

  // Return all the contract addresses
  return {
    didRegistry: didRegistry.address,
    reputationNFT: reputationNFT.address,
    invoiceNFT: invoiceNFT.address,
    invoiceMarketplace: invoiceMarketplace.address,
    repaymentManager: repaymentManager.address,
  };
}

main()
  .then((addresses) => {
    console.log("Deployed contract addresses:", addresses);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 