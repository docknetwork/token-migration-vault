# Dock's migration vault

Vault is a multi-sig contract. It will be initialized in a 2-of-3 manner. The multi-sig contract is taken from 
[Gnosis's repo](https://github.com/gnosis/MultiSigWallet). The repo is LGPL-3 so i have not moved the Vault contract to 
the migration backend repo.

## Testing
The contract is tested with both Truffle and Remix. Truffle test is [here](test/testTokenTransfer.test.js) and checks that 
Dock's ERC-20 tokens can be given to the contract and 2 out of 3 contract's owners can transfer those. The [truffle-config](./truffle-config.js) 
is pointing to local gananche. It deploys the Dock token contract as well as Vault contract.
Its also tested with Remix using solidity compiler v0.4.15+commit.bbb8e64f.

## Deploying
To deploy using Truffle, pass the comma separated addresses of owners and threshold to `truffle migrate` like
```
truffle migrate 0xB8F28fBb4bdDa25aF6c0977141B723BC2DED7613,0x94117F0DD5FCb5b638a7240Cb69925bb1E0aDC17,0x895E5a1809f5a3Ec9336C5B97db11BF4E9D7b7Ee 2
```

To deploy using Remix, pass the owners argument as an array of hex strings like (use double quotes, not single)
```
["0xB8F28fBb4bdDa25aF6c0977141B723BC2DED7613", "0x94117F0DD5FCb5b638a7240Cb69925bb1E0aDC17", "0x895E5a1809f5a3Ec9336C5B97db11BF4E9D7b7Ee"]
```

