// Function that deploy smart contract Voting.sol

const hre = require("hardhat");
const path = require("path");

async function main() {
  // Gets smart contract ABI
  const Voting = await hre.ethers.getContractFactory("SocialActivation");
  // Deploys smart contract
  const voting = await Voting.deploy();
  // Waits until smart contract is deployed and returns tx
  const tx = await voting.deployed();
  // Outputs transaction to console
  console.log(tx.deployTransaction);
  // Saves deployed smart contract details to artifacts folders
  save_artifacts(voting);
}

// Save deployed smart contract details to artifacts folders
function save_artifacts(voting) {
  const fs = require("fs");

  const voting_artifact = artifacts.readArtifactSync("SocialActivation");

  // Create contract artifacts for web app
  const dir_web_artifacts = path.join(__dirname, "..", "web", "src", "contract-artifacts");
  if (!fs.existsSync(dir_web_artifacts)) {
    fs.mkdirSync(dir_web_artifacts);
  }
  fs.writeFileSync(
    path.join(dir_web_artifacts, "contract-address.json"),
    JSON.stringify({ contract_address: voting.address }, undefined, 2)
  );
  fs.writeFileSync(
    path.join(dir_web_artifacts, "contract-data.json"),
    JSON.stringify(voting_artifact, null, 2)
  );

  // Create contract artifacts for general use
  const dir_general_artifacts = path.join(__dirname, "..", "contract-artifacts");
  if (!fs.existsSync(dir_general_artifacts)) {
    fs.mkdirSync(dir_general_artifacts);
  }
  fs.writeFileSync(
    path.join(dir_general_artifacts, "contract-address.json"),
    JSON.stringify({ contract_address: voting.address }, undefined, 2)
  );
  fs.writeFileSync(
    path.join(dir_general_artifacts, "contract-data.json"),
    JSON.stringify(voting_artifact, null, 2)
  );

  //console.log(voting);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
