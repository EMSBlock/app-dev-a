// Function that calls get_notification function in smart contract

const hre = require("hardhat");
const path = require("path");
const contractAddress = require("../contract-artifacts/contract-address.json");

async function main() {    
    // Set notification id to return the data for
    const _notification_id = 1;
    // Gets smart contract ABI
    const Voting = await ethers.getContractFactory('Voting');
    // Attatches contract address for IRL location
    const voting = await Voting.attach(contractAddress.contract_address);
    // Execute transaction (function call get_notification return data)
    for (let i = 0; i < 5; i++) {
        console.log(await voting.get_notification(i));
    }
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
