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
