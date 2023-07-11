// Function that calls add_notification function in smart contract

const hre = require("hardhat");
const path = require("path");
const contractAddress = require("../contract-artifacts/contract-address.json");

async function main() {   
    // Example input message into notification
    const message = "Test disasters notification";
    // Gets smart contract ABI
    const Voting = await ethers.getContractFactory('Voting');
    // Attatches contract address for IRL location
    const voting = await Voting.attach(contractAddress.contract_address);
    // Execute transaction (function call add_notification)
    const tx = await voting.add_notification(message);
    // Output transaction to console
    console.log(tx);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
