const withPlugins = require("next-compose-plugins");
// const { withSentryConfig } = require("@sentry/nextjs");
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
  {
    key: "x-frame-options",
    value: "SAMEORIGIN",
  },
  {
    key: "x-content-type-options",
    value: "nosniff",
  },
  {
    key: "referrer-policy",
    value: "origin-when-cross-origin",
  },
  {
    key: "permissions-policy",
    value: "camera=(), geolocation=(self), microphone=(self), autoplay=(self)",
  },
  {
    key: "strict-transport-security",
    value: "max-age=31536000; includeSubDomains",
  },
  {
    key: "cache-control",
    value: "no-cache, no-store, must-revalidate",
  },
];

module.exports = withPlugins([withBundleAnalyzer], {
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
            key: "cache-control",
            value: "public, max-age=800 must-revalidate",
          },
        ],
      },
    ];
  },
});

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
// module.exports = withSentryConfig(moduleExports, SentryWebpackPluginOptions);
