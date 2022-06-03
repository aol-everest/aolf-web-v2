const allOrganizationConfig = [
  {
    name: "AOL",
    logo: "ic-logo.svg",
    title: "Art of Living Journey",
    favicon: "favicon.ico",
    favicon180: "apple-touch-icon.png",
    favicon32: "favicon-32x32.png",
    favicon16: "favicon-16x16.png",
    seo: {
      image:
        "https://www.artofliving.org/sites/www.artofliving.org/files/images/logo/logo-2x-cropped.png",
      url: "https://members.us.artofliving.org",
      description:
        "You're minutes away from the next step in your journey. Log In Sign Up. facebook. google. or. Don't remember your password?",
    },
  },
  {
    name: "HB",
    logo: "cyne-logo.png",
    title: "Healing Breaths",
    favicon180: "hb-apple-touch-icon.png",
    favicon: "hb-favicon.ico",
    favicon32: "hb-favicon-32x32.png",
    favicon16: "hb-favicon-32x32.png",
    seo: {
      image:
        "https://healingbreaths.org/wp-content/uploads/2022/02/stanford-news-1.png",
      url: "https://members.healingbreaths.org",
      description:
        "You're minutes away from the next step in your journey. Log In Sign Up. facebook. google. or. Don't remember your password?",
    },
  },
];

export const orgConfig = allOrganizationConfig.find(
  (org) => org.name === process.env.NEXT_PUBLIC_ORGANIZATION_NAME,
);

export default allOrganizationConfig;
