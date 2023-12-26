import moment from 'moment-timezone';

export const getUserTimeZoneAbbreviation = () => {
  // Get the current date and time
  const now = moment();

  // Get the user's timezone abbreviation
  const timeZoneAbbreviation = now.tz(moment.tz.guess()).format('z');

  return timeZoneAbbreviation;
};
