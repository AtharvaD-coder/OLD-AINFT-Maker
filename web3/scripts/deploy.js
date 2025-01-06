const { ethers } = require("hardhat");
const { utils } = require("ethers");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const uri = ""; // Leave URI blank
  const initialSupply = 0; // Replace with the desired initial supply
//   const cost = ethers.utils.parseEther("0.1"); // Replace with the desired minting cost in Ether
  const cost = ethers.parseEther("0.1") // Replace with the desired minting cost in Ether

  const Nft = await ethers.getContractFactory("Nft");
  const nft = await Nft.deploy(uri, initialSupply, cost);

//   await nft.deployed();
    await nft.deploymentTransaction();

//   console.log("Nft contract deployed at:", nft.address);

if (nft.address) {
    console.log("Nft contract deployed at:", nft.address);
  } else {
    console.error("Contract deployment failed.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });