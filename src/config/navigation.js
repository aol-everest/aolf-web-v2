import { CONTENT_FOLDER_IDS } from '@constants';

export const HB_MENU = [
  {
    name: 'Courses',
    link: '/us-en/courses',
  },
  {
    name: 'Services',
    submenu: [
      {
        name: 'Institutions',
        link: 'https://healingbreaths.org/institutions/',
      },
      {
        name: 'Professionals',
        link: 'https://healingbreaths.org/healthcare-professionals/',
      },
    ],
  },
  {
    name: 'The Science',
    link: `https://healingbreaths.org/the-science/`,
  },
  {
    name: 'Experiences',
    link: `https://healingbreaths.org/experiences/`,
  },
  {
    name: 'Insights',
    submenu: [
      {
        name: 'Stories',
        link: 'https://healingbreaths.org/stories/',
      },
      {
        name: 'Infographics and E-books',
        link: 'https://healingbreaths.org/infographics-and-e-books/',
      },
    ],
  },
  {
    name: 'Who We Are',
    submenu: [
      {
        name: 'About Us',
        link: 'https://healingbreaths.org/about-us/',
      },
    ],
  },
  {
    name: 'News',
    link: 'https://healingbreaths.org/news/',
  },
];

export const AOL_MENU = [
  {
    name: 'Gurudev',
    link: 'https://www.artofliving.org/us-en/gurudev',
    /*submenu: [
      {
        name: 'About',
        link: 'https://www.artofliving.org/us-en/gurudev',
      },
      /* Link not available
      {
        name: 'Biography',
        link: '#',
      },
      {
        name: 'Accolades',
        link: 'https://www.artofliving.org/us-en/awards-and-honours',
      },
      /* Link not available
      {
        name: 'Work',
        link: '#',
      },*/
    /* Link not available
      {
        name: 'Tour',
        link: '#',
      },
    ],*/
  },
  {
    name: 'Explore',
    submenu: [
      {
        name: 'Breathwork',
        link: 'https://event.us.artofliving.org/us-en/breathwork2/lp1/',
      },
      {
        name: 'Meditation',
        link: 'https://event.us.artofliving.org/us-en/secrets-of-meditation2/lp1/',
      },
    ],
  },
  {
    name: 'Meditation',
    submenu: [
      {
        name: 'Daily Practices',
        link: '/us-en/daily-sky',
      },
      {
        name: 'Guided Meditation',
        link: `/us-en/guided-meditation/${CONTENT_FOLDER_IDS.MEDITATE_FOLDER_ID}`,
      },
      {
        name: 'Meetups',
        link: '/us-en/meetup',
      },
    ],
  },
  {
    name: 'Wisdom',
    submenu: [
      /* Link not available
      {
        name: 'Articles',
        link: '#',
      },*/
      /* Link not available
      {
        name: 'Ask Gurudev',
        link: '#',
      },*/
      {
        name: 'Ask Gurudev',
        link: '/us-en/ask-gurudev',
      },
      {
        name: 'Articles',
        link: 'https://www.artofliving.org/us-en/sri-sri-blog',
      },
      {
        name: 'Podcasts',
        link: '/us-en/wisdom/podcast',
      },
    ],
  },
  {
    name: 'Courses',
    subHeading: [
      {
        name: "Beginner's Courses",
        items: [
          {
            name: 'Art Of Living Part 1',
            link: 'https://event.us.artofliving.org/us-en/artoflivingpart1',
          },
          {
            name: 'Sahaj Samadhi Meditation',
            link: `https://event.us.artofliving.org/us-en/sahajsamadhi`,
          },
          {
            name: 'Art Of Living Premium',
            link: 'https://www.artofliving.org/us-en/premiumcourse',
          },
          {
            name: 'Sri Sri Yoga Foundation',
            link: '/us-en/lp/online-foundation-program?utm_source=organic&utm_medium=home&utm_content=menu&course_id=1004431',
          },
          {
            name: 'Sleep and Anxiety Protocol',
            link: 'https://event.us.artofliving.org/us-en/lp1/sleep-anxiety-protocol',
          },
        ],
      },
      {
        name: 'Advanced Courses',
        items: [
          {
            name: 'Art Of Living Part 2',
            link: 'https://event.us.artofliving.org/us-en/artoflivingpart2',
          },
          {
            name: 'Blessings',
            link: '/us-en/lp/blessings-course',
          },
          {
            name: 'Chakra Kriya',
            link: '/us-en/lp/chakra-kriya',
          },
          {
            name: 'DSN',
            link: '/us-en/courses/dsn-course',
          },
          {
            name: 'Sanyam',
            link: '/us-en/lp/sanyam',
          },
          {
            name: 'Shakti Kriya',
            link: '/us-en/lp/shakti-kriya',
          },
          {
            name: 'Sri Sri Yoga Deep Dive',
            link: '/us-en/lp/srisriyoga-deepdiveretreat',
          },
        ],
      },
      {
        name: 'Training Courses',
        items: [
          {
            name: 'Volunteer Training',
            link: '/us-en/lp/vtp',
          },
          {
            name: 'Teacher Training',
            link: '/us-en/lp/teacher-training-course',
          },
          {
            name: 'Sri Sri Yoga Teacher Training',
            link: 'https://artoflivingretreatcenter.org/event/sri-sri-school-of-yoga-ttc',
          },
          {
            name: 'Sri Sri Marma Practitioner',
            link: 'https://event.us.artofliving.org/us-en/marma-training',
          },
          {
            name: 'All Courses',
            link: '/us-en/courses',
          },
          {
            name: 'Help me choose',
            link: '/us-en/course-finder',
          },
        ],
      },
    ],
  },
  {
    name: 'Meet Gurudev',
    submenu: [
      {
        name: 'In Orlando, FL',
        link: 'https://event.us.artofliving.org/us-en/lp1/journey-within-orlando/',
        props: { target: '_blank' },
      },
      {
        name: 'In Jacksonville, FL',
        link: 'https://event.us.artofliving.org/us-en/lp1-journey-within-jacksonville/',
        props: { target: '_blank' },
      },
      {
        name: 'In Cayman Islands',
        link: 'https://event.us.artofliving.org/us-en/lp1/journey-within-grandcayman/',
        props: { target: '_blank' },
      },
      {
        name: 'In Bay Area, CA',
        link: 'https://event.us.artofliving.org/us-en/lp1/sfba/wellness-with-gurudev/',
        props: { target: '_blank' },
      },
      {
        name: 'In Albuquerque, NM',
        link: 'https://aolf.me/jw-albuquerque',
        props: { target: '_blank' },
      },
      {
        name: 'In Boone, NC',
        link: 'https://artoflivingretreatcenter.org/sri-sri-ravi-shankar/gurudev-programs/',
        props: { target: '_blank' },
      },
    ],
  },
  {
    name: 'Centers',
    submenu: [
      {
        name: 'Art of Living Boone Retreat',
        link: '/us-en/lp/theartoflivingretreatcenter',
        props: { target: '_blank' },
      },
      {
        name: 'Connect Locally',
        link: '/us-en/centers',
      },
      {
        name: 'Los Angeles',
        link: 'https://artoflivingla.org',
        props: { target: '_blank' },
      },
      {
        name: 'Washington DC',
        link: 'https://dc.artofliving.org',
        props: { target: '_blank' },
      },
    ],
  },
  {
    name: 'Account',
    submenu: [
      {
        name: 'Account overview',
        link: '/us-en/profile/landing',
      },
      {
        name: 'Upcoming courses',
        link: '/us-en/profile/upcoming-courses',
      },
      {
        name: 'Past courses',
        link: '/us-en/profile/past-courses',
      },
      {
        name: 'Profile',
        link: '/us-en/profile/update-profile',
      },
      {
        name: 'Payment',
        link: '/us-en/profile/card-details',
      },
      {
        name: 'Change password',
        link: '/us-en/profile/change-password',
      },
      {
        name: 'Preferences',
        link: '/us-en/profile/preferences',
      },
      {
        name: 'Refer a friend',
        link: '/us-en/profile/refer-a-friend',
      },
    ],
  },
  {
    name: 'Resources',
    submenu: [
      {
        name: 'Meditations',
        link: `/us-en/library/${CONTENT_FOLDER_IDS.MEDITATE_FOLDER_ID}`,
      },
      {
        name: 'Wisdom',
        link: `/us-en/library/${CONTENT_FOLDER_IDS.WISDOM_FOLDER_ID}`,
      },
      {
        name: 'App',
        link: '/us-en/lp/journey-app',
      },
      {
        name: 'Blog',
        link: 'https://www.artofliving.org/us-en/blog/',
      },
      {
        name: 'Science',
        link: 'https://www.artofliving.org/us-en/meditation/benefits/research-sudarshan-kriya',
      },
    ],
  },
  {
    name: 'About',
    submenu: [
      {
        name: 'Art of Living',
        link: 'https://www.artofliving.org/us-en/about-us',
      },
      {
        name: 'Service Projects',
        link: 'https://www.artofliving.org/us-en/service-projects-overview',
      },
      {
        name: 'World Culture Festival',
        link: 'https://wcf.artofliving.org/',
      },
      /*{
        name: 'Science',
        link: 'https://www.artofliving.org/us-en/meditation/benefits/research-sudarshan-kriya',
      },
      {
        name: 'Blog',
        link: 'https://www.artofliving.org/us-en/blog',
      },*/
      {
        name: 'Press & Media',
        link: 'https://www.artofliving.org/us-en/media-coverage?search=',
      },
      /*{
        name: 'Testimonials',
        link: 'https://www.artofliving.org/us-en/testimonials/search',
      },*/
      {
        name: 'Contact Us',
        link: 'https://www.artofliving.org/us-en/contact-us',
      },
    ],
  },
];

export const IAHV_MENU = [
  {
    name: 'Courses',
    submenu: [
      {
        name: 'Join A Free Intro',
        link: '/us-en/lp/introtalks-hq?id=a388X000000ZHkzQAG&utm_source=organic&utm_medium=website&utm_campaign=menu',
      },
      {
        name: 'Overview',
        link: 'https://www.artofliving.org/us-en/courses',
      },
      {
        name: 'Sahaj Meditation',
        link: `https://www.artofliving.org/us-en/sahaj-samadhi-meditation`,
        // link: `/us-en/course?courseType=SAHAJ_SAMADHI_MEDITATION`,
      },
      {
        name: 'Silent Retreat',
        link: 'https://www.artofliving.org/us-en/silence-retreat',
        // link: `/us-en?courseType=SILENT_RETREAT`,
      },
      {
        name: 'Advanced Courses',
        link: '/us-en/lp/advanced-courses',
      },
      {
        name: 'Healthcare Providers',
        link: 'https://www.healingbreaths.org/',
      },
      {
        name: 'Yoga Course',
        link: '/us-en/lp/online-foundation-program/',
      },
      {
        name: 'College Courses',
        link: 'https://www.skycampushappiness.org/',
      },
      {
        name: 'Destination Retreats',
        link: 'https://artoflivingretreatcenter.org/category/meditation/meditation-mindfulness/',
      },
      {
        name: 'All Courses',
        link: '/us-en/courses',
      },
    ],
  },
  {
    name: 'Meditate',
    submenu: [
      {
        name: 'Guided meditations',
        link: `/us-en/library/${CONTENT_FOLDER_IDS.MEDITATE_FOLDER_ID}`,
      },
      {
        name: 'Live meetups',
        link: '/us-en/meetup',
      },
    ],
  },
  {
    name: 'Account',
    submenu: [
      {
        name: 'Account overview',
        link: '/us-en/profile/update-profile',
      },
      {
        name: 'Upcoming courses',
        link: '/us-en/profile/upcoming-courses',
      },
      {
        name: 'Past courses',
        link: '/us-en/profile/past-courses',
      },
      {
        name: 'Profile',
        link: '/us-en/profile/update-profile',
      },
      {
        name: 'Payment',
        link: '/us-en/profile/card-details',
      },
      {
        name: 'Change password',
        link: '/us-en/profile/change-password',
      },
      {
        name: 'Preferences',
        link: '/us-en/profile/preferences',
      },
      {
        name: 'Refer a friend',
        link: '/us-en/profile/refer-a-friend',
      },
    ],
  },
  {
    name: 'Resources',
    submenu: [
      {
        name: 'Journey App',
        link: '/us-en/lp/journey-app',
      },
      {
        name: 'Blog',
        link: 'https://www.artofliving.org/us-en/blog',
      },
      {
        name: 'Wisdom Snippets',
        link: `/us-en/library/${CONTENT_FOLDER_IDS.WISDOM_FOLDER_ID}`,
      },
      {
        name: 'Better Sleep',
        link: 'https://www.artofliving.org/us-en/blog/start-sleeping-restfully-all-night-using-this-meditation-sleep-guide',
      },
      {
        name: 'Breathwork',
        link: 'https://www.artofliving.org/us-en/yoga/breathing-techniques/yoga-and-pranayama',
      },
      {
        name: 'Yoga',
        link: 'https://www.artofliving.org/us-en/yoga',
      },
      {
        name: 'Meditation for Beginners',
        link: 'https://www.artofliving.org/us-en/8-tips-get-started-meditation',
      },
    ],
  },
  {
    name: 'About',
    submenu: [
      {
        name: 'Art of Living',
        link: 'https://www.artofliving.org/us-en/about-us',
      },
      {
        name: 'Founder',
        link: '/us-en/lp/gurudev',
      },
      {
        name: 'Humanitarian Work',
        link: 'https://www.artofliving.org/us-en/service-projects-overview',
      },
      {
        name: 'Experiences & Reviews',
        link: 'https://www.artofliving.org/us-en/testimonials/search',
      },
      {
        name: 'Retreat Center',
        link: '/us-en/lp/theartoflivingretreatcenter',
      },
      {
        name: 'Research',
        link: 'https://www.artofliving.org/us-en/research-sudarshan-kriya',
      },
      {
        name: 'Press & Media',
        link: 'https://www.artofliving.org/us-en/media-coverage',
      },
    ],
  },
  {
    name: 'Contact',
    submenu: [
      {
        name: 'Contact & Support',
        link: 'https://www.artofliving.org/us-en/contact-us',
      },
      {
        name: 'Donate',
        link: 'https://aolf.kindful.com/',
      },
    ],
  },
  // {
  //   name: 'Events',
  //   submenu: [
  //     {
  //       name: 'World Culture Festival',
  //       link: 'https://wcf.artofliving.org/',
  //     },
  //     {
  //       name: 'Summer Tour 2023',
  //       link: '/us-en/lp/sixthsensetour',
  //     },
  //   ],
  // },
];

export const PWHT_MENU = [
  {
    name: 'Upcoming Workshops',
    link: '/us-en/courses',
  },
  {
    name: 'SKY Resilience',
    submenu: [
      {
        name: 'What is SKY Resilience',
        link: 'https://projectwelcomehometroops.org/sky-resilience-training/',
      },
      {
        name: 'Veterans, Trauma and Moral Injury',
        link: 'https://projectwelcomehometroops.org/about-us/veterans-and-trauma/',
      },
      {
        name: 'Research',
        link: `https://projectwelcomehometroops.org/research/`,
        // link: `/us-en/course?courseType=SAHAJ_SAMADHI_MEDITATION`,
      },
    ],
  },
  {
    name: 'Testimonials',
    submenu: [
      {
        name: 'Videos',
        link: `https://projectwelcomehometroops.org/videos/`,
      },
      {
        name: 'What Veterans are saying',
        link: 'https://projectwelcomehometroops.org/what-veterans-say/',
      },
    ],
  },
  {
    name: 'About PWHT',
    submenu: [
      {
        name: 'About us',
        link: 'https://projectwelcomehometroops.org/about-us/',
      },
      {
        name: 'Press',
        link: 'https://projectwelcomehometroops.org/press/',
      },
      {
        name: 'Contact us',
        link: `https://projectwelcomehometroops.org/contact/`,
      },
    ],
  },
  {
    name: 'Donate',
    link: 'https://iahv.networkforgood.com/projects/29020-project-welcome-home-troops-main',
  },
];
