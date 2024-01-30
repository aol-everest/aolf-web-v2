import React, { useEffect, useState } from 'react';
const InfoBoxComponent = (props) => {
  return (
    <div id="content">
      <h1 class="mapInfoTitle">New York</h1>
      <div id="bodyContent">
        <div class="mapInfoaddress">
          1901 Thornridge Cir. Shiloh, Hawaii 81063
        </div>
        <div class="mapInfoLine">
          <img class="icon" src="/img/map-search-call-icon.svg" alt="call" />
          (808) 555-0111
        </div>
        <div class="mapInfoLine">
          <img class="icon" src="/img/map-search-email-icon.svg" alt="email" />
          felicia.reid@example.com
        </div>
      </div>
    </div>
  );
};

export default InfoBoxComponent;
