require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {

  solidity: "0.8.18",

  defaultNetwork: "localhost",
  
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      //accounts: [creds.private_key]
    }
  }

};

console.log("# Hardhat config loaded");