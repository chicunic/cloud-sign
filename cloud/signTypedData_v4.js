require('dotenv').config();
const { constants, utils } = require('ethers');
const CloudSigner = require('./CloudSigner');

const wallet = new CloudSigner({
  projectId: process.env.PROJECT_ID,
  locationId: process.env.LOCATION_ID,
  keyRingId: process.env.KEY_RING_ID,
  keyId: process.env.KEY_ID,
  versionId: process.env.VERSION_ID,
});

const domain = {
  name: 'name',
  version: '1.0.0',
  chainId: 1,
  verifyingContract: constants.AddressZero,
};
const types = {
  Collection: [
    { name: 'tokenId', type: 'uint256' },
  ],
};
const value = {
  tokenId: 1,
};

const main = async () => {
  const address0 = await wallet.getAddress();
  console.log('address 0', address0);

  const signed = await wallet._signTypedData(domain, types, value);
  console.log('signed', signed, signed.length);

  const address = await utils.verifyTypedData(domain, types, value, signed);
  console.log('address 1', address);
};

main();
