require('dotenv').config();
const { constants, utils, Wallet } = require('ethers');

const wallet = new Wallet(process.env.PRIVATE_KEY);

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
  console.log('address 0', wallet.address);

  const signed = await wallet._signTypedData(domain, types, value);
  console.log('signed', signed, signed.length);

  const address = await utils.verifyTypedData(domain, types, value, signed);
  console.log('address 1', address);
};

main();
