/* eslint-disable object-curly-newline */
/* eslint-disable no-console */
const ForgeSDK = require('@arcblock/forge-sdk');
const { ensureAsset } = require('../../libs/util');
const env = require('../../libs/env');
const { wallet, localFactory, swapStorage } = require('../../libs/auth');

const chains = {
  local: {
    host: env.chainHost,
    id: env.chainId,
  },
  foreign: {
    host: env.assetChainHost,
    id: env.assetChainId,
  },
};

module.exports = {
  action: 'swap_asset',
  claims: {
    swap: async ({ userDid, userPk, extraParams: { tid, price, locale = 'en' } }) => {
      console.log(locale); // 可以获取到前端传过来的多语言环境，用来做一些国际化操作
      if (Number(price) <= 0) {
        throw new Error('没有有效的价格，无法完成购买');
      }
      try {
        const offerChain = chains.local;
        const demandChain = chains.foreign;
        const asset = await ensureAsset(localFactory, {
          userPk,
          userDid,
          type: 'ticket',
          vcType: 'CustomTicketType', // 这个 type 会被包含在 nft 链上数据结构中，可以用此 type 做一些自定义的业务
          name: 'NFT 测试门票',
          description: '这是一张用来做 NFT 测试的门票，通过 Atomic Swap 获取',
          logoUrl: 'https://releases.arcblockio.cn/arcblock-logo.png',
          startTime: new Date(),
          endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
          location: 'BeiJing',
        });
        const payload = {
          offerChainId: offerChain.id,
          offerChainHost: offerChain.host,
          offerAssets: [asset.address],
          offerToken: (await ForgeSDK.fromTokenToUnit(0, { conn: offerChain.id })).toString(),
          offerUserAddress: wallet.address, // 卖家地址

          demandChainId: demandChain.id,
          demandChainHost: demandChain.host,
          demandAssets: [],
          demandToken: (await ForgeSDK.fromTokenToUnit(price, { conn: demandChain.id })).toString(),
          demandUserAddress: userDid, // 买家地址
          demandLocktime: await ForgeSDK.toLocktime(600, { conn: demandChain.id }),
        };
        await swapStorage.finalize(tid, payload);
        const swap = await swapStorage.read(tid);
        return {
          swapId: tid,
          receiver: wallet.address,
          ...swap,
        };
      } catch (err) {
        console.log(err);
        throw new Error('购票失败');
      }
    },
  },
  onAuth: async () => {},
};
