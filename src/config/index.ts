import { Aptos, AptosConfig } from '@aptos-labs/ts-sdk';
export const APT_DECIMALS = 8;

export const AptosClient = new Aptos(
  new AptosConfig({
    network: import.meta.env.VITE_APP_NETWORK,
  }),
);

export const BID_FEE = 100;
