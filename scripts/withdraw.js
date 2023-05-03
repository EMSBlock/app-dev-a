// scripts/index.js
async function main () {
    // Retrieve accounts from the local node
    const accounts = await ethers.provider.listAccounts();
    console.log(accounts);
    // Set up an ethers contract, representing our deployed Box instance
    const address = "0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1";
    const Lock = await ethers.getContractFactory('Lock');
    const lock = await Lock.attach(address);
    await lock.withdraw();
    // console.log('Box value is', value.toString());
  }
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });