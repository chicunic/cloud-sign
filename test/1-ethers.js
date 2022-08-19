const assert = require('assert');
const { constants, utils, Wallet } = require('ethers');

describe('1. Test ethers signer', () => {
  const privateKey = '0x0000000000000000000000000000000000000000000000000000000000000001';
  const address = '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf';
  let wallet;

  before(async () => {
    wallet = new Wallet(privateKey);
  });

  it('1.1. create wallet', async () => {
    assert.equal(address, wallet.address);
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
    const { hash: txid } = utils.parseTransaction(signed);
    assert.equal(txid, '0x5211a57b505cf86c9d9e722f43fd0b70b7d156f1101799782186f642ed4a76a3');
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
