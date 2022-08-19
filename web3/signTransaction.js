require('dotenv').config();
const Accounts = require('web3-eth-accounts');
const { toWei } = require('web3-utils');

const main = async () => {
  const accounts = new Accounts();
  const account = accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
  console.log('address', account.address);

  const transaction = {
    nonce: 0, // web3.eth.getTransactionCount(account.address)
    chainId: 1, // web3.eth.net.getId()
    to: account.address,
    value: toWei('0.1', 'ether'),
    maxPriorityFeePerGas: toWei('1.5', 'gwei'), // provider.getFeeData()
    maxFeePerGas: toWei('51.5', 'gwei'), // provider.getFeeData()
    gas: 21000,
    chain: 'mainnet',
    hardfork: 'grayGlacier',
  };
  console.log('unsigned', transaction);

  const { rawTransaction: signed } = await account.signTransaction(transaction);
  console.log('signed', signed, signed.length);
};

main();
