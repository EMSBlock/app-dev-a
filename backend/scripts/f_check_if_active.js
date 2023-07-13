// Function that calls add_notification function in smart contract

const hre = require("hardhat");
const path = require("path");
const dapp_data = require("../dapp/dapp-data.json");

async function main() {   
    // Gets smart contract ABI
    const Contract = await ethers.getContractFactory('SocialActivation');
    // Attatches contract address for IRL location
    const dapp = await Contract.attach(dapp_data.dapp_address);

    var region = 453;
    var disaster_type = 2;

    var tx_params = {
        gasLimit: 100000
    }

    tx = await dapp._check_active_notification(region, disaster_type, tx_params);
    // Output transaction to console
    console.log(tx);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
