import React, { useEffect, useState } from 'react';

const createCompleteAddress = ({
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

const InfoBoxComponent = (center) => {
  // eslint-disable-next-line react/display-name
  return (props) => {
    return (
      <div id="content">
        <h1 class="mapInfoTitle">{center.city}</h1>
        <div id="bodyContent">
          <div class="mapInfoaddress">
            {createCompleteAddress({
              streetAddress1: center.streetAddress1,
              streetAddress2: center.streetAddress2,
              city: center.city,
              zipCode: center.postalOrZipCode,
              state: center.stateProvince,
              country: center.country,
            })}
          </div>
          <div class="mapInfoLine">
            <img class="icon" src="/img/map-search-call-icon.svg" alt="call" />
            {center.phone1}
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
