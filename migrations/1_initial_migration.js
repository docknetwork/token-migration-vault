// Taken from https://github.com/gnosis/MultiSigWallet/blob/master/migrations/1_initial_migration.js, at commit hash 848b46eaffa4df8a9fb2d9dc5a4afafa1bdc888a

const Migrations = artifacts.require("./Migrations.sol")

module.exports = deployer => deployer.deploy(Migrations)
