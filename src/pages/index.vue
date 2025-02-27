<template>
  <div class="page-container px-4">
    <h1 class="text-8 font-bold py-8">
      Land Renter 💰

      <font-awesome-icon
        :icon="`fa-solid ${!silent ? 'fa-volume-high' : 'fa-volume-mute'}`"
        class="text-base cursor-pointer ml-10"
        @click="silent = !silent"
      ></font-awesome-icon>
    </h1>

    <span class="flex gap-2 w-100">
      <Input v-model:value="landToolID" placeholder="land toold id" />
      <Button @click="init">加载</Button>
    </span>

    <div class="grid grid-cols-2 gap-1">
      <div class="flex-col gap-2">
        <div class="flex items-center justify-between mt-3">
          <span>冲量地址</span>
          <Button @click="basicInfoOfAccount('first')" v-if="firstBidAccountList.length > 0">
            Get Acount's Balances
          </Button>
        </div>

        <div class="max-h-100 overflow-y-auto">
          <div class="flex-col gap-1">
            <div
              class="flex-col gap-2 rounded-2 overflow-hidden text-sm"
              v-for="(account, index) in firstBidAccountList"
              :key="index"
            >
              <div class="bg-primary/8 hover:bg-primary/10 p-4 py-2 flex flex-wrap gap-2">
                <a
                  class="underline break-all"
                  target="_blank"
                  :href="`https://explorer.aptoslabs.com/account/${account.address}?network=${network}`"
                >
                  {{ index + 1 }}.
                  {{ account.address }}
                </a>
                <font-awesome-icon
                  icon="fa-regular fa-copy"
                  class="cursor-pointer"
                  @click="copy(account.address)"
                ></font-awesome-icon>
                <span>
                  <span>
                    Balance:
                    <span class="font-bold">
                      {{ PriceWithDecimal(account.balance || 0) }}
                    </span>
                    APT
                  </span>
                  |
                  <span>
                    APTS:
                    <span class="font-bold">
                      {{ NumberFormat(account.aptsBalance || 0) }}
                    </span>
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex-col gap-2">
        <div class="flex items-center justify-between mt-3">
          <span>TOP N 地址</span>
          <Button @click="basicInfoOfAccount('top')" v-if="topBidAccountList.length > 0">
            Get Acount's Balances
          </Button>
        </div>

        <div class="max-h-100 overflow-y-auto">
          <div class="flex-col gap-1">
            <div
              class="flex-col gap-2 rounded-2 overflow-hidden text-sm"
              v-for="(account, index) in topBidAccountList"
              :key="index"
            >
              <div class="bg-primary/8 hover:bg-primary/10 p-4 py-2 flex flex-wrap gap-2">
                <a
                  class="underline break-all"
                  target="_blank"
                  :href="`https://explorer.aptoslabs.com/account/${account.address}?network=${network}`"
                >
                  {{ index + 1 }}.
                  {{ account.address }}
                </a>
                <font-awesome-icon
                  icon="fa-regular fa-copy"
                  class="cursor-pointer"
                  @click="copy(account.address)"
                ></font-awesome-icon>
                <span>
                  <span>
                    Balance:
                    <span class="font-bold">
                      {{ PriceWithDecimal(account.balance || 0) }}
                    </span>
                    APT
                  </span>
                  |
                  <span>
                    APTS:
                    <span class="font-bold">
                      {{ NumberFormat(account.aptsBalance || 0) }}
                    </span>
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <hr class="my-5" />
    <span class="flex gap-2 text-sm items-center">
      <span class="w-fit">设置冲量的触发时间: 600 ~ 1</span>
      <Input class="w-100" v-model:value="FIRST_BID_TIME" />
      <span>
        换算触发倒计时为:
        {{ countDownDisplay(FIRST_BID_TIME) }}
      </span>
      <Switch v-model:checked="OPEN_FIRST_BID"></Switch>
      <span>开启冲量</span>
    </span>
    <span class="flex gap-2 text-sm items-center mt-5">
      <span class="w-fit">设置冲排行榜的触发时间: 600 ~ 1</span>
      <Input class="w-100" v-model:value="RANK_BID_TIME" />
      <span>
        换算触发倒计时为:
        {{ countDownDisplay(RANK_BID_TIME) }}
      </span>
      <Switch v-model:checked="OPEN_RANK_BID"></Switch>
      <span>开启冲榜</span>
    </span>
    <h1 class="text-5 font-bold mt-5">
      Current Epoch: {{ currentEpochId }} -> {{ countDownDisplay(toCurrenEpochEnd) }}. Max Bid:
      {{ NumberFormat(currentEpochMaxBid) }}

      <Button @click="init">刷新</Button>
    </h1>

    <Textarea :value="logs.join('')" :auto-size="{ minRows: 20, maxRows: 40 }"></Textarea>
  </div>
</template>

<script lang="ts" setup>
  import AchieveSound from '@/assets/sounds/achive.mp3';
  import { BID_FEE } from '@/config';
  import useContract from '@/hooks/useContract';
  import useGraphQL from '@/hooks/useGraphQL';
  import useLand from '@/hooks/useLand';
  import useLandGraphQL from '@/hooks/useLandGraphQL';
  import { NumberFormat, PriceWithDecimal, RandomNumberInRange, copy, sleep } from '@/utils/index';
  import { Button, Input, Switch, Textarea, message } from 'ant-design-vue';
  import BigNumber from 'bignumber.js';
  import dayjs from 'dayjs';
  import numeral from 'numeral';
  const audio = new Audio(AchieveSound);
  audio.volume = 0.5;

  const { getBalance, getAPTSBalance } = useContract();
  const { getLiveEpochId, bidOnAPTS, getAPTSForPurchase } = useLand();
  const { getLandEpochInfo, getEpochMaxBid, getToolWallet, getToolTopWallet } = useLandGraphQL();
  const { getValidNFTs } = useGraphQL();
  const timestamp = useTimestamp({ offset: 0 });

  const network = import.meta.env.VITE_APP_NETWORK;
  const logs = ref<string[]>([]);
  const silent = ref<boolean>(false);

  const playAudio = () => {
    if (silent.value) {
      return;
    }
    audio.play();
  };

  const basicInfoOfAccount = async (type: string) => {
    const accountList = type === 'first' ? firstBidAccountList.value : topBidAccountList.value;
    if (accountList?.length === 0) {
      return;
    }

    accountList.forEach(async (account: any, index: number) => {
      try {
        const balance = await getBalance(account.address);
        accountList[index].balance = balance;
      } catch {}

      try {
        const aptsBalance = await getAPTSBalance(account.address);
        accountList[index].aptsBalance = aptsBalance;
      } catch {}
    });
    message.success('更新 Balance 成功');
  };

  const addLogHanlder = (msg: string) => {
    logs.value.unshift(`${msg}. \t ${dayjs().format('YYYY-MM-DD HH:mm:ss')}\r`);
    logs.value = [...logs.value];
  };

  const currentEpochId = ref<number>(0);
  const currentEpochInfo = ref<any>({});
  const currentEpochMaxBid = ref<number>(0);
  const epochDuration = 60 * 10;

  // const tempEneTime = Math.floor(dayjs().add(10, 's').valueOf() / 1e3);
  const toCurrenEpochEnd = computed(() => {
    const startTimeObj = currentEpochInfo.value?.startTime;
    if (!startTimeObj) {
      return '-';
    }

    const startTime: any = Math.floor(dayjs(startTimeObj)?.valueOf() / 1e3);
    const ts = Math.floor(timestamp.value / 1e3);
    const endTime = new BigNumber(startTime).plus(epochDuration).toNumber();

    if (endTime < ts) {
      return '-';
    }

    return endTime - ts;
  });

  const countDownDisplay = (value: number | string) => {
    return numeral(value || 0).format('00:00:00:00');
  };

  const FIRST_BID_TIME = ref(550);
  const RANK_BID_TIME = ref(30);

  const OPEN_FIRST_BID = ref(false);
  const OPEN_RANK_BID = ref(false);

  const countdownContinue = ref(true);
  let cid: any = null;

  const countdownTrigger = () => {
    console.log(toCurrenEpochEnd.value);

    if (toCurrenEpochEnd.value == '-') {
      setTimeout(() => {
        init();
      }, 10e3);
      return;
    }

    if (BigNumber(toCurrenEpochEnd.value).isLessThanOrEqualTo(0)) {
      init();
      return;
    } else if (toCurrenEpochEnd.value == RANK_BID_TIME.value) {
      autoBid();
    } else if (toCurrenEpochEnd.value == FIRST_BID_TIME.value) {
      goFirstBid();
    }

    if (cid) {
      clearTimeout(cid);
    }
    cid = setTimeout(() => {
      countdownTrigger();
      return;
    }, 1e3);
  };

  const landToolID = ref('17e5277d-dd62-4ad2-aea6-09e2e4a029be');
  const firstBidAccountList = ref<any[]>([]);
  const topBidAccountList = ref<any[]>([]);

  const init = async () => {
    countdownContinue.value = true;
    currentEpochId.value = await getLiveEpochId();

    const firstBidAccount: any = await getToolWallet(landToolID.value);
    firstBidAccountList.value = firstBidAccount?.data?.getToolWallet || [];
    basicInfoOfAccount('first');

    const topBidAccount: any = await getToolTopWallet(currentEpochId.value, landToolID.value);
    topBidAccountList.value = topBidAccount?.data?.getToolTopWallet || [];
    basicInfoOfAccount('top');

    const result: any = await getLandEpochInfo(currentEpochId.value);
    currentEpochInfo.value = result?.data?.getLandEpochInfo;

    const maxBidResult: any = await getEpochMaxBid(currentEpochId.value);
    currentEpochMaxBid.value = maxBidResult.data.getMaxBid || 0;

    countdownTrigger();
  };

  // const topNReplacementCount = ref(5);

  const shock = 3000;
  const autoBid = async () => {
    if (!OPEN_RANK_BID.value) return;

    if (topBidAccountList.value.length === 0) {
      addLogHanlder('账户列表为空, 未自动执行 Bid');
      return;
    }

    topBidAccountList.value.forEach(async (account: any) => {
      try {
        const amount: number = new BigNumber(currentEpochMaxBid.value)
          .plus(BID_FEE)
          .plus(RandomNumberInRange(10, 1000))
          .toNumber();

        await getAPTSForPurchase({
          account,
          amount,
        });

        addLogHanlder(
          `${account.address} get ${NumberFormat(amount)} APTS, includes BID_FEES: ${BID_FEE}`,
        );

        await sleep(shock);

        const object_ids: any = await getValidNFTs({
          owner: account.address,
          tokenName: 'APTS',
          amount,
        });

        if (object_ids.length === 0) {
          addLogHanlder(`${account.address}\t 无可用 APTS`);
          return;
        }

        addLogHanlder(
          `Epoch: ${currentEpochId.value} TOP N BID: ${
            account.address
          } try to bid by ${NumberFormat(amount)} APTS, includes BID_FEES: ${BID_FEE}`,
        );

        // through gas payment
        const result: any = await bidOnAPTS({
          account,
          epochId: Number(currentEpochId.value),
          amount,
          object_ids,
        });

        addLogHanlder(
          `------------ \n Epoch: ${currentEpochId.value} TOP N BID: \n ${
            result.address
          } Bidded By ${NumberFormat(amount)} APTS, includes BID_FEES: ${BID_FEE}. \n\t Txn: ${
            result?.transactionHash
          } \n ------------ `,
        );
      } catch (e: any) {
        console.log(e);
        addLogHanlder(`${account.address} \t ${e.message}`);
      }
    });

    playAudio();
  };

  const goFirstBid = async () => {
    if (!OPEN_FIRST_BID.value) return;

    if (firstBidAccountList.value.length === 0) {
      addLogHanlder('冲人数账户列表为空, 未自动执行 Bid');
      return;
    }

    firstBidAccountList.value.forEach(async (account: any) => {
      try {
        const amount: number = new BigNumber(100).plus(RandomNumberInRange(1, 10)).toNumber();

        await getAPTSForPurchase({
          account,
          amount,
        });

        addLogHanlder(
          `${account.address} get ${NumberFormat(amount)} APTS, includes BID_FEES: ${BID_FEE}`,
        );

        await sleep(shock);

        const object_ids: any = await getValidNFTs({
          owner: account.address,
          tokenName: 'APTS',
          amount,
        });

        if (object_ids.length === 0) {
          addLogHanlder(`${account.address}\t 无可用 APTS`);
          return;
        }

        addLogHanlder(
          `Epoch: ${currentEpochId.value} FIRST BID: ${
            account.address
          } try to bid by ${NumberFormat(amount)} APTS, includes BID_FEES: ${BID_FEE}`,
        );

        const result: any = await bidOnAPTS({
          account,
          epochId: Number(currentEpochId.value),
          amount,
          object_ids,
        });

        addLogHanlder(
          `------------ \n Epoch: ${currentEpochId.value} FIRST BID: \n ${
            result.address
          } Bidded By ${NumberFormat(amount)} APTS, includes BID_FEES: ${BID_FEE}. \n\t Txn: ${
            result?.transactionHash
          } \n ------------ `,
        );
      } catch (e: any) {
        console.log(e);
        addLogHanlder(`${account.address} \t ${e.message}`);
      }
    });

    playAudio();
  };
</script>

<route lang="yaml">
meta:
  layout: default
</route>

