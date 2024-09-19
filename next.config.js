// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

const { withSentryConfig } = require('@sentry/nextjs');

const ContentSecurityPolicy = `
  default-src * data: mediastream: blob: filesystem: about: ws: wss: 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-inline';
  frame-ancestors 'self' artofliving.org *.artofliving.org *.unbounce.com *.unbouncepreview.com;
  style-src 'self' 'unsafe-inline' *.googleapis.com cdn.jsdelivr.net;
  font-src 'self' data: *.gstatic.com *.googleapis.com;
`;

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
  },
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin-allow-popups', // "same-origin-allow-popups"
  },
  {
    key: 'x-content-type-options',
    value: 'nosniff',
  },
  {
    key: 'referrer-policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'permissions-policy',
    value: 'camera=(), geolocation=(self), microphone=(self), autoplay=(self)',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'strict-transport-security',
    value: 'max-age=31536000; includeSubDomains',
  },
];

const moduleExports = {
  swcMinify: true,
  generateEtags: false,
  // basePath: "/us-en",
  // assetPrefix: "/us-en/",
  productionBrowserSourceMaps: true,
  images: {
    domains: ['images.ctfassets.net'],
  },

  async redirects() {
    return [
      {
        source: '/',
        destination: '/us-en/courses',
        permanent: true,
      },
      {
        source: '/us-en',
        destination: '/us-en/courses',
        permanent: true,
      },
      {
        source: '/us-en/course',
        destination: '/us-en/courses',
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes in your application.
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/:all*(svg|jpg|png)',
        locale: false,
        headers: [
          {
            key: 'cache-control',
            value: 'public, max-age=800 must-revalidate',
          },
        ],
      },
    ];
  },
};

const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: 'aolf',
  project: 'member-web-app-new',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Transpiles SDK to be compatible with IE11 (increases bundle size)
  transpileClientSDK: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: '/monitoring',

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
};

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions);
