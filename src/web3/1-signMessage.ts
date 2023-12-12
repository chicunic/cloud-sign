import { personalSign, recoverPersonalSignature } from '@metamask/eth-sig-util';
import 'dotenv/config';
import { Web3Account, privateKeyToAccount, recover, sign } from 'web3-eth-accounts';
import { hexToBytes, toChecksumAddress } from 'web3-utils';

const account: Web3Account = privateKeyToAccount(process.env.PRIVATE_KEY as string);
const message = 'message';

(function main(): void {
  console.log('address 0:', account.address);

  const { signature: signed } = account.sign(message);
  console.log('signed 0:', signed, signed.length);

  const { signature: signed1 } = sign(message, process.env.PRIVATE_KEY as string);
  console.log('signed 1:', signed1, signed1.length);

  const signed2 = personalSign({
    privateKey: Buffer.from(hexToBytes(process.env.PRIVATE_KEY as string)),
    data: message,
  });
  console.log('signed 2:', signed2, signed2.length);

  const address1 = recover(message, signed);
  console.log('address 1:', address1);

  const address2 = toChecksumAddress(recoverPersonalSignature({ data: message, signature: signed }));
  console.log('address 2:', address2);
})();
