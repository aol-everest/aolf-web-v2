/* eslint-disable no-inline-styles/no-inline-styles */
import { Loader } from '@googlemaps/js-api-loader';
import { getZipCodeByLatLang } from '@utils';
import { useEffect, useRef, useState } from 'react';
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from 'react-places-autocomplete';

// const scriptOptions = {
//   googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY,
//   libraries: ["places"],
// };

export const AddressSearch = ({
  filter,
  closeHandler,
  placeholder,
  parentClass = '',
  listClassName = '',
  isDefaultLocation = false,
}) => {
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const handleChange = (address) => {
    setAddress(address);
  };

  const handleSelect = async (selected) => {
    try {
      setAddress(selected);
      const res = await geocodeByAddress(selected);
      const [locationResult] = res;
      const { lat, lng } = await getLatLng(locationResult);
      const zipCode = await getZipCodeByLatLang(lat, lng);

      closeHandler({
        lat,
        lng,
        locationName: locationResult.formatted_address,
        zipCode: zipCode,
      })();
    } catch (error) {
      console.log(error); // eslint-disable-line no-console
    }
  };

  return (
    <>
      {!isLoading && (
        <PlacesAutocomplete
          value={address}
          onChange={handleChange}
          onSelect={handleSelect}
          searchOptions={{
            types: ['(regions)'],
            componentRestrictions: { country: 'us' },
          }}
        >
          {({
            getInputProps,
            suggestions,
            getSuggestionItemProps,
            loading,
          }) => (
            <div className="smart-input">
              <input
                className={[
                  `custom-input tw-mx-auto tw-mb-0 tw-mt-1 !tw-w-[85%] ${parentClass}`,
                ]}
                {...getInputProps({
                  placeholder,
                })}
              />

              {suggestions.length > 0 && (
                <div style={{ zIndex: 9 }} className={listClassName}>
                  {suggestions.map((suggestion) => {
                    const className = suggestion.active
                      ? 'suggestion-item--active smart-input--list-item'
                      : 'suggestion-item smart-input--list-item';
                    // inline style for demonstration purpose
                    const style = suggestion.active
                      ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                      : { backgroundColor: '#ffffff', cursor: 'pointer' };
                    return (
                      <>
                        <div
                          {...getSuggestionItemProps(suggestion, {
                            className,
                            style,
                          })}
                        >
                          <strong>
                            {suggestion.formattedSuggestion.mainText}
                          </strong>{' '}
                          <small>
                            {suggestion.formattedSuggestion.secondaryText}
                          </small>
                        </div>
                      </>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </PlacesAutocomplete>
      )}
    </>
  );
};
