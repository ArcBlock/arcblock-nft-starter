import React from 'react';
import PropTypes from 'prop-types';
import BaseLayout from '@arcblock/ux/lib/Layout';

import env from '../libs/env';

export default function Layout({ title, children, contentOnly }) {
  const getExplorerUrl = chainHost => {
    const [host] = chainHost.split('/api');
    return `${host}/node/explorer/txs`;
  };

  const links = [
    { url: '/', title: 'Home' },
    { url: '/profile', title: 'Profile' },
    { url: '/orders', title: 'Orders' },
  ];

  if (env.chainHost) {
    links.push({ url: getExplorerUrl(env.chainHost, 'local'), title: 'Local Chain' });
  }
  if (env.assetChainHost) {
    links.push({ url: getExplorerUrl(env.assetChainHost, 'foreign'), title: 'Foreign Chain' });
  }
  links.push({ url: 'https://github.com/ArcBlock/wallet-playground', title: 'GitHub' });

  return (
    <BaseLayout title={title} brand={env.appName} links={links} contentOnly={contentOnly} baseUrl={env.baseUrl}>
      {children}
    </BaseLayout>
  );
}

Layout.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.any.isRequired,
  contentOnly: PropTypes.bool,
};

Layout.defaultProps = {
  contentOnly: false,
};
