module.exports = {
  chainId: process.env.REACT_APP_CHAIN_ID || process.env.GATSBY_CHAIN_ID || process.env.CHAIN_ID || process.env.chainId,
  chainHost:
    process.env.REACT_APP_CHAIN_HOST
    || process.env.GATSBY_CHAIN_HOST
    || process.env.CHAIN_HOST
    || process.env.chainHost,
  chainHostZh:
    process.env.REACT_APP_CHAIN_HOST_ZH
    || process.env.GATSBY_CHAIN_HOST_ZH
    || process.env.CHAIN_HOST_ZH
    || process.env.chainHostZh,
  assetChainId:
    process.env.REACT_APP_ASSET_CHAIN_ID
    || process.env.GATSBY_ASSET_CHAIN_ID
    || process.env.ASSET_CHAIN_ID
    || process.env.assetChainId,
  assetChainHost:
    process.env.REACT_APP_ASSET_CHAIN_HOST
    || process.env.GATSBY_ASSET_CHAIN_HOST
    || process.env.ASSET_CHAIN_HOST
    || process.env.assetChainHost,
  assetChainHostZh:
    process.env.REACT_APP_ASSET_CHAIN_HOST_ZH
    || process.env.GATSBY_ASSET_CHAIN_HOST_ZH
    || process.env.ASSET_CHAIN_HOST_ZH
    || process.env.assetChainHostZh,
  appId: process.env.REACT_APP_APP_ID || process.env.GATSBY_APP_ID || process.env.APP_ID || process.env.appId,
  appName: process.env.REACT_APP_APP_NAME || process.env.GATSBY_APP_NAME || process.env.APP_NAME || process.env.appName,
  appLink: process.env.REACT_APP_APP_LINK || process.env.GATSBY_APP_LINK || process.env.APP_LINK || process.env.appLink,
  appDescription:
    process.env.REACT_APP_APP_DESCRIPTION
    || process.env.GATSBY_APP_DESCRIPTION
    || process.env.APP_DESCRIPTION
    || process.env.appDescription,
  baseUrl: process.env.REACT_APP_BASE_URL || process.env.GATSBY_BASE_URL || process.env.BASE_URL || process.env.baeUrl,
  apiPrefix:
    process.env.REACT_APP_API_PREFIX
    || process.env.GATSBY_API_PREFIX
    || process.env.FN_API_PREFIX
    || process.env.API_PREFIX
    || process.env.apiPrefix,
};
