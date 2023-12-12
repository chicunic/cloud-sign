import 'dotenv/config';
import { TypedDataDomain, TypedDataField, ZeroAddress, verifyTypedData } from 'ethers';
import { CloudWallet } from './CloudWallet';

const wallet = new CloudWallet(process.env.VERSION_NAME as string);

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
  const address0 = await wallet.getAddress();
  console.log('address 0', address0);

  const signed = await wallet.signTypedData(domain, types, value);
  console.log('signed', signed, signed.length);

  const address = await verifyTypedData(domain, types, value, signed);
  console.log('address 1', address);
})();
