export const tConvert = (time, showLowerCase = false) => {
  // Check correct time format and split into components
  if (!time) {
    return '';
  }
  time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [
    time,
  ];

  if (time.length > 1) {
    // If time format correct
    time = time.slice(1); // Remove full string match value
    time[3] = '';
    if (showLowerCase) {
      time[5] = +time[0] < 12 ? 'am' : 'pm'; // Set AM/PM
    } else {
      time[5] = +time[0] < 12 ? ' AM' : ' PM'; // Set AM/PM
    }
    time[0] = +time[0] % 12 || 12; // Adjust hours
  }
  return time.join(''); // return adjusted time or original string
};
