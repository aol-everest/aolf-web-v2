/* eslint-disable no-useless-escape */
import { COURSE_TYPES } from '@constants';
import dayjs from 'dayjs';

export const isSSR = !(
  typeof window !== 'undefined' && window.document?.createElement
);

export const getRefElement = (element) => {
  if (element && 'current' in element) {
    return element.current;
  }
  return element;
};

export const secondsToHms = (d) => {
  d = Number(d);
  const h = Math.floor(d / 3600);
  const m = Math.floor((d % 3600) / 60);
  const s = Math.floor((d % 3600) % 60);

  const hDisplay = h > 0 ? h + (h == 1 ? ' hr ' : ' hrs ') : '';
  const mDisplay = m > 0 ? m + (m == 1 ? ' min ' : ' mins ') : '';
  const sDisplay = s > 0 ? s + (s == 1 ? ' second' : ' seconds') : '';
  if (h > 0 || m > 0 || s > 0) {
    return hDisplay + mDisplay + sDisplay;
  } else {
    return '0 second';
  }
};

export const calculateBusinessDays = (d1, d2) => {
  const days = d2.diff(d1, 'days') + 1;
  const result = { weekday: [], weekend: [] };
  let newDay = d1;
  for (let i = 0; i < days; i++) {
    const day = newDay.day();
    const isWeekend = day === 0 || day === 6;
    if (!isWeekend) {
      result.weekday = [...result.weekday, d1.format('ddd')];
    } else {
      result.weekend = [...result.weekend, d1.format('ddd')];
    }
    newDay = d1.add(1, 'days');
  }

  result.weekday = Array.from(new Set(result.weekday));
  result.weekend = Array.from(new Set(result.weekend));
  if (result.weekday.length >= 2) {
    result.weekday = `(${result.weekday[0]} - ${
      result.weekday[result.weekday.length - 1]
    })`;
  } else if (result.weekday.length > 0) {
    result.weekday = `(${result.weekday.join(', ')})`;
  }
  return {
    weekday: result.weekday,
    weekend: result.weekend.length > 0 ? `(${result.weekend.join(', ')})` : '',
  };
};

export const stringToBoolean = (string) => {
  switch (string.toLowerCase().trim()) {
    case 'true':
    case 'yes':
    case '1':
      return true;

    case 'false':
    case 'no':
    case '0':
    case null:
      return false;

    default:
      return Boolean(string);
  }
};

export const phoneRegExp = /^\+?\d{1,4}\s?(\(\d{1,}\))?[0-9\-.\s]{8,}$/;

export const emailRegExp =
  /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;

export const isEmpty = (obj) => {
  if (typeof obj === 'object' && obj != null) {
    return Object.keys(obj).length >= 1 ? false : true;
  }
  return true;
};

export const findCourseTypeByKey = (key) => {
  // First, check if the key matches a course name
  for (const courseKey in COURSE_TYPES) {
    if (courseKey === key) {
      return COURSE_TYPES[courseKey];
    }
  }

  // If no match is found, check if the key matches a course code
  for (const courseKey in COURSE_TYPES) {
    if (COURSE_TYPES[courseKey].code === key) {
      return COURSE_TYPES[courseKey];
    }
  }

  return null; // Return null if no match is found
};

export const findCourseTypeBySlug = (slug) => {
  // First, check if the key matches a course name
  for (const courseKey in COURSE_TYPES) {
    if (courseKey === slug) {
      return COURSE_TYPES[courseKey];
    }
  }

  // If no match is found, check if the key matches a course code
  for (const courseKey in COURSE_TYPES) {
    if (COURSE_TYPES[courseKey].slug === slug) {
      return COURSE_TYPES[courseKey];
    }
  }

  return null; // Return null if no match is found
};

export const getZipCodeByLatLang = async (lat, lng) => {
  const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}`;
  const data = await fetch(apiUrl);
  const result = await data.json();
  if (result.status === 'OK') {
    // Extract the address components
    const addressComponents = result.results[0].address_components;

    // Find the component with the 'postal_code' type
    const postalCodeComponent = addressComponents.find((component) =>
      component.types.includes('postal_code'),
    );

    // Get the zipcode
    const zipcode = postalCodeComponent ? postalCodeComponent.short_name : '';

    return zipcode;
  } else {
    console.error('Error:', result.status);
    return null;
  }
};

export const parsedAddress = (address) => {
  if (!address) {
    return {};
  }
  // Initialize variables
  let city = '';
  let state = '';
  let zip = '';
  let country = '';
  let street = '';

  // Split by comma to get different parts
  const parts = address.split(',').map((part) => part.trim());

  if (parts.length === 3) {
    // Case: "City, State ZIP, Country"
    [city, state] = parts[0].includes(' ') ? [parts[0], parts[1]] : parts;
    country = parts[2];

    // Separate state and ZIP if ZIP is present
    const stateZip = state.split(' ');
    if (stateZip.length === 2) {
      state = stateZip[0];
      zip = stateZip[1];
    }
  } else if (parts.length === 4) {
    // Case: "Street, City, State ZIP, Country"
    [street, city, state] = parts.slice(0, 3);
    country = parts[3];

    // Separate state and ZIP if ZIP is present
    const stateZip = state.split(' ');
    if (stateZip.length === 2) {
      state = stateZip[0];
      zip = stateZip[1];
    }
  }

  return {
    street,
    city,
    state,
    zip,
    country,
  };
};

export const getLatLangByZipCode = async (zipCode) => {
  const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}`;
  const data = await fetch(apiUrl);
  const result = await data.json();
  if (result.status === 'OK') {
    const finalData = result.results[0];
    if (finalData) {
      const locationName = finalData.formatted_address;
      const location = finalData.geometry.location;
      const latitude = location.lat;
      const longitude = location.lng;
      return { lat: latitude, lng: longitude, locationName };
    }
  } else {
    console.error('Error:', result.status);
    return null;
  }
};

export const createCompleteAddress = ({
  streetAddress1,
  streetAddress2,
  city,
  state,
  zipCode,
  country,
}) => {
  // Start with an empty array to store the address components
  let addressComponents = [];

  // Add non-empty address components to the array
  if (streetAddress1) {
    addressComponents.push(streetAddress1);
  }

  if (streetAddress2) {
    addressComponents.push(streetAddress2);
  }

  if (city) {
    addressComponents.push(city);
  }

  if (state) {
    addressComponents.push(state);
  }

  if (zipCode) {
    addressComponents.push(zipCode);
  }

  if (country) {
    addressComponents.push(country);
  }

  // Join the address components with a comma and space to create the complete address
  const completeAddress = addressComponents.join(', ');

  return completeAddress;
};

export const joinPhoneNumbers = (...phoneNumbers) => {
  // Filter out null or empty phone numbers
  const validNumbers = phoneNumbers.filter(
    (number) => number !== null && number !== '',
  );

  // Check if there are any valid phone numbers provided
  if (validNumbers.length === 0) {
    return null;
  }

  // Format each valid phone number and join them with "/"
  const formattedNumbers = validNumbers.join(' / ');

  return formattedNumbers;
};

export const concatenateStrings = (stringArray, joinChar = ', ') => {
  if (!Array.isArray(stringArray)) {
    throw new Error('Input must be an array of strings');
  }

  return stringArray
    .filter((str) => str !== null && str !== undefined) // Filter out null or undefined values
    .join(joinChar);
};

export const findExistingQuestionnaire = (
  totalSelectedOptions,
  currentStepData,
  selectedIdsLocal,
) => {
  const updatedOptions = [...totalSelectedOptions];
  const existingOptionIndex = updatedOptions.findIndex(
    (option) => option.questionSfid === currentStepData?.questionSfid,
  );

  if (existingOptionIndex !== -1) {
    updatedOptions.splice(existingOptionIndex, 1);
  }
  updatedOptions.push({
    questionSfid: currentStepData?.questionSfid,
    answer: selectedIdsLocal,
  });
  return updatedOptions;
};

export const convertToUpperCaseAndReplaceSpacesForURL = (inputText) => {
  // Convert input text to uppercase
  // const upperCaseText = inputText.toUpperCase();

  // Replace spaces with underscores
  const resultText = inputText.replace(/\s+/g, '_');

  // Encode the result for use in a URL parameter
  const encodedResult = encodeURIComponent(resultText);

  return encodedResult;
};

export function trimAndSplitName(name) {
  let [firstName, ...lastNameParts] = name.trim().split(/\s+/);
  let lastName = lastNameParts.join(' ');
  return [firstName, lastName];
}

export const formatDateRange = (dates) => {
  // Parse the first and last date in the array
  const startDate = dayjs(dates[0]);
  const endDate = dayjs(dates[dates.length - 1]);
  const bothDateMonthSame = dayjs
    .utc(startDate)
    .isSame(dayjs.utc(endDate), 'month');

  // Format the start and end dates
  const formattedStartDate = startDate.format('MMMM DD');
  const formattedEndDate = bothDateMonthSame
    ? endDate.format('DD')
    : endDate.format('MMMM DD');

  // Combine formatted dates with PT
  const formattedDateRange = `${formattedStartDate}-${formattedEndDate}, ${startDate.year()}`;

  return formattedDateRange;
};

export const findSlugByProductTypeId = (productTypeId) => {
  for (const courseKey in COURSE_TYPES) {
    const course = COURSE_TYPES[courseKey];
    if (course.value.indexOf(productTypeId) >= 0) {
      return course.slug;
    }
  }
  return 'art-of-living-part-1';
};

export function getFullPathWithQueryParams(router) {
  const { pathname, query } = router;

  // Replace dynamic segments ([id]) in the pathname with their actual values
  const resolvedPathname = Object.keys(query).reduce((path, key) => {
    return path.replace(`[${key}]`, query[key]);
  }, pathname);

  // Combine the resolved pathname and query parameters
  const fullPath = `${resolvedPathname}${Object.keys(query).length > 0 ? '?' + new URLSearchParams(query).toString() : ''}`;

  return fullPath;
}

export function navigateToLogin(router, next) {
  router.push({
    pathname: '/us-en/signin',
    query: {
      next: next || getFullPathWithQueryParams(router),
    },
  });
}
export const truncateString = (str) => {
  const words = str.split(' ');

  if (words.length > 21) {
    return words.slice(0, 21).join(' ') + '...';
  }

  return str;
};

export const extractVideoId = (url) => {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

export const extractFacebookVideoId = (url) => {
  const urlObj = new URL(url);
  return urlObj.searchParams.get('v');
};

export const extractInstagramVideoId = (url) => {
  const regex = /\/p\/([a-zA-Z0-9_-]+)\//;
  const match = url.match(regex);
  return match ? match[1] : null;
};

/**
 * Tests provided UserAgent against Known Mobile User Agents
 * @returns {bool} isMobileDevice
 */
export const isMobile = () =>
  new RegExp('Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile').test(
    window.navigator.userAgent || window.navigator.vendor || window.opera,
  );

export const isMobileOrTablet = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    userAgent,
  );
};

export const askGurudevQuestions = () => {
  return [
    {
      name: 'Anger',
      questions: [
        'How to overcome frustration?',
        'How to handle anger?',
        'What can you do when anger rises in you?',
        'Why should you make your anger expensive?',
        'What are practical tips to control anger?',
      ],
    },
    {
      name: 'Anxiety',
      questions: [
        'How to get over anxiety?',
        'How do you navigate turbulent times in life?',
        'What are practical tips to manage stress and anxiety?',
        'How to clear your mind of negative thoughts?',
      ],
    },
    {
      name: 'Career',
      questions: [
        'What are the different types of wealth?',
        'What determines how much wealth one accumulates in life?',
        'What percentage of success is luck?',
        'What is the shortcut to success?',
        'How to choose the best career path?',
        'How to balance spiritual and career growth?',
        'How to deal with losing a job?',
      ],
    },
    {
      name: 'Death',
      questions: [
        'What happens at the time of death?',
        'What is reincarnation?',
        'How to overcome the fear of death?',
        'What happens after death?',
        'How to cope with the fear of losing the people you love?',
      ],
    },
    {
      name: 'Desire',
      questions: [
        "What's the secret to manifesting desires?",
        'How to manage your desires?',
        'What happens when you take your mind away from the little desires and thoughts that disturb you?',
        'Should you have desires?',
        'How to deal with unfulfilled desires?',
      ],
    },
    {
      name: 'Devotion',
      questions: [
        'What is the power of prayer?',
        'What is Guru Purnima?',
        'What is the Guru principle?',
        'What is the value of chanting mantras?',
        'How should you pray to God?',
        'How do we balance our material and spiritual lives?',
      ],
    },
    {
      name: 'Divine',
      questions: [
        'What is Guru Tattva?',
        'What is a Guru?',
        'Why do you need a Guru in your life?',
        'Where is the divine?',
        'What is divine love?',
      ],
    },
    {
      name: 'Emotions',
      questions: [
        'How to handle negative emotions?',
        'How to not let things bother you?',
        'How to keep an open mind?',
        'How to be free from the storm of emotions?',
        'How to get rid of unwanted thoughts?',
      ],
    },
    {
      name: 'Failure',
      questions: [
        'How do you overcome the fear of failure?',
        'How to succeed after many failures?',
        'How can you become professionally successful?',
        'Why is it important to embrace failure?',
        'How to deal with setbacks in life?',
      ],
    },
    {
      name: 'Faith',
      questions: [
        'Why is faith important?',
        'What is faith?',
        'Who should you have faith in?',
        'How to eliminate doubt?',
        'How to keep faith during difficult times in life?',
      ],
    },
    {
      name: 'Fear',
      questions: [
        'How to overcome fear of the future?',
        'How to overcome the fear of getting hurt?',
        'What is the purpose of fear?',
        "What's the secret to understanding fears?",
        'What is the cause of fear?',
        'Why do 85% of fears never come true?',
      ],
    },
    {
      name: 'Gratitude',
      questions: [
        'How can you get more grace in life?',
        'How do you become more grateful?',
        'What is grace?',
        'How to stop complaining?',
      ],
    },
    {
      name: 'Happiness',
      questions: [
        'How to always be happy?',
        'What is the formula for happiness?',
        'How to live in the present moment?',
        'How to find unshakeable peace and happiness?',
        'How to be happy through difficult times?',
        'How to develop a habit of being happy?',
        'How to achieve inner peace?',
        'What are some practical tips to living a happy life?',
        'How can you make the people around you happy?',
      ],
    },
    {
      name: 'Health',
      questions: [
        'What are signs of good health?',
        'What are some tips for healthier living?',
        'How can you stay healthy?',
        'How to prevent disease?',
        'What is the ancient secret for good health?',
      ],
    },
    {
      name: 'Karma',
      questions: [
        'How to get rid of negative karma?',
        'What to do when someone blames you?',
        'What are the different types of karma?',
        'What is karma?',
        'Does everything happen as a result of karma?',
        'What is enlightenment?',
        'How can you become enlightened?',
      ],
    },
    {
      name: 'Life',
      questions: [
        'What is the purpose of my life?',
        'What is the meaning of life?',
        'What is the monkey mind?',
        'Is it possible to choose what you become in your next life?',
        'How to live in the present moment?',
        'How to give 100% to everything in life?',
        'How to attain liberation?',
      ],
    },
    {
      name: 'Love',
      questions: [
        'What is love?',
        'Why do we run away from love?',
        'How to increase self-love?',
        'Why do we fall in love?',
        'Why do people make mistakes if they are full of love?',
        'Why does love cease to exist after marriage?',
        'What happens when you find it difficult to attain what you are attracted to?',
        'What is the difference between love and lust?',
      ],
    },
    {
      name: 'Meditation',
      questions: [
        'What is meditation?',
        'What is enlightenment?',
        'What are the benefits of yoga?',
        'How to quiet the mind during meditation?',
      ],
    },
    {
      name: 'Mind',
      questions: [
        'How to overcome guilt?',
        'What are the natural tendencies of the mind?',
        'What is monkey mind?',
        'How to have dispassion in life?',
        'How to balance the mind?',
        'How to calm the mind and feel happy from within?',
        'What is bondage?',
        'How does the ego work?',
        'How to get rid of the ego?',
        'How to accept people and situations as they are?',
        'How to live in the present moment?',
      ],
    },
    {
      name: 'Relationships',
      questions: [
        'How to overcome the fear of commitment?',
        'How to build a healthy relationship?',
        'What are the golden rules for a successful marriage?',
        'How to be detached from relationships?',
        'How to know if this is the right relationship or person for me? ',
        'How to mend a broken heart?',
      ],
    },
    {
      name: 'SKY',
      questions: [
        'What is Sudarshan Kriya?',
        'What is the power of learning Sudarshan Kriya?',
        'How can Sudarshan Kriya benefit my mental and physical health?',
      ],
    },
    {
      name: 'Self',
      questions: [
        'How to increase self-confidence?',
        'Who am I?',
        'What is the Self?',
      ],
    },
    {
      name: 'Service',
      questions: [
        'What is the Art of Living Teacher Training program?',
        'What is seva?',
        'How can a yoga teacher inspire people?',
      ],
    },
    {
      name: 'Surrender',
      questions: [
        'How can you drop the past and move forward?',
        'How can you get rid of attachments?',
        'What is the art of letting go?',
        'What does it mean to become hollow and empty?',
        'How to surrender your desires to the divine?',
      ],
    },
  ];
};

export const breakAfterTwoWordsArray = (str) => {
  const words = str?.split(' ');
  const result = [];

  words?.reduce((acc, word, index) => {
    if (index === 0) {
      if (word.length > 8) {
        result.push(word);
      } else {
        result.push(word + (words.length > 1 ? ' ' + words[1] : ''));
      }
    } else if (index % 2 !== 0 || index === 1) {
      // Skip every second word to avoid duplication
    } else {
      result.push(
        word + (index + 1 < words.length ? ' ' + words[index + 1] : ''),
      );
    }
  }, '');

  return result;
};

export const timeConvert = (data) => {
  const minutes = data % 60;
  const hours = (data - minutes) / 60;

  return String(hours).padStart(2, 0) + ':' + String(minutes).padStart(2, 0);
};
