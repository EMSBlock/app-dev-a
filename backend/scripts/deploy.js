// Function that deploy smart contract SocialActivation.sol

const hre = require("hardhat");
const path = require("path");
const { Signer, Wallet } = require("ethers");
const wallets = require("../wallets-example.json");

// Converts private key to a signer
async function key_to_signer(priv) {
  const provider = hre.ethers.provider;
  const signer_wallet = new Wallet(priv);
  const signer = signer_wallet.connect(provider);
  return signer;
}

async function main() {
  
  // Gets smart contract ABI
  const Contract = await hre.ethers.getContractFactory("SocialActivation");
  // Deploys smart contract
  const dapp = await Contract.connect(await key_to_signer(wallets["a"]["private"])).deploy();
  // Waits until smart contract is deployed and returns tx
  const tx = await dapp.deployed();
  // Outputs transaction to console
  console.log(tx.deployTransaction);
  // Saves deployed smart contract details to artifacts folders
  save_artifacts(dapp);
}

function jsonConcat(o1, o2) {
  for (var key in o2) {
   o1[key] = o2[key];
  }
  return o1;
}
 
// Save deployed smart contract details to artifacts folders
function save_artifacts(dapp) {
  const fs = require("fs");

  const dapp_artifact = artifacts.readArtifactSync("SocialActivation");

  var output_artifacts = {};
  output_artifacts = jsonConcat({ dapp_address: dapp.address }, dapp_artifact);

  // Create contract artifacts for general use
  const dir_general_artifacts = path.join(__dirname, "..", "dapp");
  if (!fs.existsSync(dir_general_artifacts)) {
    fs.mkdirSync(dir_general_artifacts);
  }
  fs.writeFileSync(
    path.join(dir_general_artifacts, "dapp-data.json"),
    JSON.stringify(output_artifacts, undefined, 2)
  );

  // Create contract artifacts for web app
  const dir_web_artifacts = path.join(__dirname, "..", "..", "web", "src", "dapp-artifacts");
  if (!fs.existsSync(dir_web_artifacts)) {
    fs.mkdirSync(dir_web_artifacts);
  }
  fs.writeFileSync(
    path.join(dir_web_artifacts, "dapp-data.json"),
    JSON.stringify(output_artifacts, undefined, 2)
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
