import 'dotenv/config';
import { verifyMessage } from 'ethers';
import { CloudWallet } from './CloudWallet';

const wallet = new CloudWallet(process.env.VERSION_NAME as string);
const message: string = 'message';

(async function main(): Promise<void> {
  const address0 = await wallet.getAddress();
  console.log('address 0:', address0);

  const signed = await wallet.signMessage(message);
  console.log('signed:', signed, signed.length);

  const address = await verifyMessage(message, signed);
  console.log('address 1:', address);
})();
