export const getGoogleMapsUrl = (location) => {
  const {
    locationStreet,
    locationCity,
    locationProvince,
    locationPostalCode,
    locationCountry,
    streetAddress1,
    streetAddress2,
    city,
    state,
    zip,
    country,
    isLocationEmpty,
  } = location;

  if (!isLocationEmpty) {
    return `https://www.google.com/maps/search/?api=1&query=${locationStreet || ''}, ${locationCity} ${locationProvince} ${locationPostalCode} ${locationCountry}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${streetAddress1 || ''},${streetAddress2 || ''} ${city} ${state} ${zip} ${country}`;
};

export const formatAddress = (location) => {
  const {
    locationStreet,
    locationCity,
    locationProvince,
    locationPostalCode,
    streetAddress1,
    streetAddress2,
    city,
    state,
    zip,
    isLocationEmpty,
  } = location;

  if (!isLocationEmpty) {
    return (
      <>
        {locationStreet && `${locationStreet}, `}
        {locationCity || ''}
        {', '}
        {locationProvince || ''} {locationPostalCode || ''}
      </>
    );
  }

  return (
    <>
      {streetAddress1 && `${streetAddress1}, `}
      {streetAddress2 && `${streetAddress2}, `}
      {city || ''}
      {', '}
      {state || ''} {zip || ''}
    </>
  );
};
