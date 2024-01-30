import React, { useEffect, useState } from 'react';
import { GoogleMap, withScriptjs, withGoogleMap } from 'react-google-maps';
import MarkerComponent from './MarkerComponent';
import InfoBoxComponent from './InfoBoxComponent';

const GoogleMapComponent = ({ allCenters }) => {
  const [selectedMarker, setSelectedMarker] = useState();
  const iconBase = '/img/';
  const features = allCenters
    ? allCenters.map((center) => {
        return {
          position: {
            lat: center.geoLocationLatitude,
            lng: center.geoLocationLongitude,
          },
          title: center.centerName,
          icon: iconBase + 'map-pin1.svg',
          InfoWindowContent: InfoBoxComponent(center),
          data: center,
        };
      })
    : [];

  return (
    <GoogleMap
      defaultZoom={4}
      defaultCenter={{ lat: 43.4142989, lng: -124.2301242 }}
      defaultOptions={{ mapTypeControl: false }}
    >
      {/* <InfoWindow>Hello</InfoWindow> */}
      {features.map((feature) => {
        return (
          <>
            <MarkerComponent
              {...feature}
              selectedMarker={selectedMarker}
              setSelectedMarker={setSelectedMarker}
            ></MarkerComponent>
          </>
        );
      })}
    </GoogleMap>
  );
};

export default withScriptjs(withGoogleMap(GoogleMapComponent));
