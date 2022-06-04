const { Signer, utils } = require('ethers');
const {
  cloudSignDigest,
  getEthereumAddress,
  getPublicKey,
} = require('./utils');

const CloudSigner = class extends Signer {
  constructor(credentials, provider) {
    super();
    this.credentials = credentials;
    this.provider = provider;
  }

  async getAddress() {
    if (!this.ethereumAddress) {
      const key = await getPublicKey(this.credentials);
      this.ethereumAddress = getEthereumAddress(key);
    }
    return this.ethereumAddress;
  }

  // editor from SigningKey.signDigest()
  async signDigest(digest) { // digest: BytesLike
    const digestBuffer = Buffer.from(utils.arrayify(digest));
    const ethereumAddress = await this.getAddress();
    const sig = await cloudSignDigest(this.credentials, digestBuffer, ethereumAddress);
    return utils.splitSignature(sig);
  }

  // edit from Wallet.signMessage()
  async signMessage(message) {
    const signature = await this.signDigest(utils.hashMessage(message));
    return utils.joinSignature(signature);
  }

  // edit from Wallet.signTransaction()
  async signTransaction(transaction) {
    const tx = transaction;
    const ethereumAddress = await this.getAddress();
    if (tx.from != null) {
      if (tx.from !== ethereumAddress) {
        throw Error(`transaction from address mismatch ${tx.from}`);
      }
      delete tx.from;
    }
    const signature = await this.signDigest(utils.keccak256(utils.serialize(tx)));
    return utils.serialize(tx, signature);
  }

  // edit from Wallet._signTypedData()
  async _signTypedData(domain, types, value) {
    const populated = await utils._TypedDataEncoder.resolveNames(domain, types, value, (name) => {
      if (this.provider == null) throw Error('cannot resolve ENS names without a provider');
      return this.provider.resolveName(name);
    });
    const signature = await this.signDigest(utils._TypedDataEncoder.hash(populated.domain, types, populated.value));
    return utils.joinSignature(signature);
  }
};

module.exports = CloudSigner;
