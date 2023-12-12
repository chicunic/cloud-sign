import 'dotenv/config';
import { Wallet, verifyMessage } from 'ethers';

const wallet = new Wallet(process.env.PRIVATE_KEY as string);
const message: string = 'message';

(function main(): void {
  console.log('address 0:', wallet.address);

  const signed = wallet.signMessageSync(message);
  console.log('signed:', signed, signed.length);

  const address = verifyMessage(message, signed);
  console.log('address 1:', address);
})();
