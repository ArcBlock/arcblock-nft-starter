/* eslint-disable object-curly-newline */
const ForgeSDK = require('@arcblock/forge-sdk');
const {
  createZippedSvgDisplay,
  createCertSvg,
  createTicketSvg,
} = require('@arcblock/nft-template');
const { NFTRecipient, NFTIssuer } = require('@arcblock/nft');
const { fromJSON } = require('@arcblock/forge-wallet');

const env = require('./env');
const { wallet } = require('./auth');

const getTransferrableAssets = async (userDid, assetCount, chainId) => {
  const { assets } = await ForgeSDK.listAssets(
    { ownerAddress: userDid, paging: { size: 200 } },
    { conn: chainId }
  );
  if (!assets || assets.length === 0) {
    throw new Error('You do not have any asset, use other test to earn one');
  }

  const goodAssets = assets.filter((x) => x.transferrable);
  if (!goodAssets.length) {
    throw new Error('You do not have any asset that can be transferred to me');
  }

  if (assetCount && assetCount < 5 && goodAssets.length < assetCount) {
    throw new Error('You do not have enough assets that can be transferred to me');
  }

  return goodAssets.slice(0, assetCount);
};

const getTokenInfo = async () => {
  const { getForgeState: data } = await ForgeSDK.doRawQuery(
    `{
      getForgeState {
        code
        state {
          token {
            decimal
            symbol
          }
        }
      }
    }`,
    { conn: env.chainId }
  );

  const { getForgeState: data2 } = await ForgeSDK.doRawQuery(
    `{
      getForgeState {
        code
        state {
          token {
            decimal
            symbol
          }
        }
      }
    }`,
    { conn: env.assetChainId }
  );

  return {
    [env.chainId]: data.state.token,
    [env.assetChainId]: data2.state.token,
    local: data.state.token,
    foreign: data2.state.token,
  };
};

const getAccountStateOptions = { ignoreFields: [/\.withdrawItems/, /\.items/] };

const ensureAsset = async (
  factory,
  {
    userPk,
    userDid,
    type,
    name,
    description,
    backgroundUrl,
    logoUrl,
    startTime,
    endTime,
    location = 'China',
    vcType = '',
  }
) => {
  const methods = {
    badge: factory.createBadge.bind(factory),
    ticket: factory.createTicket.bind(factory),
    certificate: factory.createCertificate.bind(factory),
  };
  const data = {
    name,
    description,
    reason: description,
    logoUrl,
    location,
    type: vcType,
    issueTime: Date.now(),
    startTime,
    endTime,
    expireTime: Date.now() + 365 * 3600,
    host: new NFTIssuer({
      wallet: fromJSON(wallet),
      name: 'ArcBlock DevCon2020',
    }),
    recipient: new NFTRecipient({
      wallet: ForgeSDK.Wallet.fromPublicKey(userPk),
      name: userDid,
      location: 'China, Beijing',
    }),
  };
  let display;
  if (type === 'badge') {
    // 这个 display 是 svg 文件做了 gzip 之后再做一个 toBase64 之后得到的结果，自定义样式都可以这么进行
    // 最终得到这个 display 属性赋予 NFT 写到链上
    display =
      'H4sIAAAAAAAA/41WTW8bNxD9K8T2yqWWHA4/UkmAm4sP7qlADr1tVh8WoFhGtLBiFP3vfcOlHEFRncD2YHc4fO9xODPr+fFlq7592T8dF83jOD5/mM1Op5M5kTl83c5c13UzRDTqZbc+/XH4tmg61aksv81yvlpvjsv5cXzdr5dm2B9b+89mt99/+G0d/EDD7/8Wp6tO7zyvYnVSddImx82mOn11Dh317nN18hlz2HQbW53hDZM2FKozVudmM4QO2+ezSdp8NgkddyPe1v12v24/96vtej6bXPOt2q0WzcVKc8PXukat+rFvn/ov6+vor+thVMO+PyKPJRONQrKsNyE06nXR+GAYvtNuNT4umtCZkBv1uN5tH0eEBROa2XL+3I+PlyBCuGj+jGwc6YLQp2CcLqYrP9443zo2nLU1IU2mLLWGW2vcQ/AmaTY+32Et6GKmvYFMcJrvXTCU+qtV7LUJux6s1Tab6Pof8fFWxVwp0kXR3++cyTlDQRRYdxccrJ5sxfDGsk7exAjaqOVvWilPN3aEaIKf8G7S0kQbsvFTJu9igtWTnTAidNNDsIZxss4w3TtkgB9sgP9GvMMtTmDvUQIjUz0pox50MfWcLIDk9fUCRHTxneP4ih0kTyGZwAMujOTGY26dCdTSZPDKcpRSip/Y3fMe77gxQw9163sMiTX2oALJfypy7kumhc1KuQiZ9xo8vpDpQpZ4L6yuBUtBv24PLu3hyBCV9mCBfmsPqdbv3VGC/heDwB9vYNhosv9VEGS+C7dAkEn7I8jzYf+6PTxd4Twfdk8jXnHhISn0TPaK0CFROZRUUCQkCkVDThGgvJLzW0VILmLYIARdQfKYSFFnkpIChM24pRKBPZgViPYml9WcgaIuKH+uD7UF1kkfJ3R21ccsnkkfgyVUfVKWNOnjWMiLPs7GVX0YZ3TWF6gcoeiTKrai74Ly5/o8i4gclXeyC5PCyyMoAUBJ+U6ygft18JPoxPyEGz5kmBU6ErmdfFmE1dBobDxD4By5Ile2X9IVUfBOxHhSkYxL8gxPRAKyCIPIIA0twqJV6BWJZxUwwrMog63OLHJqcDRdOoNEw+kMXhlv9SdP/YkJ4tIgze4xknFQaUrObcIcjsdWOhKAEQEYW5Yg8B53y/QRhZ6shmRMazzHqFGHmO1MGlUY4l8+CaZLulDcnBGhakgyh7Hd8Us3dBoI+DY4nAAmcSvfHoLRxdTJ933Pu9DWpHQJ3Z6h20vopIspHwh9secmdHzLnNyHHQBiMc4YiI4xseSDKk8ZF3Hn5MtaTAVnjd5NsYdPjsdnVlc+eybyR9ygQ5Qkzngn37Koz2RF0Gxb//Cf1fI/2H3nfoEJAAA=';
  } else {
    display = createZippedSvgDisplay(
      type === 'ticket' ? createTicketSvg({ data }) : createCertSvg({ data })
    );
  }

  const [asset] = await methods[type]({
    display,
    backgroundUrl,
    data,
  });
  return asset;
};

module.exports = {
  getTransferrableAssets,
  getTokenInfo,
  getAccountStateOptions,
  ensureAsset,
};
