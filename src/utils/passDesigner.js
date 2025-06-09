/**
 * Pass Designer Utility
 * Helps create beautiful and consistent wallet pass designs
 */

// Art of Living brand colors
export const AOL_COLORS = {
  primary: '#4CAF50', // Art of Living green
  secondary: '#2E7D32', // Darker green
  accent: '#81C784', // Light green
  white: '#FFFFFF',
  black: '#000000',
  gray: '#757575',
  lightGray: '#E0E0E0',
};

// Course type specific colors
export const COURSE_COLORS = {
  SKY_BREATH_MEDITATION: {
    primary: '#4CAF50',
    secondary: '#2E7D32',
    hero: 'https://www.artofliving.org/sites/www.artofliving.org/files/styles/header_image_style/public/field/image/breathing_techniques_2.jpg',
  },
  SAHAJ_SAMADHI_MEDITATION: {
    primary: '#3F51B5',
    secondary: '#1A237E',
    hero: 'https://www.artofliving.org/sites/www.artofliving.org/files/styles/header_image_style/public/field/image/meditation_course.jpg',
  },
  SILENT_RETREAT: {
    primary: '#9C27B0',
    secondary: '#4A148C',
    hero: 'https://www.artofliving.org/sites/www.artofliving.org/files/styles/header_image_style/public/field/image/silent_retreat.jpg',
  },
  default: {
    primary: '#4CAF50',
    secondary: '#2E7D32',
    hero: 'https://www.artofliving.org/sites/www.artofliving.org/files/styles/header_image_style/public/field/image/breathing_techniques_2.jpg',
  },
};

/**
 * Gets the appropriate color scheme for a course type
 */
export const getCourseColors = (productTypeId) => {
  // Sky Breath Meditation courses
  if (['811569', '811570', '1001309', '1008432'].includes(productTypeId)) {
    return COURSE_COLORS.SKY_BREATH_MEDITATION;
  }

  // Sahaj Samadhi Meditation courses
  if (['999649', '435714'].includes(productTypeId)) {
    return COURSE_COLORS.SAHAJ_SAMADHI_MEDITATION;
  }

  // Silent Retreat courses
  if (['12371', '12415'].includes(productTypeId)) {
    return COURSE_COLORS.SILENT_RETREAT;
  }

  return COURSE_COLORS.default;
};

/**
 * Generates Apple Wallet pass styling
 */
export const getAppleWalletStyle = (passData) => {
  const colors = getCourseColors(passData.productTypeId);

  return {
    backgroundColor: `rgb(${hexToRgb(colors.primary)})`,
    foregroundColor: AOL_COLORS.white,
    labelColor: AOL_COLORS.white,
    logoText: 'Art of Living',
    relevantDate: passData.startDate || new Date().toISOString(),
    locations:
      passData.mode === 'IN_PERSON'
        ? [
            {
              longitude: -122.3, // Default coords, should be updated with actual location
              latitude: 37.6,
              relevantText: `Welcome to your ${passData.title}!`,
            },
          ]
        : [],
  };
};

/**
 * Generates Google Pay pass styling
 */
export const getGooglePayStyle = (passData) => {
  const colors = getCourseColors(passData.productTypeId);

  return {
    hexBackgroundColor: colors.primary,
    heroImage: {
      sourceUri: {
        uri: colors.hero,
      },
      contentDescription: {
        defaultValue: {
          language: 'en',
          value: passData.title,
        },
      },
    },
    logo: {
      sourceUri: {
        uri: 'https://www.artofliving.org/sites/www.artofliving.org/files/aol_logo_0.png',
      },
      contentDescription: {
        defaultValue: {
          language: 'en',
          value: 'Art of Living Foundation',
        },
      },
    },
    callToActionText: {
      defaultValue: {
        language: 'en',
        value: 'Show QR code for attendance',
      },
    },
  };
};

/**
 * Converts hex color to RGB string
 */
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `${r}, ${g}, ${b}`;
  }
  return '76, 175, 80'; // Default green
};

/**
 * Creates beautiful pass field layouts
 */
export const createPassLayout = (passData) => {
  const layout = {
    header: {
      title: passData.title,
      subtitle: 'Course Registration',
    },
    primary: [
      {
        key: 'course_name',
        label: '',
        value: passData.title,
        textAlignment: 'PKTextAlignmentCenter',
      },
    ],
    secondary: [],
    auxiliary: [],
    back: [],
  };

  // Add attendee name if available
  if (passData.attendeeName) {
    layout.secondary.push({
      key: 'attendee',
      label: 'Participant',
      value: passData.attendeeName,
      textAlignment: 'PKTextAlignmentLeft',
    });
  }

  // Add dates if available
  if (passData.formattedStartDate && passData.formattedEndDate) {
    layout.secondary.push({
      key: 'dates',
      label: 'Course Dates',
      value: `${passData.formattedStartDate} - ${passData.formattedEndDate}`,
      textAlignment: 'PKTextAlignmentRight',
    });
  }

  // Add location
  if (passData.location && passData.location !== 'Online') {
    layout.auxiliary.push({
      key: 'location',
      label: 'Location',
      value: passData.location,
      textAlignment: 'PKTextAlignmentLeft',
    });
  } else if (passData.mode === 'ONLINE') {
    layout.auxiliary.push({
      key: 'location',
      label: 'Format',
      value: 'Online Course',
      textAlignment: 'PKTextAlignmentLeft',
    });
  }

  // Add instructor
  if (passData.instructor) {
    layout.auxiliary.push({
      key: 'instructor',
      label: 'Instructor',
      value: passData.instructor,
      textAlignment: 'PKTextAlignmentRight',
    });
  }

  // Back fields with detailed information
  layout.back = [
    {
      key: 'order_number',
      label: 'Registration Number',
      value: passData.orderNumber,
    },
    {
      key: 'participant_email',
      label: 'Email',
      value: passData.attendeeEmail,
    },
    {
      key: 'organization',
      label: 'Organization',
      value: passData.organizationName,
    },
  ];

  // Add schedule if available
  if (passData.timings && passData.timings.length > 0) {
    const scheduleText = passData.timings
      .map(
        (timing) =>
          `${new Date(timing.startDate).toLocaleDateString()}: ${timing.startTime} - ${timing.endTime}`,
      )
      .join('\n');

    layout.back.push({
      key: 'schedule',
      label: 'Schedule',
      value: scheduleText,
    });
  }

  // Add course description
  layout.back.push({
    key: 'description',
    label: 'About',
    value: `Join us for this transformative ${passData.title} experience. This pass contains your QR code for attendance verification.`,
  });

  return layout;
};

/**
 * Creates Google Pay text modules
 */
export const createGooglePayModules = (passData) => {
  const modules = [];

  // Course dates
  if (passData.formattedStartDate && passData.formattedEndDate) {
    modules.push({
      header: 'COURSE DATES',
      body: `${passData.formattedStartDate} - ${passData.formattedEndDate}`,
      id: 'dates',
    });
  }

  // Location
  if (passData.location) {
    modules.push({
      header: passData.mode === 'ONLINE' ? 'FORMAT' : 'LOCATION',
      body: passData.location,
      id: 'location',
    });
  }

  // Instructor
  if (passData.instructor) {
    modules.push({
      header: 'INSTRUCTOR',
      body: passData.instructor,
      id: 'instructor',
    });
  }

  // Registration info
  modules.push({
    header: 'REGISTRATION',
    body: `Order: ${passData.orderNumber}\nEmail: ${passData.attendeeEmail}`,
    id: 'registration',
  });

  return modules;
};
