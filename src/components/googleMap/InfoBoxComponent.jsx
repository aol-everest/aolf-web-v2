import React, { useEffect, useState } from 'react';
import { createCompleteAddress, joinPhoneNumbers } from '@utils';

const InfoBoxComponent = (center) => {
  // eslint-disable-next-line react/display-name
  return (props) => {
    const phoneNumber = joinPhoneNumbers(center.phone1, center.phone2);
    return (
      <div id="content">
        <h1 className="mapInfoTitle">{center.centerName}</h1>
        <div id="bodyContent">
          {center.centerMode === 'InPerson' && (
            <div className="mapInfoaddress">
              {createCompleteAddress({
                streetAddress1: center.streetAddress1,
                streetAddress2: center.streetAddress2,
                city: center.city,
                zipCode: center.postalOrZipCode,
                state: center.stateProvince,
              })}
            </div>
          )}
          {phoneNumber && (
            <div className="mapInfoLine">
              <img
                className="icon"
                src="/img/map-search-call-icon.svg"
                alt="call"
              />
              {phoneNumber}
            </div>
          )}
          {center.email && (
            <div className="mapInfoLine">
              <img
                className="icon"
                src="/img/map-search-email-icon.svg"
                alt="email"
              />
              {center.email}
            </div>
          )}
        </div>
      </div>
    );
  };
};

export default InfoBoxComponent;
