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
    socialLinks: {
      facebook: 'https://www.facebook.com/artoflivingofficial',
      twitter: 'https://twitter.com/ArtofLiving',
      instagram: 'https://www.instagram.com/artofliving',
      youtube: 'https://www.youtube.com/user/ArtofLivingOfficial',
    },
    seo: {
      image:
        'https://www.artofliving.org/sites/www.artofliving.org/files/images/logo/logo-2x-cropped.png',
      imageSmall:
        'https://www.artofliving.org/sites/www.artofliving.org/files/images/logo/logo-small.png',
      url: process.env.NEXT_PUBLIC_BASE_URL,
      description:
        "Discover inner peace and transform your life with Art of Living's meditation programs, yoga courses, and wellness retreats. Join millions worldwide in experiencing the power of breath and meditation.",
      keywords:
        'meditation, yoga, wellness, breathing techniques, stress relief, personal development, spiritual growth, Art of Living',
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
    socialLinks: {
      facebook: 'https://www.facebook.com/healingbreaths',
      instagram: 'https://www.instagram.com/healing.breaths',
    },
    seo: {
      image:
        'https://healingbreaths.org/wp-content/uploads/2022/02/cyne-logo.png',
      url: 'https://members.healingbreaths.org',
      description:
        'Experience the transformative power of breath with Healing Breaths. Our evidence-based breathing techniques help reduce stress, anxiety, and PTSD while promoting mental well-being and emotional resilience.',
      keywords:
        'breathing techniques, stress reduction, anxiety relief, PTSD, mental health, emotional wellness, meditation',
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
    socialLinks: {
      facebook: 'https://www.facebook.com/IAHVGlobal',
      twitter: 'https://twitter.com/IAHVGlobal',
    },
    seo: {
      image:
        'https://us.iahv.org/wp-content/uploads/2017/02/imageedit_5_7682410385.png',
      url: 'https://us.iahv.org',
      description:
        'IAHV provides evidence-based programs for stress management, leadership development, and disaster relief. Join us in creating a more peaceful and sustainable world through personal transformation.',
      keywords:
        'humanitarian work, stress management, leadership development, disaster relief, peace building, community service',
    },
    courseModes: ['ONLINE', 'IN_PERSON'],
    meetupModes: ['ONLINE', 'IN_PERSON'],
    eventModes: ['ONLINE', 'IN_PERSON'],
    courseTypes: ['SKY_HAPPINESS_RETREAT'],
    otherCourseTypes: [],
  },
  {
    name: 'PWHT',
    logo: 'PWHT-logo.png',
    logoLink: 'https://projectwelcomehometroops.org/',
    title: 'Project Welcome Home Troops',
    favicon: 'pwht-favicon.ico',
    favicon180: 'pwht-apple-touch-icon.png',
    favicon32: 'pwht-favicon-32x32.png',
    favicon16: 'pwht-favicon-16x16.png',
    contactNumber: '(855) 202-4400',
    contactNumberLink: '8552024400',
    socialLinks: {
      facebook: 'https://www.facebook.com/ProjectWelcomeHomeTroops',
      twitter: 'https://twitter.com/PWHTroops',
    },
    seo: {
      image:
        'https://projectwelcomehometroops.org/wp-content/uploads/2023/logo-large.png',
      url: 'https://projectwelcomehometroops.org',
      description:
        'Project Welcome Home Troops offers evidence-based breathing and meditation programs specifically designed for veterans and military families. Our programs help address PTSD, reduce stress, and ease the transition to civilian life.',
      keywords:
        'veterans, military families, PTSD, stress relief, meditation, breathing techniques, military transition',
    },
    courseModes: ['ONLINE', 'IN_PERSON'],
    meetupModes: ['ONLINE', 'IN_PERSON'],
    eventModes: ['ONLINE', 'IN_PERSON'],
    courseTypes: ['SKY_HAPPINESS_RETREAT'],
    otherCourseTypes: [],
  },
];

export const orgConfig = allOrganizationConfig.find(
  (org) => org.name === process.env.NEXT_PUBLIC_ORGANIZATION_NAME,
);

export default allOrganizationConfig;
