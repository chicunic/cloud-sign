import 'dotenv/config';
import {
  FeeMarketEIP1559Transaction,
  TypedTransaction,
  Web3Account,
  privateKeyToAccount,
  signTransaction,
} from 'web3-eth-accounts';
import { toBigInt, toWei } from 'web3-utils';

const account: Web3Account = privateKeyToAccount(process.env.PRIVATE_KEY as string);

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

(async function main(): Promise<void> {
  const account: Web3Account = privateKeyToAccount(process.env.PRIVATE_KEY as string);
  console.log('address:', account.address);

  console.log('unsigned:', transaction);

  const { rawTransaction: signed } = await signTransaction(
    transaction as TypedTransaction,
    process.env.PRIVATE_KEY as string,
  );
  console.log('signed:', signed, signed.length);
})();
