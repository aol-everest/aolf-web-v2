import googleTagManager from '@analytics/google-tag-manager';
import onRouteChange from '@analytics/router-utils';
import segmentPlugin from '@analytics/segment';
import Analytics from 'analytics';
import clevertapPlugin from './clevertapPlugin';

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
  ];
}
if (process.env.NEXT_PUBLIC_CLEVERTAP_ACCOUNT_ID) {
  plugins = [...plugins, clevertapPlugin()];
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
