import {
  SignTypedDataVersion,
  personalSign,
  recoverPersonalSignature,
  recoverTypedSignature,
  signTypedData,
} from '@metamask/eth-sig-util';
import { assert } from 'chai';
import {
  FeeMarketEIP1559Transaction,
  TypedTransaction,
  Web3Account,
  privateKeyToAccount,
  recover,
  sign,
  signTransaction,
} from 'web3-eth-accounts';
import { hexToBytes, toBigInt, toChecksumAddress, toWei } from 'web3-utils';

describe('2. Test web3 signer', () => {
  const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
  const address = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
  let account: Web3Account;

  before(async () => {
    account = privateKeyToAccount(privateKey);
  });

  it('2-1: create wallet', async () => {
    assert.equal(address, account.address);
  });

  it('2-2: sign message', async () => {
    const message = 'message';
    {
      const { signature: signed } = account.sign(message);
      const verified = recover(message, signed);
      assert.equal(verified, address);
    }
    {
      const { signature: signed } = sign(message, privateKey);
      const verified = recover(message, signed);
      assert.equal(verified, address);
    }
    {
      const signed = personalSign({ privateKey: Buffer.from(hexToBytes(privateKey)), data: message });
      const verified = toChecksumAddress(recoverPersonalSignature({ data: message, signature: signed }));
      assert.equal(verified, address);
    }
  });

  it('2-3: sign transaction', async () => {
    const transaction: TypedTransaction = FeeMarketEIP1559Transaction.fromTxData({
      nonce: 0, // web3.eth.getTransactionCount(account.address)
      gasLimit: 21000,
      to: account.address,
      value: toBigInt(toWei('0.1', 'ether')),
      type: 2,

      chainId: 1, // web3.eth.net.getId()
      maxPriorityFeePerGas: toBigInt(toWei('1.5', 'gwei')), // provider.getFeeData()
      maxFeePerGas: toBigInt(toWei('51.5', 'gwei')), // provider.getFeeData()
    });
    const { transactionHash: txid } = await signTransaction(transaction, account.privateKey);
    assert.equal(txid, '0xb11a068e2c6583c3392974e1230d5935c5e8bfb55b1d16984a3ae13aae1d1202');
  });

  it('2-4: sign typed data', async () => {
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
      Collection: [{ name: 'tokenId', type: 'uint256' }],
    };
    const value = {
      tokenId: 1,
    };
    const signed = signTypedData({
      privateKey: Buffer.from(hexToBytes(account.privateKey)),
      data: { types, primaryType: 'Collection', domain, message: value },
      version: SignTypedDataVersion.V4,
    });
    const verified = toChecksumAddress(
      recoverTypedSignature({
        data: { types, primaryType: 'Collection', domain, message: value },
        signature: signed,
        version: SignTypedDataVersion.V4,
      }),
    );
    assert.equal(verified, address);
  });
});
