import axios from '@/utils/axios';
import { AccountAddress } from '@aptos-labs/ts-sdk';

const getLandAptsPoolQuery = (epochId: number | string) => `query getLandAptsPool {
	getLandAptsPool(
	  epochId: ${Number(epochId)},)
  }`;

const getLandBidStatQuery = (epochId: number | string) => `query getLandBidStat {
	getLandBidStat(
	  epochId: ${Number(epochId)}) {
		bidCount,
		epochId,
		maxBidApts
	  }
  }`;

const getLandEpochInfoQuery = (epochId: number | string) => `query getLandEpochInfo {
	getLandEpochInfo(
	  epochId: ${Number(epochId)})  {
		endTime,
		startTime,
	  }
  }`;

const getMaxBidQuery = (epochId: number | string) => `query getMaxBid{
  getMaxBid(epochId: ${epochId})
}`;

const getLandEpochStatQuery = (address: string, page: number) => `query getLandEpochStat {
	getLandEpochStat(
	  address: "${address ? AccountAddress.fromString(address).toStringLong() : ''}",
	page: {num: ${page}, size: 10}) {
	  bidStat {
		  bidCount,
      epochId,
      maxBidApts
    },
	  epochId,
	  epochMeta {
      startTime,
      endTime,
      status,
	  },
	  myLandReward {
      bidCount,
      ticketCount,
      distributionApts,
      epochId,
      isAuctionLand,
      isLotteryLand,
	  },
    supportTicketStat{
      amount
    }
	}
  }`;

const getMyInviteCodeQuery = (address: string) => `query getMyInviteCode {
	getMyInviteCode(address: "${AccountAddress.fromString(address).toStringLong()}")
  }`;

const getMyLandBidStatQuery = (bidder: string, epochId: number) => `query getMyLandBidStat {
	getMyLandBidStat(bidder: "${AccountAddress.fromString(bidder).toStringLong()}", epochId: ${Number(
  epochId,
)}) {
	  bidCount,
	  epochId,
	  maxBidApts
	}
  }`;

const getMyLastBidQuery = (address: string, epochId: number) => `query getMyLastBid {
	getMyLastBid(address: "${AccountAddress.fromString(address).toStringLong()}", epochId: ${Number(
  epochId,
)}) 
  }`;

const getMySupportTicketCountQuery = (address: string) => `query getMySupportTicketCount {
	getMySupportTicketCount(address: "${AccountAddress.fromString(address).toStringLong()}")
  }`;

const getAddressByInviteCodeQuery = (inviteCode: number | string) => `query getAddressByInviteCode{
  getAddressByInviteCode(inviteCode: ${inviteCode})
}`;

const getToolWalletQuery = () => `query getToolWallet{
  getToolWallet {
    address,
    privateKey
  }
}`;

const getToolTopWalletQuery = (index: number | string) => `query getToolTopWallet{
  getToolTopWallet(epochId: ${index}) {
    address,
    privateKey
  }
}`;

const useLandGraphQL = () => {
  const getLandAptsPool = async (epochId: number | string) => {
    return await axios.post(import.meta.env.VITE_APP_MARKET_GRAPHQL_ENDPOINT, {
      opertationName: 'getLandAptsPool',
      query: getLandAptsPoolQuery(epochId),
      variables: {},
    });
  };

  const getLandBidStat = async (epochId: number | string) => {
    return await axios.post(import.meta.env.VITE_APP_MARKET_GRAPHQL_ENDPOINT, {
      opertationName: 'getLandBidStat',
      query: getLandBidStatQuery(epochId),
      variables: {},
    });
  };

  const getLandEpochInfo = async (epochId: number | string) => {
    return await axios.post(import.meta.env.VITE_APP_MARKET_GRAPHQL_ENDPOINT, {
      opertationName: 'getLandEpochInfo',
      query: getLandEpochInfoQuery(epochId),
      variables: {},
    });
  };

  const getLandEpochStat = async (address: string, page: number) => {
    return await axios.post(import.meta.env.VITE_APP_MARKET_GRAPHQL_ENDPOINT, {
      opertationName: 'getLandEpochStat',
      query: getLandEpochStatQuery(address, page),
      variables: {},
    });
  };

  const getMyInviteCode = async (address: string) => {
    return await axios.post(import.meta.env.VITE_APP_MARKET_GRAPHQL_ENDPOINT, {
      opertationName: 'getMyInviteCode',
      query: getMyInviteCodeQuery(address),
      variables: {},
    });
  };

  const getMyLandBidStat = async (bidder: string, epochId: number) => {
    return await axios.post(import.meta.env.VITE_APP_MARKET_GRAPHQL_ENDPOINT, {
      opertationName: 'getMyLandBidStat',
      query: getMyLandBidStatQuery(bidder, epochId),
      variables: {},
    });
  };

  const getMyLastBid = async (address: string, epochId: number) => {
    return await axios.post(import.meta.env.VITE_APP_MARKET_GRAPHQL_ENDPOINT, {
      opertationName: 'getMyLastBid',
      query: getMyLastBidQuery(address, epochId),
      variables: {},
    });
  };

  const getMySupportTicketCount = async (address: string) => {
    return await axios.post(import.meta.env.VITE_APP_MARKET_GRAPHQL_ENDPOINT, {
      opertationName: 'getMySupportTicketCount',
      query: getMySupportTicketCountQuery(address),
      variables: {},
    });
  };

  const getAddressByInviteCode = async (inviteCode: number | string) => {
    return await axios.post(import.meta.env.VITE_APP_MARKET_GRAPHQL_ENDPOINT, {
      opertationName: 'getAddressByInviteCode',
      query: getAddressByInviteCodeQuery(inviteCode),
      variables: {},
    });
  };

  const getEpochMaxBid = async (epochId: number) => {
    return await axios.post(import.meta.env.VITE_APP_MARKET_GRAPHQL_ENDPOINT, {
      opertationName: 'getMaxBid',
      query: getMaxBidQuery(epochId),
      variables: {},
    });
  };

  const getToolWallet = async (landToolID: string) => {
    return await axios.post(
      import.meta.env.VITE_APP_MARKET_GRAPHQL_ENDPOINT,
      {
        opertationName: 'getToolWallet',
        query: getToolWalletQuery(),
        variables: {},
      },
      {
        headers: {
          'X-LandTool-Id': landToolID,
        },
      },
    );
  };

  const getToolTopWallet = async (epochId: number, landToolID: string) => {
    return await axios.post(
      import.meta.env.VITE_APP_MARKET_GRAPHQL_ENDPOINT,
      {
        opertationName: 'getToolTopWallet',
        query: getToolTopWalletQuery(epochId),
        variables: {},
      },
      {
        headers: {
          'X-LandTool-Id': landToolID,
        },
      },
    );
  };

  return {
    getLandAptsPool,
    getLandBidStat,
    getLandEpochInfo,

    getLandEpochStat,
    getMyInviteCode,

    getMyLandBidStat,
    getMyLastBid,
    getEpochMaxBid,
    getMySupportTicketCount,
    getAddressByInviteCode,

    getToolWallet,
    getToolTopWallet,
  };
};

export default useLandGraphQL;

