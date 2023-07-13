# Backend

### Setup

Start hardhat network (Ctrl+C to stop)

```cmd
npx hardhat node
```

Clean hardhat network

```cmd
npx hardhat clean
```

Get test/example pre-funded accounts. This will create a file "./wallets-example.json". This can be used with metamask by adding the private keys.

```cmd
npx hardhat accounts-example
```

To check all is working correctly

```cmd
npx hardhat test
```

### Deploy Contracts

Deploy Contract

```cmd
npx hardhat run scripts/deploy.js
```

The app address is stored in "./dapp/dapp-data.json" as well as the contract ABI.
