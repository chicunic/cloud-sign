import { Crc32c } from '@aws-crypto/crc32c';
import { KeyManagementServiceClient } from '@google-cloud/kms';
import { ECDSASigValue } from '@peculiar/asn1-ecc';
import { AsnParser } from '@peculiar/asn1-schema';
import { createPublicKey } from 'crypto';
import { Signature, recoverAddress, toBeHex } from 'ethers';
import { uint8ArrayToBigInt } from 'web3-eth-accounts';

export async function cloudSign(versionName: string, digest: Uint8Array, ethereumAddress: string): Promise<Signature> {
  const digestBuffer = Buffer.from(digest);
  const digestCrc32c = new Crc32c().update(digestBuffer).digest();

  // Sign the message with Cloud KMS
  const client = new KeyManagementServiceClient();
  const [signResponse] = await client.asymmetricSign({
    name: versionName,
    digest: { sha256: digestBuffer },
    digestCrc32c: { value: digestCrc32c },
  });

  // Optional, but recommended: perform integrity verification on signResponse.
  // For more details on ensuring E2E in-transit integrity to and from Cloud KMS visit:
  // https://cloud.google.com/kms/docs/data-integrity-guidelines
  if (signResponse.name !== versionName) {
    throw new Error('sign failed');
  }
  if (!signResponse.verifiedDigestCrc32c) {
    throw new Error('sign failed');
  }
  if (
    new Crc32c().update(signResponse.signature as Uint8Array).digest() !== Number(signResponse.signatureCrc32c?.value)
  ) {
    throw new Error('sign failed');
  }

  // get correct r and s
  const parsedSignature = AsnParser.parse(signResponse.signature as Buffer, ECDSASigValue);
  const rBigInt = uint8ArrayToBigInt(new Uint8Array(parsedSignature.r));
  let sBigInt = uint8ArrayToBigInt(new Uint8Array(parsedSignature.s));
  const secp256k1halfN = BigInt('0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141') / 2n;
  if (sBigInt > secp256k1halfN) sBigInt = secp256k1halfN - sBigInt;

  // get correct v
  const r: string = toBeHex(rBigInt, 32);
  const s: string = toBeHex(sBigInt, 32);
  let v = 27;
  let recovered = recoverAddress(digestBuffer, { r, s, v });
  if (recovered.toLowerCase() !== ethereumAddress.toLowerCase()) {
    v = 28;
    recovered = recoverAddress(digestBuffer, { r, s, v });
  }
  if (recovered.toLowerCase() !== ethereumAddress.toLowerCase()) {
    throw new Error('sign failed');
  }
  return Signature.from({ r, s, v });
}

export async function cloudPublicKey(versionName: string): Promise<string> {
  const client = new KeyManagementServiceClient();
  const [publicKey] = await client.getPublicKey({ name: versionName });
  if (!publicKey || !publicKey.pem) throw new Error('can not find version name');
  const publicKeyBuffer = createPublicKey({ key: publicKey.pem, format: 'pem' })
    .export({ type: 'spki', format: 'der' })
    .subarray(-64);
  return `0x${Buffer.from(publicKeyBuffer).toString('hex')}`;
}
