/* eslint-disable object-curly-newline */
const ForgeSDK = require('@arcblock/forge-sdk');
const { AssetRecipient, AssetIssuer } = require('@arcblock/asset-factory');

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
  { userPk, userDid, type, name, description, backgroundUrl, logoUrl, startTime, endTime, location = 'China' }
) => {
  const methods = {
    badge: factory.createBadge.bind(factory),
    ticket: factory.createTicket.bind(factory),
    certificate: factory.createCertificate.bind(factory),
  };

  const [asset, hash] = await methods[type]({
    backgroundUrl,
    data: {
      name,
      description,
      reason: description,
      logoUrl,
      location,
      issueTime: Date.now(),
      startTime,
      endTime,
      expireTime: -1,
      host: new AssetIssuer({
        // Only for tickets?
        wallet: ForgeSDK.Wallet.fromJSON(wallet),
        name: wallet.address,
      }),
      recipient: new AssetRecipient({
        wallet: ForgeSDK.Wallet.fromPublicKey(userPk),
        name: userDid,
        location: 'China, Beijing',
      }),
    },
  });

  // eslint-disable-next-line no-console
  console.log('ensureAsset', {
    userPk,
    userDid,
    type,
    name,
    description,
    backgroundUrl,
    logoUrl,
    location,
    asset,
    hash,
  });

  return asset;
};

module.exports = {
  getTransferrableAssets,
  getTokenInfo,
  getAccountStateOptions,
  ensureAsset,
};
