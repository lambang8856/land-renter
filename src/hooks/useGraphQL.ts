import axios from '@/utils/axios';
import { AccountAddress } from '@aptos-labs/ts-sdk';
import { message } from 'ant-design-vue';
import BigNumber from 'bignumber.js';

const MyAssetsQurery = (owner_adderr: string, offset: number) => `query MyAssets {
  current_token_ownerships_v2(
    limit: 100,
    offset: ${offset}
    where: {owner_address: {_eq: "${AccountAddress.fromString(
      owner_adderr,
    ).toStringLong()}"}, token_standard: {_eq: "v2"}, amount: {_gt: "0"}, current_token_data: {current_collection: {creator_address: {_eq: "${
  import.meta.env.VITE_APP_RESOURCE_ADDRESS
}"}}}}
  ) {
    table_type_v1
    token_data_id
    token_standard
    current_token_data {
      collection_id
      token_data_id
      token_name
      current_collection {
        collection_name
      }
    }
  }
}`;

const HolderQuery = (tokenName: string) => `query CollectionOwnersData {
  current_collection_ownership_v2_view_aggregate(
    where: {creator_address: {_eq: "${
      import.meta.env.VITE_APP_RESOURCE_ADDRESS
    }"}, collection_name: {_eq: "${tokenName}"}}
  ) {
    aggregate {
      count(distinct: true, columns: owner_address)
    }
  }
}`;

const useGraphQL = () => {
  const fetchAssetsByAddress = async (address: string) => {
    let page = 0;
    let size = 100;
    let hasMore = true;
    let tokens: any[] = [];
    do {
      const result: any = await axios.post(import.meta.env.VITE_APP_GRAPHQL_ENDPOINT, {
        opertationName: 'MyQuery',
        query: MyAssetsQurery(address, page * size),
        variables: {},
      });

      if (result.errors) {
        console.log(result.errors?.[0].message);
        message.error('Maybe not loaded all assets yet, please try again later.');
        break;
      } else {
        tokens = tokens.concat(result?.data?.current_token_ownerships_v2);
      }

      hasMore = result?.data?.current_token_ownerships_v2?.length === 100;
      page += 1;
    } while (hasMore);

    return tokens || [];
  };

  // fetch Holder
  const fetchHolderAmount = async (tokenName: string) => {
    return await axios.post(import.meta.env.VITE_APP_GRAPHQL_ENDPOINT, {
      opertationName: 'Holder',
      query: HolderQuery(tokenName),
      variables: {},
    });
  };

  const fetchHolderAmountWithCache = async (tokenName: string) => {
    if (!tokenName) throw new Error('tokenName is required');

    return await axios.get(`/util/holder_count/${encodeURIComponent(tokenName)}`);
  };

  const getOwnersNFTs = async (owner: string, tokenName: string) => {
    if (!owner) {
      throw new Error('owner is required');
    }

    return await axios.post(import.meta.env.VITE_APP_GRAPHQL_ENDPOINT, {
      opertationName: 'getOwnersNFTs',
      query: `query getOwnersNFTs {
        current_token_datas_v2(
          where: {current_token_ownership: {owner_address: {_eq: "${owner}"}, amount: {_gt: "0"}}, current_collection: {creator_address: {_eq: "${
        import.meta.env.VITE_APP_RESOURCE_ADDRESS
      }"}, collection_name: {_eq: "${tokenName}"}}}
        ) {
          token_data_id
          token_properties
        }
      }`,
      variables: {},
    });
  };

  const getOwnersDonateNFTs = async (owner: string, collection_id: string) => {
    if (!owner) {
      throw new Error('owner is required');
    }

    let hasMore = true;
    let resultTokens: any[] = [];
    let offset = 0;
    let limit = 100;

    do {
      const result: any = await axios.post(import.meta.env.VITE_APP_GRAPHQL_ENDPOINT, {
        query: `query getNFTsOfSpecificCollection($address: String!, $collection_id: String!, $offset: Int, $limit: Int) {
          current_token_ownerships_v2(
            where: {owner_address: {_eq: $address}, amount: {_gt: "0"}, current_token_data: {collection_id: {_eq: $collection_id}}}
            order_by: [{last_transaction_version: desc}, {token_data_id: desc}]
            offset: $offset
            limit: $limit
          ) {
            token_data_id
            current_token_data {
              token_name
              token_properties
            }
          }
        }`,
        variables: {
          address: owner,
          collection_id,
          limit,
          offset,
        },
        operationName: 'getNFTsOfSpecificCollection',
      });

      resultTokens = resultTokens.concat(result?.data?.current_token_ownerships_v2 || []);
      hasMore = result?.data?.current_token_ownerships_v2?.length === 100;
      offset += limit;
    } while (hasMore);

    return resultTokens;
  };

  const getValidNFTs = async ({
    owner,
    tokenName,
    amount,
  }: {
    owner: string;
    tokenName: string;
    amount: number | string | BigNumber;
  }) => {
    if (!owner) {
      throw new Error('Owner is required');
    }
    if (!tokenName) {
      throw new Error('TokenName is required');
    }
    if (!amount) {
      throw new Error('Amount is required');
    }

    let offset = 0;
    let fetching = true;
    let sum = 0;
    let ids: string[] = [];

    do {
      const result: any = await axios.post(import.meta.env.VITE_APP_GRAPHQL_ENDPOINT, {
        opertationName: 'getValidNFTs',
        query: `query getValidNFTs {
        current_token_datas_v2(
          limit: 100,
          offset: ${offset}
          where: {current_token_ownership: {owner_address: {_eq: "${owner}"}, amount: {_gt: "0"}}, current_collection: {creator_address: {_eq: "${
          import.meta.env.VITE_APP_RESOURCE_ADDRESS
        }"}, collection_name: {_eq: "${tokenName}"}}}
        ) {
          token_data_id
          token_properties
        }
      }`,
        variables: {},
      });

      for (const element of result?.data?.current_token_datas_v2) {
        if (!element?.token_properties?.amt) {
          continue;
        }

        sum = new BigNumber(sum).plus(element?.token_properties?.amt).toNumber();
        ids.push(element?.token_data_id);

        if (new BigNumber(sum).isGreaterThanOrEqualTo(amount)) {
          break;
        }
      }

      if (new BigNumber(sum).isGreaterThanOrEqualTo(amount)) {
        break;
      }

      offset += 100;
      if (result?.data?.current_token_datas_v2?.length != 100) {
        fetching = false;
      }
    } while (fetching);

    if (ids.length === 0 || new BigNumber(sum).isLessThan(amount)) {
      throw new Error('You do not have enough amount');
    }

    return ids;
  };

  return {
    fetchAssetsByAddress,
    fetchHolderAmount,
    fetchHolderAmountWithCache,
    getOwnersNFTs,
    getValidNFTs,
    getOwnersDonateNFTs,
  };
};

export default useGraphQL;

