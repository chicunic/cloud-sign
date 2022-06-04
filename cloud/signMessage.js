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

const message = 'message';

const main = async () => {
  const address0 = await wallet.getAddress();
  console.log('address 0', address0);

  const signed = await wallet.signMessage(message);
  console.log('signed', signed, signed.length);

  const address = await utils.verifyMessage(message, signed);
  console.log('address 1', address);
};

main();
