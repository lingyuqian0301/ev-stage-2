require("@nomicfoundation/hardhat-chai-matchers");
require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

module.exports = {
    solidity: {
        compilers: [
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
            url: "https://alpha-rpc.scroll.io/l2",
            accounts: [process.env.PRIVATE_KEY],
        },
    },
    etherscan: {
        apiKey: process.env.SCROLLSCAN_API_KEY,
    },
};
