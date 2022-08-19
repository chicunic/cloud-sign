require('dotenv').config();
const { hexToBytes, toChecksumAddress } = require('web3-utils');
const { recoverTypedSignature, signTypedData } = require('@metamask/eth-sig-util');

const domain = {
  name: 'name',
  version: '1.0.0',
  chainId: 1,
  verifyingContract: '0x0000000000000000000000000000000000000000',
};
const types = {
  EIP712Domain: [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' },
  ],
  Collection: [
    { name: 'tokenId', type: 'uint256' },
  ],
};
const unsigned = {
  tokenId: 1,
};

const main = async () => {
  const signed = signTypedData({
    privateKey: hexToBytes(process.env.PRIVATE_KEY),
    data: { types, primaryType: 'Collection', domain, message: unsigned },
    version: 'V4',
  });
  console.log('signed', signed, signed.length);

  const address = toChecksumAddress(recoverTypedSignature({
    data: { types, primaryType: 'Collection', domain, message: unsigned },
    signature: signed,
    version: 'V4',
  }));
  console.log('address', address);
};

main();
