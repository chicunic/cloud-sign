import { SignTypedDataVersion, recoverTypedSignature, signTypedData } from '@metamask/eth-sig-util';
import 'dotenv/config';
import { hexToBytes, toChecksumAddress } from 'web3-utils';

const domain = {
  name: 'name',
  version: '1.0.0',
  chainId: 1,
  verifyingContract: '0x0000000000000000000000000000000000000000',
};
const types = {
  EIP712Domain: [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' },
  ],
  Collection: [{ name: 'tokenId', type: 'uint256' }],
};
const value = {
  tokenId: 1,
};

(function main(): void {
  const signed = signTypedData({
    privateKey: Buffer.from(hexToBytes(process.env.PRIVATE_KEY as string)),
    data: { types, primaryType: 'Collection', domain, message: value },
    version: SignTypedDataVersion.V4,
  });
  console.log('signed:', signed, signed.length);

  const address = toChecksumAddress(
    recoverTypedSignature({
      data: { types, primaryType: 'Collection', domain, message: value },
      signature: signed,
      version: SignTypedDataVersion.V4,
    }),
  );
  console.log('address:', address);
})();
