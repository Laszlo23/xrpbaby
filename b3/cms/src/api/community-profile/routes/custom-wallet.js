'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/community-profiles/wallet/nonce',
      handler: 'community-profile.walletNonce',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/community-profiles/wallet/verify',
      handler: 'community-profile.walletVerify',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/community-profiles/my-profile',
      handler: 'community-profile.me',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/community-profiles/my-profile',
      handler: 'community-profile.createMine',
      config: {
        auth: false,
      },
    },
    {
      method: 'PUT',
      path: '/community-profiles/my-profile',
      handler: 'community-profile.saveMine',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/community-profiles/my-profile/link-wallet',
      handler: 'community-profile.linkWallet',
      config: {
        auth: false,
      },
    },
  ],
};
