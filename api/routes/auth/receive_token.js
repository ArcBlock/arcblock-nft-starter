/* eslint-disable no-console */
const ForgeSDK = require('@arcblock/forge-sdk');
const { toTypeInfo } = require('@arcblock/did');
const { wallet } = require('../../libs/auth');
const { getTokenInfo } = require('../../libs/util');
const env = require('../../libs/env');

module.exports = {
  action: 'receive_token',
  authPrincipal: false,
  claims: [
    {
      authPrincipal: async ({ extraParams: { chain } }) => ({
        description: 'Please select the required DID',
        chainInfo: {
          host: chain === 'local' ? env.chainHost : env.assetChainHost,
          id: chain === 'local' ? env.chainId : env.assetChainId,
        },
      }),
    },
    {
      signature: async ({ userDid, extraParams: { locale, chain, amount } }) => {
        const token = await getTokenInfo();
        if (amount === 'random') {
          // eslint-disable-next-line no-param-reassign
          amount = (Math.random() * 10).toFixed(6);
        }

        if (!Number(amount)) {
          throw new Error('Invalid amount param for receive token playground action');
        }

        const description = {
          en: `Sign this text to get ${amount} ${token[chain].symbol} for test`,
          zh: `签名该文本，你将获得 ${amount} 个测试用的 ${token[chain].symbol}`,
        };

        return {
          description: description[locale],
          data: JSON.stringify({ amount, userDid }, null, 2),
          type: 'mime:text/plain',
          chainInfo: {
            host: chain === 'local' ? env.chainHost : env.assetChainHost,
            id: chain === 'local' ? env.chainId : env.assetChainId,
          },
        };
      },
    },
  ],

  // eslint-disable-next-line object-curly-newline
  onAuth: async ({ userDid, userPk, claims, extraParams: { chain } }) => {
    try {
      const type = toTypeInfo(userDid);
      const user = ForgeSDK.Wallet.fromPublicKey(userPk, type);
      const claim = claims.find(x => x.type === 'signature');

      if (user.verify(claim.origin, claim.sig) === false) {
        throw new Error('要求的消息签名不正确');
      }

      const app = ForgeSDK.Wallet.fromJSON(wallet);
      const data = JSON.parse(ForgeSDK.Util.fromBase58(claim.origin));
      const hash = await ForgeSDK.transfer(
        {
          to: data.userDid,
          token: data.amount,
          wallet: app,
        },
        { conn: chain === 'local' ? env.chainId : env.assetChainId }
      );
      console.log('receive_token.onAuth', hash, data);
      return { hash };
    } catch (err) {
      console.error('receive_token.onAuth.error', err);
      throw new Error(`Receive token failed ${err.message}`);
    }
  },
};
