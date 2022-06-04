const { KeyManagementServiceClient } = require('@google-cloud/kms');
const { define } = require('asn1.js');
const BN = require('bn.js');
const crypto = require('crypto');
const {
  bufferToHex,
  bnToHex,
} = require('ethereumjs-util');
const { utils } = require('ethers');

const EcdsaPubKey = define('EcdsaPubKey', function () {
  this.seq().obj(this.key('algo').seq().obj(this.key('a').objid(), this.key('b').objid()), this.key('pubKey').bitstr());
});

const EcdsaSig = define('EcdsaSig', function () {
  this.seq().obj(this.key('r').int(), this.key('s').int());
});

const cloudSignDigest = async (credentials, digestBuffer, ethereumAddress) => {
  const client = new KeyManagementServiceClient();
  const versionName = client.cryptoKeyVersionPath(
    credentials.projectId,
    credentials.locationId,
    credentials.keyRingId,
    credentials.keyId,
    credentials.versionId,
  );
  const [{ signature }] = await client.asymmetricSign({
    name: versionName,
    digest: { sha256: digestBuffer },
  });
  if (!signature) throw new Error(`Can not sign digest: ${digestBuffer}`);

  // get correct r and s
  const { r: r0, s: s0 } = EcdsaSig.decode(signature, 'der');
  const secp256k1halfN = new BN('fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141', 16).div(new BN(2));
  let s1 = s0;
  if (s0.gt(secp256k1halfN)) s1 = secp256k1halfN.sub(s0);
  const r = bnToHex(r0);
  const s = bnToHex(s1);

  // get correct v
  let v = 27;
  let recovered = utils.recoverAddress(bufferToHex(digestBuffer), { r, s, v });
  if (recovered.toLowerCase() !== ethereumAddress.toLowerCase()) {
    v = 28;
    recovered = utils.recoverAddress(bufferToHex(digestBuffer), { r, s, v });
  }
  return { r, s, v };
};

const getEthereumAddress = (publicKey) => {
  const { pubKey: { data } } = EcdsaPubKey.decode(publicKey, 'der');
  return utils.computeAddress(bufferToHex(data));
};

const getPublicKey = async (credentials) => {
  const client = new KeyManagementServiceClient();
  const versionName = client.cryptoKeyVersionPath(
    credentials.projectId,
    credentials.locationId,
    credentials.keyRingId,
    credentials.keyId,
    credentials.versionId,
  );
  const [publicKey] = await client.getPublicKey({ name: versionName });
  if (!publicKey || !publicKey.pem) throw new Error(`Can not find key: ${credentials.keyId}`);
  return crypto.createPublicKey(publicKey.pem, 'pem').export({ type: 'spki', format: 'der' });
};

module.exports = {
  cloudSignDigest,
  getEthereumAddress,
  getPublicKey,
};
