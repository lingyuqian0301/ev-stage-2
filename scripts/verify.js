const { run } = require("hardhat");

async function verify(contractAddress, args) {
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        });
    } catch (e) {
        console.error(e);
    }
}

module.exports = { verify };
