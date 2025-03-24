import { orgConfig } from '@org';

const RobotsTxt = () => {};

export const getServerSideProps = async ({ res }) => {
  const content = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

# Disallow private and admin routes
Disallow: /private/
Disallow: /admin/
Disallow: /profile/
Disallow: /dashboard/
Disallow: /api/
Disallow: /_next/

# Host
Host: ${orgConfig.seo.url}

# Sitemaps
Sitemap: ${orgConfig.seo.url}/sitemap.xml

# Crawl-delay
Crawl-delay: 10`;

  res.setHeader('Content-Type', 'text/plain');
  // Cache for 24 hours
  res.setHeader(
    'Cache-Control',
    'public, max-age=86400, stale-while-revalidate=43200',
  );
  res.write(content);
  res.end();

  return {
    props: {},
  };
};

export default RobotsTxt;
