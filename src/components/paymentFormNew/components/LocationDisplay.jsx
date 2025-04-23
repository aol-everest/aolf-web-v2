import React from 'react';
import { COURSE_MODES } from '@constants';
import { getGoogleMapsUrl, formatAddress } from './locationUtils';

const LocationDisplay = React.memo(({ mode, workshop }) => {
  if (mode === COURSE_MODES.ONLINE.value) {
    return mode;
  }

  if (
    mode === COURSE_MODES.IN_PERSON.value ||
    mode === COURSE_MODES.DESTINATION_RETREATS.value
  ) {
    return (
      <a href={getGoogleMapsUrl(workshop)} target="_blank" rel="noreferrer">
        {formatAddress(workshop)}
      </a>
    );
  }

  return null;
});

LocationDisplay.displayName = 'LocationDisplay';

export default LocationDisplay;
