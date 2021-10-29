const withPlugins = require("next-compose-plugins");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
const { withSentryConfig } = require("@sentry/nextjs");
const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
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
];
const moduleExports = withPlugins(
  [
    new FaviconsWebpackPlugin({
      logo: "./src/logo.png", // svg works too!
      mode: "webapp", // optional can be 'webapp', 'light' or 'auto' - 'auto' by default
      devMode: "webapp", // optional can be 'webapp' or 'light' - 'light' by default
      favicons: {
        appName: "Art of Living Journey",
        appShortName: "AOLF",
        appDescription: "Art of Living Journey",
        background: "#ffffff",
        theme_color: "#4B5487",
        developerName: "Me",
        dir: "auto", // Primary text direction for name, short_name, and description
        lang: "en-US",
        developerURL: null, // prevent retrieving from the nearest package.json
        icons: {
          coast: false,
          yandex: false,
        },
      },
    }),
  ],
  {
    // basePath: "/us",
    // assetPrefix: "/us/",
    productionBrowserSourceMaps: true,
    async redirects() {
      return [
        {
          source: "/",
          destination: "/us",
          permanent: true,
        },
        {
          source: "/us/course",
          destination: "/us",
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
      ];
    },
  },
);

const SentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
module.exports = withSentryConfig(moduleExports, SentryWebpackPluginOptions);
