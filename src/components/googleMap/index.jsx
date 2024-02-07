import React, { useEffect, useState } from 'react';
import { GoogleMap, withScriptjs, withGoogleMap } from 'react-google-maps';
import { createBreakpoint } from 'react-use';
import MarkerComponent from './MarkerComponent';
import InfoBoxComponent from './InfoBoxComponent';

const useBreakpoint = createBreakpoint({ XL: 1280, L: 768, S: 350 });

const GoogleMapComponent = ({ allCenters }) => {
  const breakpoint = useBreakpoint();
  const [selectedMarker, setSelectedMarker] = useState();
  const iconBase = '/img/';
  const features = allCenters
    ? allCenters
        .filter(
          (center) =>
            center.geoLocationLatitude !== null &&
            center.geoLocationLongitude !== null,
        )
        .map((center) => {
          return {
            position: {
              lat: center.geoLocationLatitude,
              lng: center.geoLocationLongitude,
            },
            title: center.centerName,
            icon:
              iconBase +
              (center.isNationalCenter ? 'map-pin2.svg' : 'map-pin1.svg'),
            InfoWindowContent: InfoBoxComponent(center),
            data: center,
            sfid: center.sfid,
          };
        })
    : [];

  let position = { lat: 43.4142989, lng: -124.2301242 };
  let zoom = 4;

  if (breakpoint === 'S') {
    position = { lat: 40.49983925459706, lng: -101.63480276952534 };
    zoom = 3;
  }

  return (
    <GoogleMap
      defaultZoom={zoom}
      defaultCenter={position}
      defaultOptions={{ mapTypeControl: false }}
    >
      {/* <InfoWindow>Hello</InfoWindow> */}
      {features.map((feature) => {
        return (
          <MarkerComponent
            key={feature.sfid}
            {...feature}
            selectedMarker={selectedMarker}
            setSelectedMarker={setSelectedMarker}
          ></MarkerComponent>
        );
      })}
    </GoogleMap>
  );
};

export default withScriptjs(withGoogleMap(GoogleMapComponent));
