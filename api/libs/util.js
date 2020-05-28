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
  const { assets } = await ForgeSDK.listAssets({ ownerAddress: userDid, paging: { size: 200 } }, { conn: chainId });
  if (!assets || assets.length === 0) {
    throw new Error('You do not have any asset, use other test to earn one');
  }

  const goodAssets = assets.filter(x => x.transferrable);
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
  const display = createZippedSvgDisplay(
    type === 'ticket' ? createTicketSvg({ data }) : createCertSvg({ data })
  );
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
