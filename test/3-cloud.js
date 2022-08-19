require('dotenv').config();
const assert = require('assert');
const { constants, utils } = require('ethers');
const CloudSigner = require('../cloud/CloudSigner');

describe('3. Test cloud signer', () => {
  let wallet;
  let address;

  before(async () => {
    wallet = new CloudSigner({
      projectId: process.env.PROJECT_ID,
      locationId: process.env.LOCATION_ID,
      keyRingId: process.env.KEY_RING_ID,
      keyId: process.env.KEY_ID,
      versionId: process.env.VERSION_ID,
    });
  });

  it('1.1. create wallet', async () => {
    address = await wallet.getAddress();
    assert.notEqual(constants.AddressZero, address);
  });

  it('1-2: sign message', async () => {
    const message = 'message';
    const signed = await wallet.signMessage(message);
    const verified = await utils.verifyMessage(message, signed);
    assert.equal(verified, address);
  });

  it('1-3: sign transaction', async () => {
    const transaction = {
      to: address,
      nonce: 0,
      gasLimit: 21000,
      value: utils.parseEther('0.1'),
      chainId: 1,
      type: 2,
      maxPriorityFeePerGas: utils.parseUnits('1.5', 'gwei'),
      maxFeePerGas: utils.parseUnits('51.5', 'gwei'),
    };
    const signed = await wallet.signTransaction(transaction);
    const { from } = utils.parseTransaction(signed);
    assert.equal(from, address);
  });

  it('1-4: sign typed data', async () => {
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
    const signed = await wallet._signTypedData(domain, types, value);
    const verified = await utils.verifyTypedData(domain, types, value, signed);
    assert.equal(verified, address);
  });
});
