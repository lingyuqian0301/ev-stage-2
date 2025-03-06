require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.4"
      },
      {
        version: "0.8.17"
      },
      {
        version: "0.8.28"
      }
    ]
  },
  networks: {
    scrollTestnet: {
      url: "https://sepolia-rpc.scroll.io" || "",
      accounts: [process.env.PRIVATE_KEY || ""],
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
