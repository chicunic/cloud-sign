import 'dotenv/config';
import { TypedDataDomain, TypedDataField, Wallet, ZeroAddress, verifyTypedData } from 'ethers';

const wallet = new Wallet(process.env.PRIVATE_KEY as string);

const domain: TypedDataDomain = {
  name: 'name',
  version: '1.0.0',
  chainId: 1,
  verifyingContract: ZeroAddress,
};
const types: Record<string, Array<TypedDataField>> = {
  Collection: [{ name: 'tokenId', type: 'uint256' }],
};
const value: Record<string, any> = {
  tokenId: 1,
};

(async function main(): Promise<void> {
  console.log('address 0:', wallet.address);

  const signed = await wallet.signTypedData(domain, types, value);
  console.log('signed:', signed, signed.length);

  const address = verifyTypedData(domain, types, value, signed);
  console.log('address 1:', address);
})();
