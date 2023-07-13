// Function that calls add_notification function in smart contract

const hre = require("hardhat");
const path = require("path");
const dapp_data = require("../dapp/dapp-data.json");
const wallets = require("../wallets-example.json");

async function main() {   
    // Gets smart contract ABI
    const Contract = await ethers.getContractFactory('SocialActivation');
    // Attatches contract address for IRL location
    const dapp = await Contract.attach(dapp_data.dapp_address);

    // Input values
    new_user = wallets["b"]["public"]

    // Execute transaction (function call add_notification)
    // tx = await voting._new_notification(regions, disaster_type);

    tx_params = {
        gasLimit: 1000000 
    }

    tx = await dapp._authorise_user(new_user, tx_params);
    // Output transaction to console
    console.log(tx);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
