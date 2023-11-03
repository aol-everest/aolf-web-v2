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

export const COURSE_TYPES = {
  SKY_BREATH_MEDITATION: {
    name: 'Art of Living Part I',
    value: process.env.NEXT_PUBLIC_SKY_BREATH_MEDITATION_CTYPE || '',
    code: '10101000',
    subTypes: {
      Online: process.env.NEXT_PUBLIC_SKY_BREATH_MEDITATION_ONLINE_CTYPE,
      'In Person':
        process.env.NEXT_PUBLIC_SKY_BREATH_MEDITATION_IN_PERSON_CTYPE,
    },
  },
  SILENT_RETREAT: {
    name: 'Art of Living Part II',
    value: process.env.NEXT_PUBLIC_SILENT_RETREAT_CTYPE || '',
  },
  SAHAJ_SAMADHI_MEDITATION: {
    name: 'Sahaj Samadhi Meditation',
    value: process.env.NEXT_PUBLIC_SAHAJ_SAMADHI_CTYPE || '',
    code: '10102000',
    subTypes: {
      Online: process.env.NEXT_PUBLIC_SAHAJ_SAMADHI_ONLINE_CTYPE,
      'In Person': process.env.NEXT_PUBLIC_SAHAJ_SAMADHI_IN_PERSON_CTYPE,
    },
  },
  SRI_SRI_YOGA_MEDITATION: {
    name: 'Sri Sri Yoga',
    value: process.env.NEXT_PUBLIC_SRI_SRI_YOGA_CTYPE || '',
  },
  CHAKRA_KRIYA: {
    name: 'Chakra Kriya',
    value: process.env.NEXT_PUBLIC_CHAKRA_KRIYA_CTYPE || '',
  },
  VOLUNTEER_TRAINING_PROGRAM: {
    name: 'Volunteer Training Program',
    value: process.env.NEXT_PUBLIC_VOLUNTEER_TRAINING_PROGRAM_CTYPE || '',
  },
  HEALING_BREATH: {
    name: 'Healing Breath',
    value: process.env.NEXT_PUBLIC_HEALING_BREATH_CTYPE || '',
  },
  SKY_SILENT_RETREAT: {
    name: 'Silent Retreat',
    value: process.env.NEXT_PUBLIC_SKY_SILENT_RETREAT_CTYPE || '',
    code: '10305000',
    subTypes: {
      Online: process.env.NEXT_PUBLIC_SKY_SILENT_RETREAT_ONLINE_CTYPE,
      'In Person': process.env.NEXT_PUBLIC_SKY_SILENT_RETREAT_IN_PERSON_CTYPE,
    },
  },
  ART_OF_LIVING_PREMIUM_PROGRAM: {
    name: 'Art of Living Premium Program',
    value: process.env.NEXT_PUBLIC_SKY_WITH_SAHAJ_CTYPE || '',
    code: '10304000',
    subTypes: {
      Online: process.env.NEXT_PUBLIC_SKY_WITH_SAHAJ_ONLINE_CTYPE,
      'In Person': process.env.NEXT_PUBLIC_SKY_WITH_SAHAJ_IN_PERSON_CTYPE,
    },
  },
  SKY_HAPPINESS_RETREAT: {
    name: 'SKY Happiness Retreat',
    value: process.env.NEXT_PUBLIC_SKY_HAPPINESS_RETREAT_CTYPE || '',
  },
  BLESSINGS_COURSE: {
    name: 'Blessings Course',
    value: process.env.NEXT_PUBLIC_BLESSINGS_COURSE_CTYPE || '',
  },
  INSTITUTIONAL_COURSE: {
    name: 'Institutional',
    value: process.env.NEXT_PUBLIC_INSTITUTIONAL_CTYPE || '',
  },
  SKY_CAMPUS_HAPPINESS_RETREAT: {
    name: 'SKY Happiness Retreat',
    value: process.env.NEXT_PUBLIC_SKY_HAPPINESS_RETREAT_CTYPE || '',
  },
  SANYAM_COURSE: {
    name: 'Sanyam Course',
    value: process.env.NEXT_PUBLIC_SANYAM_COURSE_CTYPE || '',
  },
  MEDITATION_DELUXE_COURSE: {
    name: 'MEDITATION_DELUXE_COURSE',
    value: process.env.NEXT_PUBLIC_MEDITATION_DELUXE_CTYPE || '',
  },
  GATEWAY_TO_INFINITY_COURSE: {
    name: 'GATEWAY_TO_INFINITY_COURSE',
    value: process.env.NEXT_PUBLIC_GATEWAY_TO_INFINITY_CTYPE || '',
  },
  SRI_SRI_YOGA_DEEP_DIVE: {
    name: 'Sri Sri Yoga Deep Dive',
    value: process.env.NEXT_PUBLIC_SRI_SRI_YOGA_DEEP_DIVE_CTYPE || '',
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
