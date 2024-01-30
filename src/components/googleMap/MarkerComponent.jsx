import React, { useEffect, useState } from 'react';
import { Marker, InfoWindow } from 'react-google-maps';

const MarkerComponent = (props) => {
  const { InfoWindowContent, ...rest } = props;
  const [isOpen, setIsOpen] = useState(false);
  const onToggleOpen = () => {
    setIsOpen(!isOpen);
  };
  console.log(InfoWindowContent);

  return (
    <Marker onClick={onToggleOpen} {...rest}>
      {isOpen && (
        <InfoWindow onCloseClick={onToggleOpen}>
          <InfoWindowContent />
        </InfoWindow>
      )}
    </Marker>
  );
};

export default MarkerComponent;
