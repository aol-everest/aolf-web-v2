/* eslint-disable no-inline-styles/no-inline-styles */
import React, { useRef, useState, useEffect } from 'react';
import usePlacesService from 'react-google-autocomplete/lib/usePlacesAutocompleteService';
export const AddressSearchSchedulingOnline = ({
  showOnlyRegions = true,
  closeHandler,
  placeholder,
  parentClass = '',
  value,
  formikProps,
  formikKey,
  doAutoFocus = true,
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
  const [address, setAddress] = useState('');
  const [isReadyForSelection, setReadyForSelection] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current && doAutoFocus) {
      inputRef.current.focus();
      // formikProps.setFieldTouched(formikKey, true);
    }
  }, []);

  // Set initial value
  useEffect(() => {
    if (value) {
      setAddress(value);
    }
  }, [value]);

  const clearRelatedFields = () => {
    formikProps.setFieldValue('contactCity', '');
    formikProps.setFieldValue('contactZip', '');
    formikProps.setFieldValue('contactState', '');
  };

  const handleChange = (newAddress) => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }

    setReadyForSelection(true);
    setAddress(newAddress);

    // Batch the updates to prevent multiple validations
    formikProps.setValues(
      {
        ...formikProps.values,
        [formikKey]: newAddress,
        ...((!newAddress || newAddress.trim() === '') && {
          contactCity: '',
          contactZip: '',
          contactState: '',
        }),
      },
      false,
    ); // false to prevent validation
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
      const selectedAddress = item.description;
      setAddress(selectedAddress);
      // formikProps.setFieldValue(formikKey, selectedAddress);
      // formikProps.setFieldError(formikKey, undefined);
      // setAddress(item.description);
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
          className={`custom-input tw-mx-auto tw-mb-0 tw-mt-1 ${parentClass} ${
            formikProps.touched[formikKey] && formikProps.errors[formikKey]
              ? 'error'
              : ''
          }`}
          value={address}
          // onBlur={handleBlur}
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
        {formikProps.touched[formikKey] && formikProps.errors[formikKey] && (
          <div className="validation-input">
            {formikProps.errors[formikKey]}
          </div>
        )}
      </div>
    </>
  );
};
