export const ABBRS = {
  null: '',
  EST: 'ET',
  EDT: 'ET',
  CST: 'CT',
  CDT: 'CT',
  MST: 'MT',
  MDT: 'MT',
  PST: 'PT',
  PDT: 'PT',
  HST: 'HT',
  HDT: 'HT',
};

export const TIME_ZONE = {
  EST: {
    name: 'Eastern',
    value: 'EST',
  },
  CST: {
    name: 'Central',
    value: 'CST',
  },
  MST: {
    name: 'Mountain',
    value: 'MST',
  },
  PST: {
    name: 'Pacific',
    value: 'PST',
  },
  HST: {
    name: 'Hawaii',
    value: 'HST',
  },
};

export const CONTENT_FOLDER_IDS = {
  MEDITATE_FOLDER_ID: process.env.NEXT_PUBLIC_MEDITATE_FOLDER_ID,
  WISDOM_FOLDER_ID: process.env.NEXT_PUBLIC_WISDOM_FOLDER_ID,
};

export const PAYMENT_TYPES = {
  FULL: 'FULL',
  LATER: 'LATER',
};

export const PAYMENT_MODES = {
  PAYPAL_PAYMENT_MODE: 'PAYPAL_PAYMENT_MODE',
  STRIPE_PAYMENT_MODE: 'STRIPE_PAYMENT_MODE',
};

export const COURSE_MODES = {
  ONLINE: {
    name: 'Online',
    value: 'Online',
  },
  IN_PERSON: {
    name: 'In Person',
    value: 'In Person',
  },
  DESTINATION_RETREATS: {
    name: 'Destination Retreats',
    value: 'destination retreats',
  },
};

export const MODAL_TYPES = {
  LOGIN_MODAL: 'LOGIN_MODAL',
  CUSTOM_MODAL: 'CUSTOM_MODAL',
  EMPTY_MODAL: 'EMPTY_MODAL',
};

export const ALERT_TYPES = {
  SUCCESS_ALERT: 'SUCCESS_ALERT',
  ERROR_ALERT: 'ERROR_ALERT',
  WARNING_ALERT: 'WARNING_ALERT',
  CUSTOM_ALERT: 'CUSTOM_ALERT',
};

export const SHARE_SITES = {
  GOOGLE: 'Google',
  ICAL: 'iCal',
};

export const COURSE_TYPES_MASTER = {
  AOL: [
    {
      name: `Beginner's Courses`,
      courseTypes: {
        SKY_BREATH_MEDITATION: {
          slug: 'art-of-living-part-1',
          name: 'Art of Living Part 1',
        },
        SAHAJ_SAMADHI_MEDITATION: {
          slug: 'sahaj-samadhi-meditation',
          name: 'Sahaj Samadhi Meditation',
        },
        ART_OF_LIVING_PREMIUM_PROGRAM: {
          slug: 'art-of-living-premium-program',
          name: 'Art of Living Premium Program',
        },
        SRI_SRI_YOGA_MEDITATION: {
          slug: 'sri-sri-yoga-foundation',
          name: 'Sri Sri Yoga Foundation',
        },
      },
    },
    {
      name: `Advanced Courses`,
      courseTypes: {
        SILENT_RETREAT: {
          slug: 'art-of-living-part-2',
          name: 'Art of Living Part 2',
        },
        BLESSINGS_COURSE: {
          slug: 'blessings-course',
          name: 'Blessings Course',
          isAvailableInPersonOnly: true,
        },
        CHAKRA_KRIYA: {
          slug: 'chakra-kriya',
          name: 'Chakra Kriya',
        },
        DSN_COURSE: {
          slug: 'dsn-course',
          name: 'DSN Course',
          isAvailableInPersonOnly: true,
        },
        SANYAM_COURSE: {
          slug: 'sanyam-course',
          name: 'Sanyam Course',
        },
        SHAKTI_KRIYA: {
          slug: 'shakti-kriya',
          name: 'Shakti Kriya',
        },
        SRI_SRI_YOGA_DEEP_DIVE: {
          slug: 'sri-sri-yoga-deep-dive',
          name: 'Sri Sri Yoga Deep Dive',
        },
      },
    },
    {
      name: `Training Courses`,
      courseTypes: {
        VOLUNTEER_TRAINING_PROGRAM: {
          slug: 'volunteer-training-program',
          name: 'Volunteer Training Program',
        },
        TEACHER_TRAINING: {
          slug: 'teacher-training',
          name: 'Teacher Training',
          isExternal: true,
          link: '/us-en/lp/teacher-training-course',
          description:
            'Experience the joy of transforming lives and become a SKY teacher turbocharged with new skills and leadership development.',
        },
        SRI_SRI_YOGA_TEACHER_TRAINING: {
          slug: 'sri-sri-yoga-teacher-training',
          name: 'Sri Sri Yoga Teacher Training',
          isExternal: true,
          link: 'https://artoflivingretreatcenter.org/event/sri-sri-school-of-yoga-ttc',
          description:
            'Dive into authentic yoga with inspiring trainers in a serene mountain setting. Rooted in science, experience, and a lineage of yoga masters, SSYTT enab...',
        },
        MARMA_TRAINING: {
          slug: 'sri-sri-marma-practitioner',
          name: 'Sri Sri Marma Practitioner',
          isAvailableInPersonOnly: true,
        },
      },
    },
  ],
  HB: [
    {
      name: `Beginner's Courses`,
      courseTypes: {
        SKY_BREATH_MEDITATION: {
          slug: 'art-of-living-part-1',
          name: 'SKY Program',
        },
        SAHAJ_SAMADHI_MEDITATION: {
          slug: 'sahaj-samadhi-meditation',
          name: 'Sahaj Samadhi - Signature Meditation Program',
        },
        // BE_WELL_SESSIONS: {
        //   slug: 'be_well',
        //   name: 'Be Well',
        // },
      },
    },
    {
      name: `Advanced Courses`,
      courseTypes: {
        SILENT_RETREAT: {
          slug: 'art-of-living-part-2',
          name: 'Art of Silence Program - Healing Breath',
        },
      },
    },
  ],
  IAHV: [
    {
      name: `Beginner's Courses`,
      courseTypes: {
        SKY_BREATH_MEDITATION: {
          slug: 'art-of-living-part-1',
          name: 'SKY Happiness Retreat',
        },
        SAHAJ_SAMADHI_MEDITATION: {
          slug: 'sahaj-samadhi-meditation',
          name: 'Sahaj Samadhi Meditation',
        },
        ART_OF_LIVING_PREMIUM_PROGRAM: {
          slug: 'art-of-living-premium-program',
          name: 'SKY Premium Meditation',
        },
        SRI_SRI_YOGA_MEDITATION: {
          slug: 'sri-sri-yoga-foundation',
          name: 'Sri Sri Yoga Foundation',
        },
      },
    },
    {
      name: `Advanced Courses`,
      courseTypes: {
        SILENT_RETREAT: {
          slug: 'art-of-living-part-2',
          name: 'Art of Living Part 2',
        },
        BLESSINGS_COURSE: {
          slug: 'blessings-course',
          name: 'Blessings Course',
        },
        CHAKRA_KRIYA: {
          slug: 'chakra-kriya',
          name: 'Chakra Kriya',
        },
        SANYAM_COURSE: {
          slug: 'sanyam-course',
          name: 'Sanyam Course',
        },
        SRI_SRI_YOGA_DEEP_DIVE: {
          slug: 'sri-sri-yoga-deep-dive',
          name: 'Sri Sri Yoga Deep Dive',
        },
      },
    },
    {
      name: `Training Courses`,
      courseTypes: {
        VOLUNTEER_TRAINING_PROGRAM: {
          slug: 'volunteer-training-program',
          name: 'Volunteer Training Program',
        },
        TEACHER_TRAINING: {
          slug: 'teacher-training',
          name: 'Teacher Training',
          isExternal: true,
          link: 'https://members.us.artofliving.org/us-en/lp/teacher-training-course',
          description:
            'Experience the joy of transforming lives and become a SKY teacher turbocharged with new skills and leadership development.',
        },
        MARMA_TRAINING: {
          slug: 'sri-sri-marma-practitioner',
          name: 'Sri Sri Marma Practitioner',
        },
      },
    },
  ],
};

export const COURSE_TYPES = {
  SKY_BREATH_MEDITATION: {
    slug: 'art-of-living-part-1',
    name: 'Art of Living Part 1',
    value: process.env.NEXT_PUBLIC_SKY_BREATH_MEDITATION_CTYPE || '',
    code: '10101000',
    description:
      'Discover SKY Breath Meditation, an evidence-based technique that quickly reduces stress, balances emotions, and restores calm.',
    subTypes: {
      Online: process.env.NEXT_PUBLIC_SKY_BREATH_MEDITATION_ONLINE_CTYPE,
      'In Person':
        process.env.NEXT_PUBLIC_SKY_BREATH_MEDITATION_IN_PERSON_CTYPE,
    },
  },
  SILENT_RETREAT: {
    slug: 'art-of-living-part-2',
    name: 'Art of Living Part 2',
    code: '10203000',
    value: process.env.NEXT_PUBLIC_SILENT_RETREAT_CTYPE || '',
    description:
      'Unplug from the world for a few days to give yourself a true vacation for mind, body, and spirit with a silent retreat.',
  },
  SAHAJ_SAMADHI_MEDITATION: {
    slug: 'sahaj-samadhi-meditation',
    name: 'Sahaj Samadhi Meditation',
    value: process.env.NEXT_PUBLIC_SAHAJ_SAMADHI_CTYPE || '',
    code: '10102000',
    description:
      'Learn how to let go of worries and enjoy deep rest with this practical, effective, and effortless meditation practice.',
    subTypes: {
      Online: process.env.NEXT_PUBLIC_SAHAJ_SAMADHI_ONLINE_CTYPE,
      'In Person': process.env.NEXT_PUBLIC_SAHAJ_SAMADHI_IN_PERSON_CTYPE,
    },
  },
  SRI_SRI_YOGA_MEDITATION: {
    slug: 'sri-sri-yoga-foundation',
    name: 'Sri Sri Yoga Foundation',
    code: '10106000',
    value: process.env.NEXT_PUBLIC_SRI_SRI_YOGA_CTYPE || '',
    description:
      'Improve your flexibility and nourish your spirit with this deeply relaxing style of yoga and its wealth of mind-body benefits.',
  },
  CHAKRA_KRIYA: {
    slug: 'chakra-kriya',
    name: 'Chakra Kriya',
    code: '10207000',
    value: process.env.NEXT_PUBLIC_CHAKRA_KRIYA_CTYPE || '',
    description:
      'Boost your SKY practice with the energy of your chakras to experience new depths of meditation and rest.',
  },
  VOLUNTEER_TRAINING_PROGRAM: {
    slug: 'volunteer-training-program',
    name: 'Volunteer Training Program',
    code: '10408000',
    value: process.env.NEXT_PUBLIC_VOLUNTEER_TRAINING_PROGRAM_CTYPE || '',
    description:
      'Grow professionally, personally, and spiritually. Overcome personal barriers and gain the skills to make a difference in your community.',
  },
  SKY_SILENT_RETREAT: {
    slug: 'silent-retreat',
    name: 'Silent Retreat',
    value: process.env.NEXT_PUBLIC_SKY_SILENT_RETREAT_CTYPE || '',
    code: '10305000',
    subTypes: {
      Online: process.env.NEXT_PUBLIC_SKY_SILENT_RETREAT_ONLINE_CTYPE,
      'In Person': process.env.NEXT_PUBLIC_SKY_SILENT_RETREAT_IN_PERSON_CTYPE,
    },
  },
  ART_OF_LIVING_PREMIUM_PROGRAM: {
    slug: 'art-of-living-premium-program',
    name: 'Art of Living Premium Program',
    value: process.env.NEXT_PUBLIC_SKY_WITH_SAHAJ_CTYPE || '',
    code: '10304000',
    description:
      'Find new levels of calm and energy for life in this powerful course that introduces SKY Breath Meditation and Sahaj Samadhi Meditation.',
    subTypes: {
      Online: process.env.NEXT_PUBLIC_SKY_WITH_SAHAJ_ONLINE_CTYPE,
      'In Person': process.env.NEXT_PUBLIC_SKY_WITH_SAHAJ_IN_PERSON_CTYPE,
    },
  },
  BE_WELL_SESSIONS: {
    slug: 'be_well',
    name: 'Be Well',
    value: process.env.NEXT_PUBLIC_BE_WELL_SESSIONS_CTYPE || '',
    description:
      'A one-hour series of webinars covering a wide variety of topics in healthcare and self-care. Includes an experience of breathwork and meditation.',
  },
  SKY_HAPPINESS_RETREAT: {
    slug: 'sky-happiness-retreat',
    name: 'SKY Happiness Retreat',
    value: process.env.NEXT_PUBLIC_SKY_HAPPINESS_RETREAT_CTYPE || '',
  },
  BLESSINGS_COURSE: {
    slug: 'blessings-course',
    name: 'Blessings Course',
    code: '10209000',
    value: process.env.NEXT_PUBLIC_BLESSINGS_COURSE_CTYPE || '',
    description:
      'Immerse in a subtle yet transformative program designed to take you to a deep state of gratitude and fullness with a connection to innate healing.',
  },
  SANYAM_COURSE: {
    slug: 'sanyam-course',
    name: 'Sanyam Course',
    code: '10210000',
    value: process.env.NEXT_PUBLIC_SANYAM_COURSE_CTYPE || '',
    description:
      'Unlock the magic inside of you, open new doors to your meditation practice, and gain a profound understanding of yoga’s timeless wisdom.',
  },
  MEDITATION_DELUXE_COURSE: {
    slug: 'meditation-deluxe-course',
    name: 'MEDITATION_DELUXE_COURSE',
    code: '10111000',
    value: process.env.NEXT_PUBLIC_MEDITATION_DELUXE_CTYPE || '',
  },
  GATEWAY_TO_INFINITY_COURSE: {
    slug: 'gateway-to-infinity-course',
    name: 'GATEWAY_TO_INFINITY_COURSE',
    code: '10112000',
    value: process.env.NEXT_PUBLIC_GATEWAY_TO_INFINITY_CTYPE || '',
  },
  SRI_SRI_YOGA_DEEP_DIVE: {
    slug: 'sri-sri-yoga-deep-dive',
    name: 'Sri Sri Yoga Deep Dive',
    value: process.env.NEXT_PUBLIC_SRI_SRI_YOGA_DEEP_DIVE_CTYPE || '',
    description:
      'Dive deep into yoga in a gentle yet profound, celebratory, and joyful way',
  },
  MARMA_TRAINING: {
    slug: 'sri-sri-marma-practitioner',
    name: 'Sri Sri Marma Practitioner',
    value: process.env.NEXT_PUBLIC_MARMA_PRACTITIONER_CTYPE || '',
    description:
      'Learn how to heal yourself and others through Marma, the most restorative Ayurvedic treatment.',
  },
  DSN_COURSE: {
    slug: 'dsn-course',
    name: 'DSN Course',
    description:
      'Break through your fears, inhibitions, and worry to access inner stability and power, for yourself and the world at large.',
    value: process.env.NEXT_PUBLIC_DSN_CTYPE || '',
  },
  SHAKTI_KRIYA: {
    slug: 'shakti-kriya',
    name: 'Shakti Kriya',
    description:
      'Get Shaktified and tap into a profound reservoir of energy from within. Discover the full, powerful you!',
    value: process.env.NEXT_PUBLIC_SHAKTI_KRIYA_CTYPE || '',
  },
};

export const YOUTH_EVENTS_MASTER = {
  AOL: [
    {
      name: `Junior's Courses`,
      courseTypes: {
        SKY_BREATH_MEDITATION: {
          slug: 'art-of-living-part-1',
          name: 'Art of Living Part 1',
        },
        SAHAJ_SAMADHI_MEDITATION: {
          slug: 'sahaj-samadhi-meditation',
          name: 'Sahaj Samadhi Meditation',
        },
        ART_OF_LIVING_PREMIUM_PROGRAM: {
          slug: 'art-of-living-premium-program',
          name: 'Art of Living Premium Program',
        },
        SRI_SRI_YOGA_MEDITATION: {
          slug: 'sri-sri-yoga-foundation',
          name: 'Sri Sri Yoga Foundation',
        },
      },
    },
    {
      name: `Junior Courses`,
      courseTypes: {
        SILENT_RETREAT: {
          slug: 'art-of-living-part-2',
          name: 'Art of Living Part 2',
        },
        BLESSINGS_COURSE: {
          slug: 'blessings-course',
          name: 'Blessings Course',
        },
        CHAKRA_KRIYA: {
          slug: 'chakra-kriya',
          name: 'Chakra Kriya',
        },
        SANYAM_COURSE: {
          slug: 'sanyam-course',
          name: 'Sanyam Course',
        },
        SRI_SRI_YOGA_DEEP_DIVE: {
          slug: 'sri-sri-yoga-deep-dive',
          name: 'Sri Sri Yoga Deep Dive',
        },
      },
    },
    {
      name: `Training Courses`,
      courseTypes: {
        VOLUNTEER_TRAINING_PROGRAM: {
          slug: 'volunteer-training-program',
          name: 'Volunteer Training Program',
        },
        TEACHER_TRAINING: {
          slug: 'teacher-training',
          name: 'Teacher Training',
          isExternal: true,
          link: 'https://www.google.com/',
          description:
            'Experience the joy of transforming lives and become a SKY teacher turbocharged with new skills and leadership development.',
        },
        MARMA_TRAINING: {
          slug: 'sri-sri-marma-practitioner',
          name: 'Sri Sri Marma Practitioner',
        },
      },
    },
  ],
  IAHV: [
    {
      name: `Juniors`,
      courseTypes: {
        Angels: {
          slug: 'angels',
          name: 'Angels',
        },
        WisdomandRelaxation: {
          slug: 'wisdom-and-relaxation',
          name: 'Wisdom and Relaxation : 3 Days',
        },
        WisdomandRelaxation4: {
          slug: 'wisdom-and-relaxation',
          name: 'Wisdom and Relaxation : 4 Days',
        },
        IntuitiveProcessJuniors: {
          slug: 'intuitive-process-seniors',
          name: 'Intuitive Process Juniors',
        },
        Juniors: {
          slug: 'juniors',
          name: 'Juniors',
        },
      },
    },
    {
      name: `SKY Kids`,
      courseTypes: {
        SKYKids: {
          slug: 'sky-kids',
          name: 'SKY Kids',
        },
        WisdomandRelaxation: {
          slug: 'wisdom-and-relaxation',
          name: 'Wisdom and Relaxation',
        },
        IntuitiveProcessSeniors: {
          slug: 'intuitive-process-seniors',
          name: 'Intuitive Process Seniors',
        },
      },
    },
    {
      name: `SKY TEENS`,
      courseTypes: {
        SKYTeensYogaFoundations: {
          slug: 'sky-teens-yoga-foundations',
          name: 'SKY Teens Yoga Foundations',
        },
        SKYTeens: {
          slug: 'sky-teens',
          name: 'SKY-Teens',
        },
        SKYTeensPart2: {
          slug: 'teens-part2',
          name: 'SKY Teens Part 2',
        },
        WisdomandRelaxation: {
          slug: 'wisdom-and-relaxation',
          name: 'Wisdom and Relaxation',
        },
        TeensSahaj: {
          slug: 'teens-sahaj',
          name: 'Teens Sahaj',
        },
        IntuitiveProcessSeniors: {
          slug: 'intuitive-process-seniors',
          name: 'Intuitive Process Seniors',
        },
      },
    },
    {
      name: `Parents`,
      courseTypes: {
        KnowYourChild: {
          slug: 'know-your-child',
          name: 'Know Your Child (KYC)',
        },
        KnowYourTeen: {
          slug: 'know-your-teen',
          name: 'Know Your Teen (KYT)',
        },
      },
    },
  ],
  HB: [
    {
      name: `Beginner's Courses`,
      courseTypes: {
        SKY_BREATH_MEDITATION: {
          slug: 'art-of-living-part-1',
          name: 'Art of Living Part 1',
        },
        SAHAJ_SAMADHI_MEDITATION: {
          slug: 'sahaj-samadhi-meditation',
          name: 'Sahaj Samadhi Meditation',
        },
        ART_OF_LIVING_PREMIUM_PROGRAM: {
          slug: 'art-of-living-premium-program',
          name: 'Art of Living Premium Program',
        },
        SRI_SRI_YOGA_MEDITATION: {
          slug: 'sri-sri-yoga-foundation',
          name: 'Sri Sri Yoga Foundation',
        },
      },
    },
    {
      name: `Advanced Courses`,
      courseTypes: {
        SILENT_RETREAT: {
          slug: 'art-of-living-part-2',
          name: 'Art of Living Part 2',
        },
        BLESSINGS_COURSE: {
          slug: 'blessings-course',
          name: 'Blessings Course',
        },
        CHAKRA_KRIYA: {
          slug: 'chakra-kriya',
          name: 'Chakra Kriya',
        },
        SANYAM_COURSE: {
          slug: 'sanyam-course',
          name: 'Sanyam Course',
        },
        SRI_SRI_YOGA_DEEP_DIVE: {
          slug: 'sri-sri-yoga-deep-dive',
          name: 'Sri Sri Yoga Deep Dive',
        },
      },
    },
    {
      name: `Training Courses`,
      courseTypes: {
        VOLUNTEER_TRAINING_PROGRAM: {
          slug: 'volunteer-training-program',
          name: 'Volunteer Training Program',
        },
        TEACHER_TRAINING: {
          slug: 'teacher-training',
          name: 'Teacher Training',
          isExternal: true,
          link: 'https://www.google.com/',
          description:
            'Experience the joy of transforming lives and become a SKY teacher turbocharged with new skills and leadership development.',
        },
        MARMA_TRAINING: {
          slug: 'sri-sri-marma-practitioner',
          name: 'Sri Sri Marma Practitioner',
        },
      },
    },
  ],
};
export const YOUTH_EVENTS_TYPES = {
  KnowYourChild: {
    slug: 'know-your-child',
    name: 'Know Your Child',
    value: process.env.NEXT_PUBLIC_SKY_BREATH_MEDITATION_CTYPE || '',
    code: '10101000',
    description:
      'Know Your Child is a two hour workshop that uses ancient wisdom to shed some light on our interactions with children, their behavior and the issues that affect them.',
  },
  KnowYourTeen: {
    slug: 'know-your-teen',
    name: 'Know Your Teen',
    value: process.env.NEXT_PUBLIC_SKY_BREATH_MEDITATION_CTYPE || '',
    code: '10101000',
    description:
      'Know Your Teen is a special two hour workshop for parents and guardians, filled with effective strategies to understand the unique needs and challenges teenagers face',
  },
  SKYKids: {
    slug: 'sky-kids',
    name: 'SKY Kids',
    value: process.env.NEXT_PUBLIC_SKY_BREATH_MEDITATION_CTYPE || '',
    code: '10101000',
    description:
      "The SKY Kids program gives children the tools they need to thrive and meet life's challenges with a smile.",
  },
  Angels: {
    slug: 'angels',
    name: 'Angels',
    value: process.env.NEXT_PUBLIC_SKY_BREATH_MEDITATION_CTYPE || '',
    code: '10101000',
    description: 'Test description',
  },
  Juniors: {
    slug: 'juniors',
    name: 'Juniors',
    value: process.env.NEXT_PUBLIC_SKY_BREATH_MEDITATION_CTYPE || '',
    code: '10101000',
    description: 'Test description',
  },
  SKYTeensYogaFoundations: {
    slug: 'sky-teens-yoga-foundations',
    name: 'SKYTeensYogaFoundations',
    value: process.env.NEXT_PUBLIC_SKY_BREATH_MEDITATION_CTYPE || '',
    code: '10101000',
    description: 'Test Description',
  },
  SKYTeensSKY: {
    slug: 'sky-teens',
    name: 'SKYTeensSKY',
    value: process.env.NEXT_PUBLIC_SKY_BREATH_MEDITATION_CTYPE || '',
    code: '10101000',
    description:
      'The SKY Teens programs helps students discover greater self-confidence, resilience and a set of tools that will carry them through all of life’s ups and downs.',
  },
  TeensPart2: {
    slug: 'teens-part2',
    name: 'TeensPart2',
    value: process.env.NEXT_PUBLIC_SKY_BREATH_MEDITATION_CTYPE || '',
    code: '10101000',
    description:
      'The SKY Teens 2 is an advanced meditation and leadership workshop for students who have already taken the SKY Teens program and want to go deeper with their experience',
  },
  WisdomandRelaxation: {
    slug: 'wisdom-and-relaxation',
    name: 'WisdomandRelaxation',
    value: process.env.NEXT_PUBLIC_SKY_BREATH_MEDITATION_CTYPE || '',
    code: '10101000',
    description:
      'The Wisdom & Relaxation sessions help children maintain a strong connection to themselves and introduces them to a growth mindset in an atmosphere of fun, teamwork, and exciting challenges.',
  },
  WisdomandRelaxation4: {
    slug: 'wisdom-and-relaxation',
    name: 'WisdomandRelaxation',
    value: process.env.NEXT_PUBLIC_SKY_BREATH_MEDITATION_CTYPE || '',
    code: '10101000',
    description:
      'The Wisdom & Relaxation sessions help children maintain a strong connection to themselves and introduces them to a growth mindset in an atmosphere of fun, teamwork, and exciting challenges.',
  },
  TeensSahaj: {
    slug: 'teens-sahaj',
    name: 'TeensSahaj',
    value: process.env.NEXT_PUBLIC_SKY_BREATH_MEDITATION_CTYPE || '',
    code: '10101000',
    description:
      'Sahaj Samadhi meditation is a personalized  technique that trains the conscious mind to experience the silent depths of its own nature.',
  },
  IntuitiveProcessSeniors: {
    slug: 'intuitive-process-seniors',
    name: 'IntuitiveProcessSeniors',
    value: process.env.NEXT_PUBLIC_SKY_BREATH_MEDITATION_CTYPE || '',
    code: '10101000',
    description: 'Give your child a powerful edge with the Intuition Process.',
  },
};

export const WORKSHOP_MODE = {
  VIEW: 'view',
};

export const MEETUP_TYPES = {
  SKY_MEETUP: {
    name: 'SKY Meetup',
    value: process.env.NEXT_PUBLIC_SKY_MEETUP_CTYPE || '',
  },
  SAHAJ_SAMADHI_MEETUP: {
    name: 'Sahaj Samadhi Meetup',
    value: process.env.NEXT_PUBLIC_SAHAJ_SAMADHI_MEETUP_CTYPE || '',
  },
};

export const MEMBERSHIP_TYPES = {
  JOURNEY_PREMIUM: {
    name: 'Journey Premium',
    value: process.env.NEXT_PUBLIC_JOURNEY_PREMIUM || '',
  },
  JOURNEY_PLUS: {
    name: 'Journey Plus',
    value: process.env.NEXT_PUBLIC_JOURNEY_PLUS || '',
  },
  BASIC_MEMBERSHIP: {
    name: 'Basic Membership',
    value: process.env.NEXT_PUBLIC_BASIC_MEMBERSHIP || '',
  },
  DIGITAL_MEMBERSHIP: {
    name: 'Digital Membership',
    value: process.env.NEXT_PUBLIC_DIGITAL_MEMBERSHIP || '',
  },
  FREE_MEMBERSHIP: {
    name: 'Free Membership',
    value: process.env.NEXT_PUBLIC_FREE_MEMBERSHIP || '',
  },
};

export const DURATION = {
  MINUTES_5: {
    name: '5 minutes',
    value: '0-300',
  },
  MINUTES_10: {
    name: '10 minutes',
    value: '300-600',
  },
  MINUTES_20: {
    name: '20 + minutes',
    value: '600-10800',
  },
};

export const US_STATES = [
  {
    label: 'Alabama',
    value: 'AL',
  },
  {
    label: 'Alaska',
    value: 'AK',
  },
  {
    label: 'American Samoa',
    value: 'AS',
  },
  {
    label: 'Arizona',
    value: 'AZ',
  },
  {
    label: 'Arkansas',
    value: 'AR',
  },
  {
    label: 'California',
    value: 'CA',
  },
  {
    label: 'Colorado',
    value: 'CO',
  },
  {
    label: 'Connecticut',
    value: 'CT',
  },
  {
    label: 'Delaware',
    value: 'DE',
  },
  {
    label: 'District Of Columbia',
    value: 'DC',
  },
  {
    label: 'Federated States Of Micronesia',
    value: 'FM',
  },
  {
    label: 'Florida',
    value: 'FL',
  },
  {
    label: 'Georgia',
    value: 'GA',
  },
  {
    label: 'Guam',
    value: 'GU',
  },
  {
    label: 'Hawaii',
    value: 'HI',
  },
  {
    label: 'Idaho',
    value: 'ID',
  },
  {
    label: 'Illinois',
    value: 'IL',
  },
  {
    label: 'Indiana',
    value: 'IN',
  },
  {
    label: 'Iowa',
    value: 'IA',
  },
  {
    label: 'Kansas',
    value: 'KS',
  },
  {
    label: 'Kentucky',
    value: 'KY',
  },
  {
    label: 'Louisiana',
    value: 'LA',
  },
  {
    label: 'Maine',
    value: 'ME',
  },
  {
    label: 'Marshall Islands',
    value: 'MH',
  },
  {
    label: 'Maryland',
    value: 'MD',
  },
  {
    label: 'Massachusetts',
    value: 'MA',
  },
  {
    label: 'Michigan',
    value: 'MI',
  },
  {
    label: 'Minnesota',
    value: 'MN',
  },
  {
    label: 'Mississippi',
    value: 'MS',
  },
  {
    label: 'Missouri',
    value: 'MO',
  },
  {
    label: 'Montana',
    value: 'MT',
  },
  {
    label: 'Nebraska',
    value: 'NE',
  },
  {
    label: 'Nevada',
    value: 'NV',
  },
  {
    label: 'New Hampshire',
    value: 'NH',
  },
  {
    label: 'New Jersey',
    value: 'NJ',
  },
  {
    label: 'New Mexico',
    value: 'NM',
  },
  {
    label: 'New York',
    value: 'NY',
  },
  {
    label: 'North Carolina',
    value: 'NC',
  },
  {
    label: 'North Dakota',
    value: 'ND',
  },
  {
    label: 'Northern Mariana Islands',
    value: 'MP',
  },
  {
    label: 'Ohio',
    value: 'OH',
  },
  {
    label: 'Oklahoma',
    value: 'OK',
  },
  {
    label: 'Oregon',
    value: 'OR',
  },
  {
    label: 'Palau',
    value: 'PW',
  },
  {
    label: 'Pennsylvania',
    value: 'PA',
  },
  {
    label: 'Puerto Rico',
    value: 'PR',
  },
  {
    label: 'Rhode Island',
    value: 'RI',
  },
  {
    label: 'South Carolina',
    value: 'SC',
  },
  {
    label: 'South Dakota',
    value: 'SD',
  },
  {
    label: 'Tennessee',
    value: 'TN',
  },
  {
    label: 'Texas',
    value: 'TX',
  },
  {
    label: 'Utah',
    value: 'UT',
  },
  {
    label: 'Vermont',
    value: 'VT',
  },
  {
    label: 'Virgin Islands',
    value: 'VI',
  },
  {
    label: 'Virginia',
    value: 'VA',
  },
  {
    label: 'Washington',
    value: 'WA',
  },
  {
    label: 'West Virginia',
    value: 'WV',
  },
  {
    label: 'Wisconsin',
    value: 'WI',
  },
  {
    label: 'Wyoming',
    value: 'WY',
  },
  {
    label: 'Other',
    value: 'Other',
  },
];

export const MESSAGE_EMAIL_VERIFICATION_SUCCESS =
  'A verification link has been emailed to you. Please use the link to verify your student email.';
