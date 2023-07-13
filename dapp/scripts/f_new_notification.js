// Function that calls add_notification function in smart contract

const hre = require("hardhat");
const path = require("path");
const dapp = require("../artifacts/app-data.json");

async function main() {   
    // Gets smart contract ABI
    const Contract = await ethers.getContractFactory('SocialActivation');
    // Attatches contract address for IRL location
    const dapp = await Contract.attach(dapp.app_address);

    // Input values
    regions = [453, 543, 412];
    disaster_type = 2;

    // Execute transaction (function call add_notification)
    // tx = await voting._new_notification(regions, disaster_type);

    tx_params = {
        gasLimit: 1000000 
        // new_notification 245634, 228832, 263328, increases quickly
        // deploy 1630540
    }

    tx = await voting._new_notification(regions, disaster_type, tx_params);
    // Output transaction to console
    console.log(tx);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
