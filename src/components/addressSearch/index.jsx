/* eslint-disable no-inline-styles/no-inline-styles */
import React, { useRef, useState, useEffect } from 'react';
import usePlacesService from 'react-google-autocomplete/lib/usePlacesAutocompleteService';
export const AddressSearch = ({
  showOnlyRegions = true,
  closeHandler,
  placeholder,
  parentClass = '',
  value,
}) => {
  const {
    placesService,
    placePredictions,
    getPlacePredictions,
    isPlacePredictionsLoading,
  } = usePlacesService({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY,
    options: {
      types: showOnlyRegions ? ['(regions)'] : [],
      componentRestrictions: { country: 'us' },
      fields: [
        'address_components',
        'geometry',
        'icon',
        'name',
        'formatted_address',
      ],
      strictBounds: false,
    },
  });
  const [address, setAddress] = useState(value?.locationName || '');
  const [isReadyForSelection, setReadyForSelection] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleChange = (address) => {
    setReadyForSelection(true);
    setAddress(address);
  };

  const renderItem = (placePrediction) => {
    const { structured_formatting } = placePrediction;
    return (
      <>
        <div
          class="suggestion-item smart-input--list-item"
          role="option"
          aria-selected="false"
          onClick={selectAddressAction(placePrediction)}
        >
          <strong>{structured_formatting.main_text}</strong>{' '}
          <small>{structured_formatting.secondary_text}</small>
        </div>
      </>
    );
  };

  const selectAddressAction = (item) => async () => {
    try {
      setReadyForSelection(false);
      setAddress(item.description);
      placesService?.getDetails(
        {
          fields: showOnlyRegions
            ? ['geometry']
            : ['geometry', 'address_components', 'formatted_address'],
          placeId: item.place_id,
        },
        (placeDetails) => {
          closeHandler({
            lat: placeDetails.geometry.location.lat(),
            lng: placeDetails.geometry.location.lng(),
            locationName: showOnlyRegions
              ? item.description
              : placeDetails.formatted_address,
          })();
        },
      );
    } catch (error) {
      console.log(error); // eslint-disable-line no-console
    }
  };

  return (
    <>
      <div className="smart-input">
        <input
          ref={inputRef}
          className={[`custom-input tw-mx-auto tw-mb-0 tw-mt-1 ${parentClass}`]}
          value={address}
          onChange={(evt) => {
            getPlacePredictions({ input: evt.target.value });
            handleChange(evt.target.value);
          }}
          placeholder={placeholder}
          loading={isPlacePredictionsLoading}
        />

        <div
          style={{
            zIndex: 9,
          }}
          className="result-list"
        >
          {!isPlacePredictionsLoading &&
            isReadyForSelection &&
            placePredictions.map(renderItem)}
        </div>
      </div>
    </>
  );
};
