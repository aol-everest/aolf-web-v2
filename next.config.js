const withPlugins = require("next-compose-plugins");
const { withSentryConfig } = require("@sentry/nextjs");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
// const withPWA = require("next-pwa");
// const runtimeCaching = require("next-pwa/cache");

const SentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore
  // org: "aolf",
  // project: "member-web-app",
  // authToken: process.env.SENTRY_AUTH_TOKEN,

  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Cache-Control",
    value: "no-cache",
  },
];

module.exports = withPlugins(
  [
    // withPWA,
    // {
    //   pwa: {
    //     dest: "public",
    //     disable: true,
    //     runtimeCaching,
    //     buildExcludes: [
    //       /middleware-manifest\.json$/,
    //       /_middleware.js$/,
    //       /_middleware.js.map$/,
    //     ],
    //   },
    // },
    withBundleAnalyzer,
    withSentryConfig,
    SentryWebpackPluginOptions,
  ],
  {
    swcMinify: true,
    // basePath: "/us-en",
    // assetPrefix: "/us-en/",
    productionBrowserSourceMaps: true,
    images: {
      domains: ["images.ctfassets.net"],
    },

    async redirects() {
      return [
        {
          source: "/",
          destination: "/us-en/course",
          permanent: true,
        },
        {
          source: "/us-en",
          destination: "/us-en/course",
          permanent: true,
        },
      ];
    },
    async headers() {
      return [
        {
          // Apply these headers to all routes in your application.
          source: "/(.*)",
          headers: securityHeaders,
        },
        {
          source: "/:all*(svg|jpg|png)",
          locale: false,
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=800 must-revalidate",
            },
          ],
        },
      ];
    },
  },
);

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
// module.exports = withSentryConfig(moduleExports, SentryWebpackPluginOptions);
