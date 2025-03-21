import { orgConfig } from './src/organization-config';

export const getStructuredData = (org) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: org.title,
  url: org.seo.url,
  logo: org.seo.image,
  sameAs: [
    org.socialLinks?.facebook,
    org.socialLinks?.twitter,
    org.socialLinks?.instagram,
    org.socialLinks?.youtube,
  ].filter(Boolean),
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: org.contactNumber,
    contactType: 'customer service',
  },
});

const seoConfig = {
  titleTemplate: `${orgConfig.title} | %s`,
  defaultTitle: orgConfig.title,
  description: orgConfig.seo.description,
  canonical: orgConfig.seo.url,
  languageAlternates: [
    {
      hrefLang: 'en',
      href: orgConfig.seo.url,
    },
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: orgConfig.seo.url,
    site_name: orgConfig.title,
    title: orgConfig.title,
    description: orgConfig.seo.description,
    images: [
      {
        url: orgConfig.seo.image,
        width: 1200,
        height: 630,
        alt: `${orgConfig.title} - Transform your life with meditation and wellness programs`,
      },
      {
        url: orgConfig.seo.imageSmall || orgConfig.seo.image,
        width: 600,
        height: 315,
        alt: `${orgConfig.title} - Transform your life with meditation and wellness programs`,
      },
    ],
  },
  twitter: {
    handle: '@ArtofLiving',
    site: '@ArtofLiving',
    cardType: 'summary_large_image',
  },
  additionalMetaTags: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1, maximum-scale=5',
    },
    {
      name: 'robots',
      content: 'index, follow, max-image-preview:large',
    },
    {
      name: 'format-detection',
      content: 'telephone=no',
    },
    {
      name: 'theme-color',
      content: '#ffffff',
    },
  ],
  additionalLinkTags: [
    {
      rel: 'icon',
      href: `/${orgConfig.favicon}`,
    },
    {
      rel: 'apple-touch-icon',
      href: `/${orgConfig.favicon180}`,
      sizes: '180x180',
    },
    {
      rel: 'icon',
      type: 'image/png',
      href: `/${orgConfig.favicon32}`,
      sizes: '32x32',
    },
    {
      rel: 'icon',
      type: 'image/png',
      href: `/${orgConfig.favicon16}`,
      sizes: '16x16',
    },
  ],
};

export default seoConfig;
