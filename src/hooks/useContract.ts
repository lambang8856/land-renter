import { AptosClient } from '@/config';
import axios from '@/utils/axios';
import { Account, AccountAddress, Ed25519PrivateKey } from '@aptos-labs/ts-sdk';

const owenedNFTOfCollectionQuery = (
  owner: string,
  name: string,
  offset: number = 0,
) => `query OwenedNFT {
	current_token_ownerships_v2(
	  limit: 100,
	  offset: ${offset}
	  where: {
		owner_address: {_eq: "${AccountAddress.fromString(owner).toStringLong()}"}, 
		token_standard: {_eq: "v2"}, 
		amount: {_gt: "0"}, 
		current_token_data: {
		  current_collection: {
			creator_address: {_eq: "${import.meta.env.VITE_APP_RESOURCE_ADDRESS}"},
			collection_name: {_eq: "${name}"}
		  }
		}
	  }
	) {
	  token_data_id
	  current_token_data {
		token_name
	  }
	}
  }`;

const APT20_CONTRACT_ADDRESS = import.meta.env.VITE_APP_APT20_CONTRACT_ADDRESS;
const CONTRACT_ADDRESS = import.meta.env.VITE_APP_CONTRACT_ADDRESS;

export interface MintArgs {
  currentEpoch: number;
  mainAccountObjectIDs: string[];
  subAccountIndexs: number[];
  subAccountPaymentAmounts: number[];
}

const useContract = () => {
  const getBalance = async (addr: string) => {
    return AptosClient.getAccountCoinAmount({
      accountAddress: addr,
      coinType: '0x1::aptos_coin::AptosCoin',
    });
  };

  const getOwenedNFTOfCollection = async (owner: string, name: string, offset: number = 0) => {
    return await axios.post(import.meta.env.VITE_APP_GRAPHQL_ENDPOINT, {
      opertationName: 'OwenedNFT',
      query: owenedNFTOfCollectionQuery(owner, name, offset),
      variables: {},
    });
  };

  const getTokenInscriptionAmount = async (tokens: string[]) => {
    return await AptosClient.view({
      payload: {
        function: `${
          import.meta.env.VITE_APP_CONTRACT_ADDRESS
        }::apts::get_token_inscription_amount`,
        functionArguments: [tokens],
      },
    });
  };

  const getAPTSBalance = async (addr: string) => {
    if (addr) {
      let fetching = true;
      let ids: any[] = [];
      let offset = 0;

      do {
        const result: any = await getOwenedNFTOfCollection(addr, 'APTS', offset);

        ids = ids.concat(
          (result?.data?.current_token_ownerships_v2 || [])
            .map((_: any) => _.token_data_id || '')
            .filter((id: any) => !!id),
        );

        offset += 100;
        if (result?.data?.current_token_ownerships_v2?.length != 100) {
          fetching = false;
        }
      } while (fetching);

      const amount: any = await getTokenInscriptionAmount(ids);
      return amount?.[0] || 0;
    }
    return 0;
  };

  const generatedAccounts = async () => {
    const accountsList: any = new Array(10).fill(0);
    for (const index in accountsList) {
      const account = await Account.generate();
      accountsList[index] = {
        address: account.accountAddress.toString(),
        privateKey: account.privateKey.toString(),
      };
    }
    console.log(accountsList);
  };

  const getInscriptionConf = async (name: string) => {
    if (!name) return;

    return await AptosClient.view({
      payload: {
        function: `${APT20_CONTRACT_ADDRESS}::apts::get_inscription_conf`,
        functionArguments: [name],
      },
    });
  };

  const preapreAccountWithPrivateKey = async (privateKey: any) => {
    const prik = new Ed25519PrivateKey(privateKey);
    return Account.fromPrivateKey({
      privateKey: prik,
    });
  };

  const mint = async (privateKey: String, mintArgs: MintArgs) => {
    const account: Account = await preapreAccountWithPrivateKey(privateKey);
    // name, txn_count,sub_account_count
    const transaction = await AptosClient.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${CONTRACT_ADDRESS}::tool::mint`,
        typeArguments: [],
        functionArguments: [
          // current epoch: u64,
          mintArgs.currentEpoch,
          // object_ids: vector<address>,
          mintArgs.mainAccountObjectIDs,
          // sub account count: u64,
          mintArgs.subAccountIndexs,
          // amounts:vector<u64>
          mintArgs.subAccountPaymentAmounts,
        ],
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

  // Create Sub Account with Private Key
  const createSubAccount = async (privateKey: String, amount: number) => {
    const account: Account = await preapreAccountWithPrivateKey(privateKey);

    const transaction = await AptosClient.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${CONTRACT_ADDRESS}::tool::create_account`,
        typeArguments: [],
        functionArguments: [amount],
      },
    });

    // using signAndSubmit combined
    const committedTransaction = await AptosClient.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    await AptosClient.waitForTransaction({ transactionHash: committedTransaction.hash });
  };

  const checkSubAccount = async (privateKey: String) => {
    const account: Account = await preapreAccountWithPrivateKey(privateKey);
    return await AptosClient.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::tool::get_account_count`,
        functionArguments: [account.accountAddress.toString()],
      },
    });
  };

  const getSubAccount = async (privateKey: String) => {
    const account: Account = await preapreAccountWithPrivateKey(privateKey);
    return await AptosClient.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::tool::get_accounts`,
        functionArguments: [account.accountAddress.toString()],
      },
    });
  };

  const gatherSubAccount = async (privateKey: string, payload: any) => {
    const account: Account = await preapreAccountWithPrivateKey(privateKey);

    const data: any = {
      function: `${CONTRACT_ADDRESS}::tool::withdraw`,
      typeArguments: [],
      functionArguments: [payload.indexs, payload.nfts],
    };

    const transaction = await AptosClient.transaction.build.simple({
      sender: account.accountAddress,
      data,
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
  };

  const getOwnersNFTs = async (owner: string) => {
    if (!owner) {
      throw new Error('owner is required');
    }

    const addr = AccountAddress.fromString(owner).toStringLong();
    return await axios.post(
      import.meta.env.VITE_APP_GRAPHQL_ENDPOINT,
      {
        opertationName: 'MyQuery',
        query: `query MyQuery {
        current_token_datas_v2(
          where: {current_token_ownership: {owner_address: {_eq: "${addr}"}, amount: {_gt: "0"}}}
        ) {
          token_data_id
          token_properties
        }
      }`,
        variables: {},
      },
      {
        timeout: 1000,
      },
    );
  };

  return {
    generatedAccounts,
    getBalance,
    getAPTSBalance,

    preapreAccountWithPrivateKey,
    getInscriptionConf,
    mint,

    getOwnersNFTs,

    checkSubAccount,
    createSubAccount,
    getSubAccount,

    gatherSubAccount,
  };
};

export default useContract;

