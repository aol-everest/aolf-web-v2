import { orgConfig } from "./src/organization-config";
console.log(orgConfig);
// eslint-disable-next-line import/no-anonymous-default-export
export default {
  titleTemplate: `${orgConfig.title} | %s`,
  defaultTitle: orgConfig.title,
  description: orgConfig.seo.description,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: orgConfig.seo.url,
    site_name: orgConfig.title,
    title: orgConfig.title,
    description: orgConfig.seo.description,
    images: [
      {
        url: orgConfig.seo.image,
        width: 200,
        height: 100,
        alt: `${orgConfig.title} logo`,
      },
    ],
  },
  twitter: {
    handle: "@ArtofLiving",
    site: "@ArtofLiving",
    cardType: "summary_large_image",
  },
};
