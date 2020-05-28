/* eslint-disable no-console */
import ForgeSDK from '@arcblock/forge-sdk/lite';
import env from './env';

if (!env.chainHost) {
  throw new Error('chainHost is required to start this application, please set `CHAIN_HOST` in `.env` file');
}

ForgeSDK.connect(env.chainHost, { chainId: env.chainId, name: env.chainId });
console.log(`connected to app chain: ${env.chainHost}`);
if (env.assetChainHost) {
  ForgeSDK.connect(env.assetChainHost, { chainId: env.assetChainId, name: env.assetChainId });
  console.log(`connected to asset chain: ${env.assetChainHost}`);
}

export default ForgeSDK;
