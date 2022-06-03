require('dotenv').config();
const { utils, Wallet } = require('ethers');

const wallet = new Wallet(process.env.PRIVATE_KEY);
const message = 'message';

const main = async () => {
  console.log('address 0', wallet.address);

  const signed = await wallet.signMessage(message);
  console.log('signed', signed, signed.length);

  const address = await utils.verifyMessage(message, signed);
  console.log('address 1', address);
};

main();
