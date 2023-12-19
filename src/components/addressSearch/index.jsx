/* eslint-disable no-inline-styles/no-inline-styles */
import { Loader } from '@googlemaps/js-api-loader';
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
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const inputEl = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loader = new Loader({
      apiKey: `${process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}`,
      version: 'weekly',
      libraries: ['places'],
    });
    loader.load().then(() => {
      setIsLoading(false);
    });
    if (isDefaultLocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        closeHandler({
          lat: position.coords.latitude.toFixed(4),
          lng: position.coords.longitude.toFixed(4),
        })();
      });
    }
  }, []);

  const handleChange = (address) => {
    console.log('address', address);
    setAddress(address);
  };

  const handleSelect = async (selected) => {
    console.log('selected', selected);
    try {
      setIsGeocoding(true);
      setAddress(selected);
      const res = await geocodeByAddress(selected);
      const [locationResult] = res;
      const { lat, lng } = await getLatLng(locationResult);
      setLatitude(lat);
      setLongitude(lng);
      setIsGeocoding(false);
      // this.props.filter({ lat, lng, locationName: locationResult.formatted_address });

      closeHandler({
        lat,
        lng,
        locationName: locationResult.formatted_address,
        zipCode: address,
      })();
    } catch (error) {
      setIsGeocoding(false);
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
            componentRestrictions: { country: 'in' },
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
