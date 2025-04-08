/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl:
    process.env.NEXT_PUBLIC_BASE_URL || 'https://members.artofliving.org',
  generateRobotsTxt: true,
  exclude: [
    '/private*',
    '/admin*',
    '/profile*',
    '/dashboard*',
    '/verify*',
    '/corporate-email-verify*',
    '/widget*',
    '/backend*',
    '/journey*',
    '/policy*',
    '/api*',
    '/500',
    '/404',
    '/_offline',
    '/unauthorized',
    '/__devonly*',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/private/',
          '/admin/',
          '/profile/',
          '/dashboard/',
          '/verify/',
          '/corporate-email-verify/',
          '/widget/',
          '/backend/',
          '/journey/',
          '/policy/',
          '/api/',
          '/_next/',
        ],
      },
    ],
    additionalSitemaps: [
      // Add any additional dynamic sitemaps here
      `${process.env.NEXT_PUBLIC_BASE_URL}/server-sitemap.xml`,
    ],
  },
  // Transform the URLs to match your structure
  transform: async (config, path) => {
    // Basic path transformations
    const url = new URL(path, config.siteUrl);

    // Add priority based on path depth
    const priority =
      path === '/'
        ? 1.0
        : path.startsWith('/us-en/courses/') ||
            path.startsWith('/us-en/events/')
          ? 0.9
          : path.split('/').length === 2
            ? 0.8
            : 0.7;

    // Add changefreq based on content type
    const changefreq =
      path === '/'
        ? 'daily'
        : path.includes('/events/')
          ? 'daily'
          : path.includes('/courses/')
            ? 'weekly'
            : 'monthly';

    return {
      loc: url.href,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
      // Add alternateRefs if you have multiple languages
      // alternateRefs: [
      //   {
      //     href: `${config.siteUrl}/es${path}`,
      //     hreflang: 'es',
      //   },
      // ],
    };
  },
};
