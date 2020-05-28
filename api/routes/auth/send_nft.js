/* eslint-disable object-curly-newline */
/* eslint-disable no-console */
const { toTypeInfo } = require('@arcblock/did');
const ForgeSDK = require('@arcblock/forge-sdk');
const { ensureAsset } = require('../../libs/util');
const { wallet, localFactory } = require('../../libs/auth');

const transferAsset = async ({ claim, userDid, userPk }) => {
  try {
    const type = toTypeInfo(userDid);
    const user = ForgeSDK.Wallet.fromPublicKey(userPk, type);
    if (user.verify(claim.origin, claim.sig) === false) {
      throw new Error('签名错误');
    }
    const appWallet = ForgeSDK.Wallet.fromJSON(wallet);
    const asset = JSON.parse(ForgeSDK.Util.fromBase58(claim.origin));
    const hash = await ForgeSDK.sendTransferTx({
      tx: {
        itx: {
          to: userDid,
          assets: [asset],
        },
      },
      wallet: appWallet,
    });
    return { hash, tx: claim.origin };
  } catch (err) {
    console.log(err);
    throw new Error('购票失败', err.message);
  }
};

module.exports = {
  action: 'exchange_assets',
  claims: {
    signature: async ({ userPk, userDid, extraParams: { locale = 'en', isCustom = false } }) => {
      console.log(locale); // 可以获取到前端传过来的多语言环境，用来做一些国际化操作
      try {
        let asset;
        if (isCustom) {
          asset = await ensureAsset(localFactory, {
            userPk,
            userDid,
            type: 'badge',
            vcType: 'CustomBadgeType', // 这个 type 会被包含在 nft 链上数据结构中，可以用此 type 做一些自定义的业务
            name: '定义样式 NFT 徽章',
            description: '这是一张自定义样式的 NFT 徽章',
            logoUrl: 'https://releases.arcblockio.cn/arcblock-logo.png',
            startTime: new Date(),
            endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
            location: 'BeiJing',
          });
        } else {
          asset = await ensureAsset(localFactory, {
            userPk,
            userDid,
            type: 'ticket',
            vcType: 'CustomTicketType', // 这个 type 会被包含在 nft 链上数据结构中，可以用此 type 做一些自定义的业务
            name: 'NFT 测试门票',
            description: '这是一张用来做 NFT 测试的门票',
            logoUrl: 'https://releases.arcblockio.cn/arcblock-logo.png',
            startTime: new Date(),
            endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
            location: 'BeiJing',
          });
        }
        return {
          description: isCustom
            ? '签名该文本，你将获得自定义样式的徽章'
            : '签名该文本，你将获得一张测试门票',
          data: JSON.stringify(asset.address),
          type: 'mime:text/plain',
          display: JSON.stringify(asset.data.value.credentialSubject.display),
        };
      } catch (error) {
        console.log(error);
        throw new Error(`购票失败: ${error.message}`);
      }
    },
  },
  onAuth: async ({ claims, userDid, userPk, extraParams: { locale = 'en' } }) => {
    console.log(locale); // 可以获取到前端传过来的多语言环境，用来做一些国际化操作
    try {
      const claim = claims.find((x) => x.type === 'signature');
      const tx = await transferAsset({ claim, userDid, userPk });
      return tx;
    } catch (err) {
      console.log(err);
      throw new Error(`购票失败 ${err.message}`);
    }
  },
};
