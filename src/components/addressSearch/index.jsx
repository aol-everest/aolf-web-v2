import React, { useState, useRef } from "react";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-places-autocomplete";

// const scriptOptions = {
//   googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY,
//   libraries: ["places"],
// };

export const AddressSearch = ({ filter, closeHandler, placeholder }) => {
  const [address, setAddress] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const inputEl = useRef(null);

  const handleChange = (address) => {
    setAddress(address);
  };

  const handleCloseClick = () => {
    setAddress("");
    setLatitude(null);
    setLongitude(null);
    filter({ lat: null, lng: null });
  };

  const handleSelect = async (selected) => {
    try {
      setIsGeocoding(true);
      setAddress(selected);
      const res = await geocodeByAddress(selected);
      const [locationResult] = res;
      const { lat, lng } = await getLatLng(locationResult);
      setLatitude(lat);
      setLongitude(lng);
      setIsGeocoding(false);
      // this.props.filter({ lat, lng, loactionName: locationResult.formatted_address });
      closeHandler({
        lat,
        lng,
        loactionName: locationResult.formatted_address,
      })();
    } catch (error) {
      setIsGeocoding(false);
      console.log(error); // eslint-disable-line no-console
    }
  };

  return (
    <>
      <PlacesAutocomplete
        value={address}
        onChange={handleChange}
        onSelect={handleSelect}
        searchOptions={{
          types: ["(cities)"],
          componentRestrictions: { country: "us" },
        }}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <div className="smart-input">
            <input
              className="custom-input tw-mx-auto tw-mt-1 tw-mb-0 tw-w-[85%]"
              {...getInputProps({
                placeholder,
              })}
            />
            {suggestions.length > 0 && (
              <div>
                {suggestions.map((suggestion) => {
                  const className = suggestion.active
                    ? "suggestion-item--active smart-input--list-item"
                    : "suggestion-item smart-input--list-item";
                  // inline style for demonstration purpose
                  const style = suggestion.active
                    ? { backgroundColor: "#fafafa", cursor: "pointer" }
                    : { backgroundColor: "#ffffff", cursor: "pointer" };
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
                        </strong>{" "}
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
    </>
  );
};
