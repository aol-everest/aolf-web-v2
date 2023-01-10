import Analytics from "analytics";
import awsPinpointPlugin from "@analytics/aws-pinpoint";
import segmentPlugin from "@analytics/segment";
import googleTagManager from "@analytics/google-tag-manager";
import onRouteChange from "@analytics/router-utils";
import { Auth } from "@aws-amplify/auth";

export const analytics = Analytics({
  app: "AOLF-Members-App",
  debug: true,
  plugins: [
    segmentPlugin({
      writeKey: process.env.NEXT_PUBLIC_ANALYTICS_WRITE_KEY,
      enabled: !!process.env.NEXT_PUBLIC_ANALYTICS_WRITE_KEY,
    }),
    googleTagManager({
      containerId: process.env.NEXT_PUBLIC_GTM_ID,
    }),
  ],
});

onRouteChange((newRoutePath) => {
  console.log("new route path", newRoutePath);
  // trigger page view
  analytics.page();
});
