import React, { useEffect, useState } from 'react';
import { Marker, InfoWindow } from 'react-google-maps';

const MarkerComponent = (props) => {
  const {
    InfoWindowContent,
    selectedMarker,
    setSelectedMarker,
    data,
    ...rest
  } = props;
  const onToggleOpen = () => {
    setSelectedMarker(data.sfid);
  };

  return (
    <Marker onClick={onToggleOpen} {...rest}>
      {selectedMarker === data.sfid && (
        <InfoWindow onCloseClick={onToggleOpen}>
          <InfoWindowContent />
        </InfoWindow>
      )}
    </Marker>
  );
};

export default MarkerComponent;
