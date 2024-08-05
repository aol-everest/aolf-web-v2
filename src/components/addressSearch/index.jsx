/* eslint-disable no-inline-styles/no-inline-styles */
import { useEffect, useRef, useState } from 'react';
import usePlacesService from 'react-google-autocomplete/lib/usePlacesAutocompleteService';
export const AddressSearch = ({
  filter,
  closeHandler,
  placeholder,
  parentClass = '',
  listClassName = '',
  isDefaultLocation = false,
}) => {
  const inputRef = useRef(null);

  const {
    placesService,
    placePredictions,
    getPlacePredictions,
    isPlacePredictionsLoading,
  } = usePlacesService({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY,
    options: {
      types: ['(regions)'],
      componentRestrictions: { country: 'us' },
    },
  });
  const [address, setAddress] = useState('');
  const [isReadyForSelection, setReadyForSelection] = useState(true);

  const handleChange = (address) => {
    setReadyForSelection(true);
    setAddress(address);
  };

  const handleSelect = async (selected) => {};

  const renderItem = (placePrediction) => {
    const { structured_formatting } = placePrediction;
    console.log(placePrediction);
    return (
      <>
        <div
          class="suggestion-item smart-input--list-item"
          role="option"
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
          fields: ['geometry'],
          placeId: item.place_id,
        },
        (placeDetails) => {
          closeHandler({
            lat: placeDetails.geometry.location.lat(),
            lng: placeDetails.geometry.location.lat(),
            locationName: item.description,
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
