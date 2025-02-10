const allOrganizationConfig = [
  {
    name: 'AOL',
    logo: 'ic-logo.svg',
    logoLink: 'https://www.artofliving.org/us-en',
    title: 'Art of Living Journey',
    favicon: 'favicon.ico',
    favicon180: 'apple-touch-icon.png',
    favicon32: 'favicon-32x32.png',
    favicon16: 'favicon-16x16.png',
    contactNumber: '(855) 202-4400',
    contactNumberLink: '8552024400',
    seo: {
      image:
        'https://www.artofliving.org/sites/www.artofliving.org/files/images/logo/logo-2x-cropped.png',
      url: process.env.NEXT_PUBLIC_BASE_URL,
      description:
        "You're minutes away from the next step in your journey. Log In Sign Up. facebook. google. or. Don't remember your password?",
    },
    courseModes: ['ONLINE', 'IN_PERSON', 'DESTINATION_RETREATS'],
    meetupModes: ['ONLINE', 'IN_PERSON'],
    eventModes: ['ONLINE', 'IN_PERSON'],
    courseTypes: [
      'SKY_BREATH_MEDITATION',
      'SILENT_RETREAT',
      'SAHAJ_SAMADHI_MEDITATION',
      'SRI_SRI_YOGA_MEDITATION',
      'ART_OF_LIVING_PREMIUM_PROGRAM',
    ],
    otherCourseTypes: [
      'CHAKRA_KRIYA',
      'VOLUNTEER_TRAINING_PROGRAM',
      'BLESSINGS_COURSE',
      'SANYAM_COURSE',
      'SRI_SRI_YOGA_DEEP_DIVE',
      'MARMA_TRAINING',
      'DSN_COURSE',
    ],
  },
  {
    name: 'HB',
    logo: 'cyne-logo.png',
    logoLink: 'https://healingbreaths.org',
    title: 'Healing Breaths',
    favicon180: 'hb-apple-touch-icon.png',
    favicon: 'hb-favicon.ico',
    favicon32: 'hb-favicon-32x32.png',
    favicon16: 'hb-favicon-32x32.png',
    contactNumber: '(628) 280-6527',
    contactNumberLink: '6282806527',
    seo: {
      image:
        'https://healingbreaths.org/wp-content/uploads/2022/02/cyne-logo.png',
      url: 'https://members.healingbreaths.org',
      description:
        "You're minutes away from the next step in your journey. Log In Sign Up. facebook. google. or. Don't remember your password?",
    },
    courseModes: ['ONLINE', 'IN_PERSON', 'DESTINATION_RETREATS'],
    meetupModes: ['ONLINE', 'IN_PERSON'],
    eventModes: ['ONLINE', 'IN_PERSON'],
    courseTypes: [
      'SKY_BREATH_MEDITATION',
      'SILENT_RETREAT',
      'SAHAJ_SAMADHI_MEDITATION',
      'SRI_SRI_YOGA_MEDITATION',
    ],
    otherCourseTypes: [
      'CHAKRA_KRIYA',
      'VOLUNTEER_TRAINING_PROGRAM',
      'BLESSINGS_COURSE',
      'SANYAM_COURSE',
    ],
  },
  {
    name: 'IAHV',
    logo: 'iahv-logo.png',
    logoLink: 'https://us.iahv.org',
    title: 'IAHV',
    favicon180: 'iahv-favicon-96x96.png',
    favicon: 'iahv-favicon.ico',
    favicon32: 'iahv-favicon-32x32.png',
    favicon16: 'iahv-favicon-16x16.png',
    contactNumber: '(855) 202-4400',
    contactNumberLink: '8552024400',
    seo: {
      image:
        'https://us.iahv.org/wp-content/uploads/2017/02/imageedit_5_7682410385.png',
      url: 'https://members.healingbreaths.org',
      description:
        "You're minutes away from the next step in your journey. Log In Sign Up. facebook. google. or. Don't remember your password?",
    },
    courseModes: ['ONLINE', 'IN_PERSON'],
    meetupModes: ['ONLINE', 'IN_PERSON'],
    eventModes: ['ONLINE', 'IN_PERSON'],
    courseTypes: ['SKY_HAPPINESS_RETREAT'],
    otherCourseTypes: [],
  },
  {
    name: 'IAHV',
    logo: 'iahv-logo.png',
    title: 'IAHV',
    favicon180: 'iahv-favicon-96x96.png',
    favicon: 'iahv-favicon.ico',
    favicon32: 'iahv-favicon-32x32.png',
    favicon16: 'iahv-favicon-16x16.png',
    seo: {
      image:
        'https://us.iahv.org/wp-content/uploads/2017/02/imageedit_5_7682410385.png',
      url: 'https://members.healingbreaths.org',
      description:
        "You're minutes away from the next step in your journey. Log In Sign Up. facebook. google. or. Don't remember your password?",
    },
  },
  {
    name: 'PWHT',
    logo: 'PWHT-logo.png',
    title: 'PWHT',
    favicon180: 'iahv-favicon-96x96.png',
    favicon: 'iahv-favicon.ico',
    favicon32: 'iahv-favicon-32x32.png',
    favicon16: 'iahv-favicon-16x16.png',
    seo: {
      image:
        'https://us.iahv.org/wp-content/uploads/2017/02/imageedit_5_7682410385.png',
      url: 'https://projectwelcomehometroops.org',
      description:
        "You're minutes away from the next step in your journey. Log In Sign Up. facebook. google. or. Don't remember your password?",
    },
  },
];

export const orgConfig = allOrganizationConfig.find(
  (org) => org.name === process.env.NEXT_PUBLIC_ORGANIZATION_NAME,
);

export default allOrganizationConfig;
