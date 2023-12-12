import {
  BaseWallet,
  BytesLike,
  Provider,
  Signature,
  SigningKey,
  Transaction,
  TransactionLike,
  TransactionRequest,
  TypedDataDomain,
  TypedDataEncoder,
  TypedDataField,
  assert,
  assertArgument,
  computeAddress,
  dataLength,
  getAddress,
  getBytesCopy,
  hashMessage,
  resolveAddress,
  resolveProperties,
} from 'ethers';
import { cloudSign, cloudPublicKey } from './utils';

export class CloudWallet extends BaseWallet {
  readonly versionName: string;
  readonly provider: null | Provider;
  public address: string;

  constructor(versionName: string, provider?: null | Provider) {
    const signingKey = new SigningKey('0x0000000000000000000000000000000000000000000000000000000000000001');
    super(signingKey, provider);
    this.versionName = versionName;
    this.provider = provider || null;
    this.address = '';
  }

  async getAddress() {
    if (!this.address) {
      const publicKey = await cloudPublicKey(this.versionName);
      this.address = computeAddress(publicKey);
    }
    return this.address;
  }

  // editor from SigningKey.sign()
  // ethers@6.9.0/node_modules/ethers/src.ts/crypto/signing-key.ts
  private async sign(digest: BytesLike): Promise<Signature> {
    assertArgument(dataLength(digest) === 32, 'invalid digest length', 'digest', digest);

    const ethereumAddress = await this.getAddress();
    const sig = await cloudSign(this.versionName, getBytesCopy(digest), ethereumAddress);

    return Signature.from(sig);
  }

  // edit from BaseWallet.signTransaction()
  // ethers@6.9.0/node_modules/ethers/src.ts/wallet/base-wallet.ts
  async signTransaction(tx: TransactionRequest): Promise<string> {
    // Replace any Addressable or ENS name with an address
    const { to, from } = await resolveProperties({
      to: tx.to ? resolveAddress(tx.to, this.provider) : undefined,
      from: tx.from ? resolveAddress(tx.from, this.provider) : undefined,
    });

    if (to != null) tx.to = to;
    if (from != null) tx.from = from;

    if (tx.from != null) {
      assertArgument(
        getAddress(<string>tx.from) === this.address,
        'transaction from address mismatch',
        'tx.from',
        tx.from,
      );
      delete tx.from;
    }

    // Build the transaction
    const btx = Transaction.from(<TransactionLike<string>>tx);
    btx.signature = await this.sign(btx.unsignedHash);

    return btx.serialized;
  }

  // edit from BaseWallet.signMessage()
  // ethers@6.9.0/node_modules/ethers/src.ts/wallet/base-wallet.ts
  async signMessage(message: string | Uint8Array): Promise<string> {
    const signature = await this.sign(hashMessage(message));
    return signature.serialized;
  }

  // edit from BaseWallet.signTypedData()
  // ethers@6.9.0/node_modules/ethers/src.ts/wallet/base-wallet.ts
  async signTypedData(
    domain: TypedDataDomain,
    types: Record<string, Array<TypedDataField>>,
    value: Record<string, any>,
  ): Promise<string> {
    // Populate any ENS names
    const populated = await TypedDataEncoder.resolveNames(domain, types, value, async (name: string) => {
      // @TODO: this should use resolveName; addresses don't
      //        need a provider

      assert(this.provider != null, 'cannot resolve ENS names without a provider', 'UNSUPPORTED_OPERATION', {
        operation: 'resolveName',
        info: { name },
      });

      const address = await this.provider.resolveName(name);
      assert(address != null, 'unconfigured ENS name', 'UNCONFIGURED_NAME', {
        value: name,
      });

      return address;
    });

    const signature = await this.sign(TypedDataEncoder.hash(populated.domain, types, populated.value));
    return signature.serialized;
  }
}
