const assert = require('assert');
const Accounts = require('web3-eth-accounts');
const { hexToBytes, toChecksumAddress, toWei } = require('web3-utils');
const { personalSign, recoverPersonalSignature, recoverTypedSignature, signTypedData } = require('@metamask/eth-sig-util');

describe('2. Test web3 signer', () => {
  const privateKey = '0x0000000000000000000000000000000000000000000000000000000000000001';
  const address = '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf';
  let accounts;
  let account;

  before(async () => {
    accounts = new Accounts();
    account = accounts.privateKeyToAccount(privateKey);
  });

  it('1.1. create wallet', async () => {
    assert.equal(address, account.address);
  });

  it('1-2: sign message', async () => {
    const message = 'message';
    {
      const { signature: signed } = account.sign(message);
      const verified = accounts.recover(message, signed);
      assert.equal(verified, address);
    }
    {
      const { signature: signed } = accounts.sign(message, privateKey);
      const verified = accounts.recover(message, signed);
      assert.equal(verified, address);
    }
    {
      const signed = personalSign({ privateKey: hexToBytes(privateKey), data: message });
      const verified = toChecksumAddress(recoverPersonalSignature({ data: message, signature: signed }));
      assert.equal(verified, address);
    }
  });

  it('1-3: sign transaction', async () => {
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
    const { transactionHash: txid } = await account.signTransaction(transaction);
    assert.equal(txid, '0x5211a57b505cf86c9d9e722f43fd0b70b7d156f1101799782186f642ed4a76a3');
  });

  it('1-4: sign typed data', async () => {
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
    const value = {
      tokenId: 1,
    };
    const signed = signTypedData({
      privateKey: hexToBytes(privateKey),
      data: { types, primaryType: 'Collection', domain, message: value },
      version: 'V4',
    });
    const verified = toChecksumAddress(recoverTypedSignature({
      data: { types, primaryType: 'Collection', domain, message: value },
      signature: signed,
      version: 'V4',
    }));
    assert.equal(verified, address);
  });
});
