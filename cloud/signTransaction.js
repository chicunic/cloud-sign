require('dotenv').config();
const { utils } = require('ethers');
const CloudSigner = require('./CloudSigner');

const wallet = new CloudSigner({
  projectId: process.env.PROJECT_ID,
  locationId: process.env.LOCATION_ID,
  keyRingId: process.env.KEY_RING_ID,
  keyId: process.env.KEY_ID,
  versionId: process.env.VERSION_ID,
});

const main = async () => {
  const address = await wallet.getAddress();
  console.log('address', address);

  const transaction = {
    to: address,
    nonce: 0, // provider.getTransactionCount(wallet.address)
    gasLimit: 21000,
    value: utils.parseEther('0.1'),
    chainId: 43113,
    type: 2,
    maxPriorityFeePerGas: utils.parseUnits('1.5', 'gwei'), // provider.getFeeData()
    maxFeePerGas: utils.parseUnits('51.5', 'gwei'), // provider.getFeeData()
  };
  console.log('unsigned', transaction);

  const signed = await wallet.signTransaction(transaction);
  console.log('signed', signed, signed.length);
};

main();
