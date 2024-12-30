import googleTagManager from './googleTagManagerPlugin';
import onRouteChange from '@analytics/router-utils';
import segmentPlugin from '@analytics/segment';
import Analytics from 'analytics';
import gtmEcommercePlugin from './gtmEcommercePlugin';

let plugins = [];

if (process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY) {
  plugins = [
    ...plugins,
    segmentPlugin({
      writeKey: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY,
    }),
  ];
}
if (process.env.NEXT_PUBLIC_GTM_ID) {
  plugins = [
    ...plugins,
    googleTagManager({
      containerId: process.env.NEXT_PUBLIC_GTM_ID,
    }),
    gtmEcommercePlugin(),
  ];
}

export const analytics = Analytics({
  app: 'AOLF-Members-App',
  debug: true,
  plugins,
});

onRouteChange((newRoutePath) => {
  // console.log("new route path", newRoutePath);
  // trigger page view
  analytics.page();
});
