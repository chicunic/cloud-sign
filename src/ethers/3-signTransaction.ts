import 'dotenv/config';
import { parseEther, parseUnits, Transaction, TransactionRequest, Wallet } from 'ethers';

const wallet = new Wallet(process.env.PRIVATE_KEY as string);

const transaction: TransactionRequest = {
  type: 2,
  to: wallet.address,
  nonce: 0, // provider.getTransactionCount(wallet.address)
  gasLimit: 21000,
  maxPriorityFeePerGas: parseUnits('1.5', 'gwei'), // provider.getFeeData()
  maxFeePerGas: parseUnits('51.5', 'gwei'), // provider.getFeeData()
  value: parseEther('0.1'),
  chainId: 1,
};

(async function main(): Promise<void> {
  console.log('address 0:', wallet.address);
  console.log('unsigned:', transaction);

  const signed = await wallet.signTransaction(transaction);
  console.log('signed:', signed, signed.length);

  const { from } = Transaction.from(signed);
  console.log('address 1:', from);
})();
