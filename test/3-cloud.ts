import 'dotenv/config';
import { assert } from 'chai';
import { Transaction, ZeroAddress, parseEther, parseUnits, verifyMessage, verifyTypedData } from 'ethers';
import { CloudWallet } from '../src/cloud/CloudWallet';

describe('3. Test cloud signer', () => {
  let wallet: CloudWallet;
  let address: string;

  before(async () => {
    wallet = new CloudWallet(process.env.VERSION_NAME as string);
  });

  it('3-1: create wallet', async () => {
    address = await wallet.getAddress();
    assert.notEqual(ZeroAddress, address);
  });

  it('3-2: sign message', async () => {
    const message = 'message';
    const signed = await wallet.signMessage(message);
    const verified = await verifyMessage(message, signed);
    assert.equal(verified, address);
  });

  it('3-3: sign transaction', async () => {
    const transaction = {
      to: address,
      nonce: 0,
      gasLimit: 21000,
      value: parseEther('0.1'),
      chainId: 1,
      type: 2,
      maxPriorityFeePerGas: parseUnits('1.5', 'gwei'),
      maxFeePerGas: parseUnits('51.5', 'gwei'),
    };
    const signed = await wallet.signTransaction(transaction);
    const { from } = Transaction.from(signed);
    assert.equal(from, address);
  });

  it('3-4: sign typed data', async () => {
    const domain = {
      name: 'name',
      version: '1.0.0',
      chainId: 1,
      verifyingContract: ZeroAddress,
    };
    const types = {
      Collection: [{ name: 'tokenId', type: 'uint256' }],
    };
    const value = {
      tokenId: 1,
    };
    const signed = await wallet.signTypedData(domain, types, value);
    const verified = await verifyTypedData(domain, types, value, signed);
    assert.equal(verified, address);
  });
});
