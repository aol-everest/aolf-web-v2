import React, { useEffect, useState } from 'react';
import {
  GoogleMap,
  Marker,
  withScriptjs,
  withGoogleMap,
  InfoWindow,
} from 'react-google-maps';
import MarkerComponent from './MarkerComponent';
import InfoBoxComponent from './InfoBoxComponent';

const GoogleMapComponent = () => {
  const iconBase = '/img/';
  const features = [
    {
      position: { lat: 48.826862, lng: -94.210067 },
      title: 'Boynton Pass',
      icon: iconBase + 'map-pin1.svg',
      InfoWindowContent: InfoBoxComponent,
    },
    {
      position: { lat: 44.49481, lng: -88.045968 },
      title: 'contentString',
      icon: iconBase + 'map-pin1.svg',
      InfoWindowContent: InfoBoxComponent,
    },
    {
      position: { lat: 37.911523, lng: -102.208114 },
      title: 'Red Rock Crossing',
      icon: iconBase + 'map-pin1.svg',
      InfoWindowContent: InfoBoxComponent,
    },
    {
      position: { lat: 43.357445, lng: -76.43097 },
      title: 'Bell Rock',
      icon: iconBase + 'map-pin2.svg',
      InfoWindowContent: InfoBoxComponent,
    },
  ];
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
            <MarkerComponent {...feature}></MarkerComponent>
          </>
        );
      })}
    </GoogleMap>
  );
};

export default withScriptjs(withGoogleMap(GoogleMapComponent));
