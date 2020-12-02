const MultiSigWallet = artifacts.require('MultiSigWallet.sol')
const web3 = MultiSigWallet.web3
const DockToken = artifacts.require('DockToken.sol')

// Test that Vault (the multisig wallet) can receive and send Dock tokens
// Code mostly taken from https://github.com/gnosis/MultiSigWallet/blob/master/test/javascript/testExternalCalls.js

// Taken from https://github.com/gnosis/MultiSigWallet/blob/master/test/javascript/utils.js
function getParamFromTxEvent(transaction, paramName, contractFactory, eventName) {
    assert.isObject(transaction)
    let logs = transaction.logs
    if(eventName != null) {
        logs = logs.filter((l) => l.event === eventName)
    }
    assert.equal(logs.length, 1, 'too many logs found!')
    let param = logs[0].args[paramName]
    if(contractFactory != null) {
        let contract = contractFactory.at(param)
        assert.isObject(contract, `getting ${paramName} failed for ${param}`)
        return contract
    } else {
        return param
    }
}

contract('MultiSigWallet', (accounts) => {
  let tokenInstance, multisigInstance, multisigAddress;
  const requiredConfirmations = 2

  before(async () => {
      // Dock token
      tokenInstance = await DockToken.new(accounts[0]);
      assert.ok(tokenInstance);
      await tokenInstance.enableTransfer();

      // Vault
      multisigInstance = await MultiSigWallet.new([accounts[1], accounts[2], accounts[3]], requiredConfirmations);
      assert.ok(multisigInstance);
      multisigAddress = multisigInstance.address;
      console.log(`Multisig deployed at ${multisigAddress}`);

      // Seed accounts 4 and 5 with Dock tokens
      await tokenInstance.transfer(accounts[4], 10000, { from: accounts[0] });
      await tokenInstance.transfer(accounts[5], 10000, { from: accounts[0] });
  })

  it('Deposit tokens to wallet contract address', async () => {
    // Accounts 4 and 5 transfer their Dock tokens to the vault. Their balance will decrease and the vault's balance will
    // increase

    const multisigTokenBalance1 = await tokenInstance.balanceOf.call(multisigAddress); 
    const sender1Balance1 = await tokenInstance.balanceOf.call(accounts[4]); 
    const sender2Balance1 = await tokenInstance.balanceOf.call(accounts[5]);

    await tokenInstance.transfer(multisigAddress, 10000, { from: accounts[4] });
    await tokenInstance.transfer(multisigAddress, 10000, { from: accounts[5] });

    const multisigTokenBalance2 = await tokenInstance.balanceOf.call(multisigAddress);
    const sender1Balance2 = await tokenInstance.balanceOf.call(accounts[4]); 
    const sender2Balance2 = await tokenInstance.balanceOf.call(accounts[5]);

    assert.equal(multisigTokenBalance2.sub(multisigTokenBalance1).toString(), '20000', 'Vault was not get credited correctly');
    assert.equal(sender1Balance1.sub(sender1Balance2).toString(), '10000', 'Sender1 was not debited correctly');
    assert.equal(sender2Balance1.sub(sender2Balance2).toString(), '10000', 'Sender2 was not debited correctly');
  })

  it('Wallet contract can give tokens to any address', async () => {
      // Vault transfers Dock tokens to account 6. Vault's balance will decrease while account 6's balance will increase
      const multisigTokenBalance1 = await tokenInstance.balanceOf.call(multisigAddress);
      const receiverBalance1 = await tokenInstance.balanceOf.call(accounts[6]);

      // Encode a Dock ERC-20 transfer to send through multisig wallet
      const transferEncoded = tokenInstance.contract.methods.transfer(accounts[6], 20000).encodeABI();

      // One owner sends a transaction
      const transactionId = getParamFromTxEvent(
        await multisigInstance.submitTransaction(tokenInstance.address, 0, transferEncoded, {from: accounts[2]}),
        'transactionId', null, 'Submission')

      console.log(`Sent the transaction with id ${transactionId}`);

      // Another owner confirms the transaction
      await multisigInstance.confirmTransaction(transactionId, {from: accounts[3]})

      const multisigTokenBalance2 = await tokenInstance.balanceOf.call(multisigAddress);
      const receiverBalance2 = await tokenInstance.balanceOf.call(accounts[6]);

      assert.equal(multisigTokenBalance1.sub(multisigTokenBalance2).toString(), '20000', 'Vault was not get debited correctly');
      assert.equal(receiverBalance2.sub(receiverBalance1).toString(), '20000', 'Receiver was not credited correctly')
  })

});