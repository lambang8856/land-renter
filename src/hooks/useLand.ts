import { AptosClient } from '@/config';
import axios from '@/utils/axios';
import { Account, AccountAddress, Ed25519PrivateKey, Signature } from '@aptos-labs/ts-sdk';

export const APTOS_COIN_TYPE = '0x1::aptos_coin::AptosCoin';
const DEFAULT_INVITER_ADDRESS = AccountAddress.from('0x1').toStringLong();
const CONTRACT_MODULE_GENERATOR = (
  func: `${string}::${string}`,
): `${string}::${string}::${string}` =>
  `${import.meta.env.VITE_APP_LAND_CONTRACT_ADDRESS}::${func}`;

const submitSponsorTransactionQuery = (
  transaction: any,
  signature: any,
) => `mutation submitSponsorTransactionInternal{
  submitSponsorTransactionInternal(
        transaction: "${transaction}",
        signature: "${signature}"
    )
  }`;

interface BidOnSupportTicketsArgs {
  epochId: number;
  amount: number | string;
  account: any;
}
interface BidOnAPTSArgs extends BidOnSupportTicketsArgs {
  object_ids: string[];
  inviter?: string;
}

const useLand = () => {
  const preapreAccountWithPrivateKey = async (privateKey: any) => {
    const prik = new Ed25519PrivateKey(privateKey);
    return Account.fromPrivateKey({
      privateKey: prik,
    });
  };

  const getLiveEpochId = async () => {
    const result: any = await AptosClient.view({
      payload: {
        function: CONTRACT_MODULE_GENERATOR('auction::get_live_epoch_id'),
        functionArguments: [],
      },
    });
    return result?.[0]?.vec?.[0] || '';
  };

  const getAPTSForPurchase = async (args: any) => {
    const signAccount = await preapreAccountWithPrivateKey(import.meta.env.VITE_APP_SIGN_PK_KEY);
    const account = await preapreAccountWithPrivateKey(args.account.privateKey);

    const signature: Signature = signAccount.sign(args.account.address);

    const transaction = await AptosClient.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${import.meta.env.VITE_APP_SIGN_CONTRACT_ADDRESS}::coin_listing::purchase`,
        typeArguments: [APTOS_COIN_TYPE],
        functionArguments: [args.account.address, args.amount.toString(), signature.toUint8Array()],
      },
      options: {
        maxGasAmount: 10000,
      },
    });

    const [userTransactionResponse] = await AptosClient.transaction.simulate.simple({
      signerPublicKey: account.publicKey,
      transaction,
    });

    if (!userTransactionResponse.success) {
      throw new Error(userTransactionResponse.vm_status);
    }

    // using signAndSubmit combined
    const committedTransaction = await AptosClient.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    await AptosClient.waitForTransaction({ transactionHash: committedTransaction.hash });

    return {
      address: account.accountAddress.toString(),
      transactionHash: committedTransaction.hash,
    };
  };

  const submitSponsorTransaction = async (transaction: any, signature: any) => {
    return await axios.post(import.meta.env.VITE_APP_MARKET_GRAPHQL_ENDPOINT, {
      opertationName: 'submitSponsorTransaction',
      query: submitSponsorTransactionQuery(transaction, signature),
      variables: {},
    });
  };

  const bidOnAPTS = async (args: BidOnAPTSArgs) => {
    const account: Account = await preapreAccountWithPrivateKey(args.account.privateKey);

    const payload = {
      data: {
        function: CONTRACT_MODULE_GENERATOR('bid::bid_on_apts'),
        typeArguments: [],
        functionArguments: [
          // epoch_id: u64,
          args.epochId,
          // apts_objects: vector<address>,
          args.object_ids,
          // amount: u128,
          args.amount,
          // inviter: address
          DEFAULT_INVITER_ADDRESS,
        ],
      },
    };

    const transaction = await AptosClient.transaction.build.simple({
      sender: args.account.address,
      data: payload.data,
      withFeePayer: true,
    });

    const senderAuthenticator = await AptosClient.sign({
      signer: account,
      transaction,
    });

    // submit v2
    const submitResult: any = await submitSponsorTransaction(
      transaction.rawTransaction.bcsToHex().toString(),
      // SDK Ser
      senderAuthenticator.bcsToHex().toString(),
    );
    const result = submitResult?.data?.submitSponsorTransactionInternal;

    if (result?.match(/^0x/)) {
      console.log(result);
    } else {
      throw new Error(result);
    }

    await AptosClient.waitForTransaction({ transactionHash: result });

    return {
      address: account.accountAddress.toString(),
      transactionHash: result,
    };
  };

  return {
    getLiveEpochId,
    bidOnAPTS,
    getAPTSForPurchase,
  };
};

export default useLand;

