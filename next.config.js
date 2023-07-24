// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

const { withSentryConfig } = require("@sentry/nextjs");

const ContentSecurityPolicy = `
  frame-ancestors 'self' artofliving.org *.artofliving.org *.unbounce.com *.unbouncepreview.com;
`;

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: ContentSecurityPolicy.replace(/\s{2,}/g, " ").trim(),
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
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "strict-transport-security",
    value: "max-age=31536000; includeSubDomains",
  },
];

const moduleExports = {
  swcMinify: true,
  generateEtags: false,
  // basePath: "/us-en",
  // assetPrefix: "/us-en/",
  productionBrowserSourceMaps: true,
  images: {
    domains: ["images.ctfassets.net"],
  },
  sentry: {
    hideSourceMaps: true,
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
};

const sentryWebpackPluginOptions = {
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
module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions);
