
# Gasless contracts

# Commands

```bash 
# deploy
npx hardhat run ./scripts/forwarder/deploy.ts --network polygon

# verify
npx hardhat verify --network polygon {address} {constructor params}
npx hardhat verify --network polygon {address} 0xE592427A0AEce92De3Edee1F18E0157C05861564 0x5e55c9e631fae526cd4b0526c4818d6e0a9ef0e3 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270
```
