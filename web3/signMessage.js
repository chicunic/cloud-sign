require('dotenv').config();
const Accounts = require('web3-eth-accounts');
const { hexToBytes, toChecksumAddress } = require('web3-utils');
const { personalSign, recoverPersonalSignature } = require('@metamask/eth-sig-util');

const message = 'message';

const main = async () => {
  const accounts = new Accounts();
  const account = accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
  console.log('address 0', account.address);

  const { signature: signed } = account.sign(message);
  console.log('signed 0', signed, signed.length);

  const { signature: signed1 } = accounts.sign(message, process.env.PRIVATE_KEY);
  console.log('signed 1', signed1, signed1.length);

  const signed2 = personalSign({ privateKey: hexToBytes(process.env.PRIVATE_KEY), data: message });
  console.log('signed 2', signed2, signed2.length);

  const address1 = accounts.recover(message, signed);
  console.log('address 1', address1);

  const address2 = toChecksumAddress(recoverPersonalSignature({ data: message, signature: signed }));
  console.log('address 2', address2);
};

main();
