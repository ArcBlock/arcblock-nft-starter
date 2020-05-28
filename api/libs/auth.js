/* eslint-disable no-console */
const Mcrypto = require('@arcblock/mcrypto');
const ForgeSDK = require('@arcblock/forge-sdk');
const TokenMongoStorage = require('@arcblock/did-auth-storage-mongo');
const AgentMongoStorage = require('@arcblock/did-agent-storage-mongo');
const SwapMongoStorage = require('@arcblock/swap-storage-mongo');
const { AssetFactory } = require('@arcblock/asset-factory');
const { fromSecretKey, fromJSON, WalletType } = require('@arcblock/forge-wallet');
const {
  WalletAuthenticator,
  AgentAuthenticator,
  WalletHandlers,
  SwapHandlers,
  AgentWalletHandlers,
} = require('@arcblock/did-auth');
const env = require('./env');

const type = WalletType({
  role: Mcrypto.types.RoleType.ROLE_APPLICATION,
  pk: Mcrypto.types.KeyType.ED25519,
  hash: Mcrypto.types.HashType.SHA3,
});

if (env.chainHost) {
  ForgeSDK.connect(env.chainHost, { chainId: env.chainId, name: env.chainId, default: true });
  console.log('Connected to chainHost', env.chainHost);
  if (env.assetChainHost) {
    ForgeSDK.connect(env.assetChainHost, { chainId: env.assetChainId, name: env.assetChainId });
    console.log('Connected to assetChainHost', env.assetChainHost);
  }
}

const wallet = fromSecretKey(process.env.APP_SK, type).toJSON();
const isRestricted = process.env.APP_RESTRICTED_DECLARE && JSON.parse(process.env.APP_RESTRICTED_DECLARE);
const isNetlify = process.env.NETLIFY && JSON.parse(process.env.NETLIFY);

let icon = 'https://releases.arcblockio.cn/playground.png';
if (process.env.STAGING && JSON.parse(process.env.STAGING)) {
  icon = 'https://releases.arcblockio.cn/playground-staging.png';
}
const walletAuth = new WalletAuthenticator({
  wallet,
  baseUrl: isNetlify ? env.baseUrl.replace('/.netlify/functions/app', '') : env.baseUrl,
  appInfo: {
    name: env.appName,
    description: env.appDescription,
    icon,
    link: env.baseUrl,
  },
  chainInfo: ({ locale }) => {
    if (locale === 'zh' && env.chainHostZh) {
      return {
        host: env.chainHostZh,
        id: env.chainId,
        restrictedDeclare: isRestricted,
      };
    }

    return {
      host: env.chainHost,
      id: env.chainId,
      restrictedDeclare: isRestricted,
    };
  },
});

const agentAuth = new AgentAuthenticator({
  wallet,
  baseUrl: env.baseUrl,
  appInfo: {
    name: 'Agent Service',
    description: 'This is a demo agent service that can do did-auth on be-half-of another application',
    icon: 'https://releases.arcblock.io/agent.png',
    link: env.baseUrl,
  },
  chainInfo: {
    host: env.chainHost,
    id: env.chainId,
    restrictedDeclare: isRestricted,
  },
});

const tokenStorage = new TokenMongoStorage({ url: process.env.MONGO_URI });
const swapStorage = new SwapMongoStorage({ url: process.env.MONGO_URI });
const agentStorage = new AgentMongoStorage({ url: process.env.MONGO_URI });

const walletHandlers = new WalletHandlers({
  authenticator: walletAuth,
  tokenStorage,
});

const swapHandlers = new SwapHandlers({
  authenticator: walletAuth,
  tokenStorage,
  swapStorage,
  swapContext: {
    offerChainId: env.chainId,
    offerChainHost: env.chainHost,
    demandChainId: env.assetChainId,
    demandChainHost: env.assetChainHost,
  },
  options: {
    swapKey: 'tid',
  },
});

const agentHandlers = new AgentWalletHandlers({
  authenticator: agentAuth,
  tokenStorage,
  agentStorage,
});

const localFactory = new AssetFactory({
  chainId: env.chainId,
  chainHost: env.chainHost,
  wallet: fromJSON(wallet),
  issuer: {
    name: 'ArcBlock',
    url: 'https://www.arcblock.io',
    logo: 'https://releases.arcblockio.cn/arcblock-logo.png',
  },
});

const foreignFactory = new AssetFactory({
  chainId: env.assetChainId,
  chainHost: env.assetChainHost,
  wallet: fromJSON(wallet),
  issuer: {
    name: 'ArcBlock',
    url: 'https://www.arcblock.io',
    logo: 'https://releases.arcblockio.cn/arcblock-logo.png',
  },
});

module.exports = {
  tokenStorage,
  swapStorage,
  agentStorage,

  walletHandlers,
  swapHandlers,
  agentHandlers,

  wallet,
  localFactory,
  foreignFactory,
};
