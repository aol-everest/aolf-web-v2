import React, { useEffect, useState } from 'react';
import { GoogleMap, withScriptjs, withGoogleMap } from 'react-google-maps';
import MarkerComponent from './MarkerComponent';
import InfoBoxComponent from './InfoBoxComponent';

const GoogleMapComponent = ({ allCenters }) => {
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

  return (
    <GoogleMap
      defaultZoom={4}
      defaultCenter={{ lat: 43.4142989, lng: -124.2301242 }}
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
