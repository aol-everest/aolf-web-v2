const withPlugins = require("next-compose-plugins");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
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

module.exports = withPlugins(
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
    productionBrowserSourceMaps: true,
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
