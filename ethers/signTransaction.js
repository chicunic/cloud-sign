require('dotenv').config();
const { utils, Wallet } = require('ethers');

const wallet = new Wallet(process.env.PRIVATE_KEY);

const transaction = {
  to: wallet.address,
  nonce: 0, // provider.getTransactionCount(wallet.address)
  gasLimit: 21000,
  value: utils.parseEther('0.1'),
  chainId: 43113,
  type: 2,
  maxPriorityFeePerGas: utils.parseUnits('1.5', 'gwei'), // provider.getFeeData()
  maxFeePerGas: utils.parseUnits('51.5', 'gwei'), // provider.getFeeData()
};

const main = async () => {
  console.log('address', wallet.address);
  console.log('unsigned', transaction);

  const signed = await wallet.signTransaction(transaction);
  console.log('signed', signed, signed.length);
};

main();
