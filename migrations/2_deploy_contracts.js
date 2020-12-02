// Taken from https://github.com/gnosis/MultiSigWallet/blob/master/migrations/2_deploy_contracts.js, at commit hash 848b46eaffa4df8a9fb2d9dc5a4afafa1bdc888a
const MultisigWallet = artifacts.require('MultiSigWallet.sol')

module.exports = deployer => {
    const args = process.argv.slice()
    // To prevent the tests from executing this.
    if (args.length > 4) {
        deployer.deploy(MultisigWallet, args[3].split(","), args[4])
        console.log("Wallet deployed")
    } else {
        console.log("Wallet not deployed")
    }
}