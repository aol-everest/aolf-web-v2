import React, { useEffect, useState } from 'react';
import { createCompleteAddress } from '@utils';

const InfoBoxComponent = (center) => {
  // eslint-disable-next-line react/display-name
  return (props) => {
    return (
      <div id="content">
        <h1 class="mapInfoTitle">{center.centerName}</h1>
        <div id="bodyContent">
          <div class="mapInfoaddress">
            {createCompleteAddress({
              streetAddress1: center.streetAddress1,
              streetAddress2: center.streetAddress2,
              city: center.city,
              zipCode: center.postalOrZipCode,
              state: center.stateProvince,
            })}
          </div>
          <div class="mapInfoLine">
            <img class="icon" src="/img/map-search-call-icon.svg" alt="call" />
            {center.phone1 || center.phone2}
          </div>
          <div class="mapInfoLine">
            <img
              class="icon"
              src="/img/map-search-email-icon.svg"
              alt="email"
            />
            {center.email}
          </div>
        </div>
      </div>
    );
  };
};

export default InfoBoxComponent;
