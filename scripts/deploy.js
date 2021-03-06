// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  
  const NFTMarket = await hre.ethers.getContractFactory("NFTMarket");
  const nftMarket = await NFTMarket.deploy();
  await nftMarket.deployed();
  console.log("NFTMarket deployed to:", nftMarket.address);

  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(nftMarket.address);
  await nft.deployed();
  console.log("nft deployed to:", nft.address);

  // const NFTCC = await hre.ethers.getContractFactory("NFTCC");
  // const nftcc = await NFTCC.deploy(nftMarket.address);
  // await nftcc.deployed();
  // console.log("nftcc deployed to:", nftcc.address);

  const ContractFactoryNFT = await hre.ethers.getContractFactory("ContractFactoryNFT");
  const contractFactoryNFT = await ContractFactoryNFT.deploy();
  await contractFactoryNFT.deployed();
  console.log("contractFactoryNFT deployed to:", contractFactoryNFT.address)


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
