import 'dotenv/config';
import { CloudWallet } from './CloudWallet';
import { Transaction, TransactionRequest, parseEther, parseUnits } from 'ethers';

const wallet = new CloudWallet(process.env.VERSION_NAME as string);

(async function main(): Promise<void> {
  const address = await wallet.getAddress();
  console.log('address 0:', address);

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
  console.log('unsigned:', transaction);

  const signed = await wallet.signTransaction(transaction);
  console.log('signed:', signed, signed.length);

  const { from } = Transaction.from(signed);
  console.log('address 1:', from);
})();
